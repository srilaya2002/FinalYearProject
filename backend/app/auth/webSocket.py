import uuid
import json
import os


from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.auth.utils import get_current_user
from app.database import get_cursor
from app.diet.chat import save_conversation

websocket_router = APIRouter()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set in the environment variables.")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}",
}


@websocket_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None, db=Depends(get_cursor)):
    print("Client attempting to connect to WebSocket...")
    try:
        await websocket.accept()
        print("WebSocket connection established.")


        user = get_current_user(token)
        if not user:
            await websocket.close(code=1008)
            print("Invalid user token. WebSocket connection closed.")
            return


        cursor, connection = db
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
            print(" Waiting for a WebSocket message...")
            data = await websocket.receive_text()
            print(f"Received WebSocket message: {data}")

            parsed_data = json.loads(data)
            user_message = parsed_data.get("message", "").strip()
            session_id = parsed_data.get("session_id", str(uuid.uuid4()))

            if not user_message:
                print("Received empty message. Ignoring.")
                continue

            else:
                prompt = f"""
                You are a helpful diet assistant. The user has the following personalized diet plan:
                {diet_plan_content or "No personalized diet plan available."}

                The user asked: {user_message}
                Please respond to the user's query, considering their personalized diet plan.
                """
                ai_response = await call_openai_api(prompt)
                await websocket.send_text(json.dumps({"message": ai_response}))
                save_conversation(user["email"], user_message, ai_response, session_id)
    #
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Unexpected error: {e}")
        await websocket.send_text(json.dumps({"message": "Internal server error."}))
        await websocket.close(code=1011)
