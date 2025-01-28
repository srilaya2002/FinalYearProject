from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.auth.utils import get_current_user
from app.database import get_cursor
from app.diet.storage.file_storage import load_diet_plan
import json
import os
import requests

websocket_router = APIRouter()

# Load OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set in the environment variables.")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}",
}

async def call_openai_api(prompt):
    try:
        data = {
            "model": "gpt-4",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
        }
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            data=json.dumps(data),
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return "Sorry, there was an error generating the updated diet plan."

@websocket_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None, cursor=Depends(get_cursor)):
    try:
        await websocket.accept()
        print("WebSocket connection established.")

        # Validate user
        user = get_current_user(token)
        if not user:
            await websocket.close(code=1008)
            print("Invalid user token. WebSocket connection closed.")
            return

        # Retrieve the user's diet plan path from the database
        cursor.execute(
            "SELECT diet_plan FROM dietary_preferences WHERE user_id = (SELECT id FROM users WHERE email = %s)",
            (user["email"],)
        )
        user_data = cursor.fetchone()
        diet_plan_content = None
        diet_plan_path = None

        if user_data and user_data["diet_plan"]:
            diet_plan_path = user_data["diet_plan"]
            try:
                with open(diet_plan_path, "r") as file:
                    diet_plan_content = file.read()
                print("Diet plan successfully loaded from file.")
            except FileNotFoundError:
                print("Diet plan file not found.")
                diet_plan_content = "No personalized diet plan found."
            except Exception as e:
                print(f"Error reading diet plan file: {e}")
                diet_plan_content = "No personalized diet plan found."

        while True:
            # Receive message from the client
            data = await websocket.receive_text()
            user_message = json.loads(data).get("message", "").strip()
            print(f"User Message: {user_message}")

            # Check for "update diet plan" intent
            if "update my diet plan" in user_message.lower():
                try:
                    # Generate an updated plan directly using the user's input
                    prompt = f"""
                    The user has requested the following update to their diet plan:
                    "{user_message}"

                    The current diet plan is:
                    {diet_plan_content or "No diet plan available."}

                    Based on the user's request, generate an updated diet plan.
                    """
                    updated_plan = await call_openai_api(prompt)

                    # Respond with the updated plan
                    await websocket.send_text(json.dumps({
                        "message": f"Here's the updated diet plan:\n{updated_plan}\nDo you like this plan? Reply 'yes' to confirm or 'no' to reject."
                    }))

                    # Wait for user confirmation
                    confirmation = await websocket.receive_text()
                    user_response = json.loads(confirmation).get("message", "").strip().lower()
                    print(f"User Confirmation: {user_response}")

                    if user_response == "yes":
                        try:
                            # Write the updated plan to the file
                            with open(diet_plan_path, "w") as file:
                                file.write(updated_plan)

                            await websocket.send_text(json.dumps({
                                "message": "Your diet plan has been successfully updated and saved!"
                            }))
                        except Exception as e:
                            print(f"Error saving diet plan: {e}")
                            await websocket.send_text(json.dumps({
                                "message": "Failed to save the updated diet plan. Please try again."
                            }))
                    else:
                        await websocket.send_text(json.dumps({
                            "message": "No changes have been made to your diet plan."
                        }))
                except Exception as e:
                    print(f"Error processing diet plan update: {e}")
                    await websocket.send_text(json.dumps({
                        "message": "There was an error generating the updated diet plan. Please try again later."
                    }))
            else:
                # Regular conversation
                prompt = f"""
                You are a helpful diet assistant. The user has the following personalized diet plan:
                {diet_plan_content or "No personalized diet plan available."}

                The user asked: {user_message}
                Please respond to the user's query, considering their personalized diet plan.
                """
                ai_response = await call_openai_api(prompt)
                print(f"Regular Bot Response: {ai_response}")
                await websocket.send_text(json.dumps({"message": ai_response}))

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Unexpected error: {e}")
        await websocket.close(code=1011)
