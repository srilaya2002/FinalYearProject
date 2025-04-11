from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
import logging

router = APIRouter()


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class NutritionQuery(BaseModel):
    query: str


@router.post("/fetch-nutrition", response_model=dict)
def fetch_nutrition(payload: NutritionQuery):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is required.")

    try:

        nutritionix_data = fetch_from_nutritionix(query)
        if nutritionix_data:
            logger.info("Returning response from Nutritionix.")
            return {
                "message": f"Here is the nutritional data for your query: {query}",
                "data": nutritionix_data,
                "source": "Nutritionix",
            }


        openai_response = fetch_from_openai(query)
        if openai_response:
            logger.info("Returning response from OpenAI.")
            return {
                "message": openai_response,
                "source": "OpenAI",
            }


        raise HTTPException(status_code=404, detail="No nutritional data found for the query.")

    except Exception as e:
        logger.error(f"❌ Error in fetch_nutrition: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")


def fetch_from_nutritionix(query: str):
    try:
        url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
        headers = {
            "x-app-id": os.getenv("NUTRITIONIX_APP_ID"),
            "x-app-key": os.getenv("NUTRITIONIX_APP_KEY"),
            "Content-Type": "application/json",
        }
        payload = {"query": query}
        logger.info(f"🚀 Sending Nutritionix request for: {query}")
        logger.debug(f"Headers: {headers}")
        logger.debug(f"Payload: {payload}")

        response = requests.post(url, headers=headers, json=payload)

        logger.info(f"📦 Nutritionix status code: {response.status_code}")
        logger.debug(f"🔍 Nutritionix response: {response.text}")

        response.raise_for_status()
        response.raise_for_status()

        data = response.json()

        if "foods" in data and data["foods"]:
            return [
                {
                    "name": food["food_name"],
                    "calories": food.get("nf_calories", "N/A"),
                    "protein": food.get("nf_protein", "N/A"),
                    "carbs": food.get("nf_total_carbohydrate", "N/A"),
                    "fats": food.get("nf_total_fat", "N/A"),
                }
                for food in data["foods"]
            ]
        else:
            logger.warning(f"No food data found for query '{query}'")
            return []
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching data from Nutritionix: {e}")
        return []


def fetch_from_openai(query: str):
    try:
        prompt = f"You are a nutrition assistant. Provide nutritional insights for: \"{query}\"."
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
            json={
                "model": "gpt-4",
                "messages": [{"role": "user", "content": prompt}]
            },
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching data from OpenAI: {e}")
        return None
