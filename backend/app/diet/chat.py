# router.py

from fastapi import APIRouter, HTTPException
from app.diet.fetch_nutrition import fetch_nutrition

router = APIRouter()


@router.post("/api/v1/chat")
async def chat_endpoint(payload: dict):
    """
    A single chat endpoint that handles various queries, including nutritional info.
    """
    user_message = payload.get("message", "").lower()

    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required.")

    # Handle nutritional info query
    if "nutritional info" in user_message:
        query = user_message.replace("nutritional info", "").strip()  # Extract food query
        if not query:
            return {"message": "Please specify the food item for nutritional info."}

        # Fetch nutritional info from Nutritionix API
        nutrition_data = fetch_nutrition(query)  # Fetch data from Nutritionix API
        if nutrition_data:
            # Assuming 'nutrition_data' contains the nutritional data along with source
            full_message = f"{query} - Calories: {nutrition_data['data'][0]['calories']}, Protein: {nutrition_data['data'][0]['protein']}, Carbs: {nutrition_data['data'][0]['carbs']}, Fats: {nutrition_data['data'][0]['fats']} (Source:['NutritionIX'])"

            return {
                "message": f"Here is the nutritional info for {query}:",
                "data": nutrition_data["data"],
                "source": nutrition_data["source"],
                "full_message": full_message
            }
        else:
            return {
                "message": f"Sorry, I couldn't find nutritional info for {query}.",
                "source": "Nutrition API"
            }

    # Default response for other queries
    return {"message": "I'm here to assist you with your queries.", "source": "ChatBot"}
