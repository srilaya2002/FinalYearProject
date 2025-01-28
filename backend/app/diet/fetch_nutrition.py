from fastapi import APIRouter, HTTPException, Form
import requests
import os
import logging

router = APIRouter()

# Logging setup
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@router.post("/fetch-nutrition", response_model=dict)
def fetch_nutrition(query: str = Form(...)):
    """
    Fetch nutritional information from Nutritionix, USDA, and OpenAI.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query is required.")
    try:
        # Step 1: Try Nutritionix
        nutritionix_data = fetch_from_nutritionix(query)
        if nutritionix_data:
            logger.info("Returning response from Nutritionix.")
            return {
                "message": f"Here is the nutritional data for your query: {query}",
                "data": nutritionix_data,
                "source": "Nutritionix",
            }

        # Step 2: Fallback to USDA
        usda_data = fetch_from_usda(query)
        if usda_data:
            logger.info("Returning response from USDA.")
            return {
                "message": f"Here is the nutritional data for your query: {query}",
                "data": usda_data,
                "source": "USDA",
            }

        # Step 3: Fallback to OpenAI
        openai_response = fetch_from_openai(query)
        if openai_response:
            logger.info("Returning response from OpenAI.")
            return {
                "message": openai_response,
                "source": "OpenAI",
            }

        # Step 4: If all fail
        raise HTTPException(status_code=404, detail="No nutritional data found for the query.")

    except Exception as e:
        logger.error(f"Error in fetch_nutrition: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")

def fetch_from_nutritionix(query: str):
    """
    Fetch nutritional data from Nutritionix API.
    """
    try:
        # Log the query before sending it to the API
        logger.debug(f"Sending query: {query}")

        url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
        headers = {
            "x-app-id": os.getenv("NUTRITIONIX_APP_ID"),
            "x-app-key": os.getenv("NUTRITIONIX_APP_KEY"),
            "Content-Type": "application/json",
        }
        payload = {"query": query}

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        data = response.json()

        # Log the raw response to inspect the structure
        logger.debug(f"Raw response: {data}")

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
            return []  # Return empty list if no food is found

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from Nutritionix: {e}")
        return []  # Return empty list if there's an error


def fetch_from_usda(query: str):
    """
    Fetch nutritional data from USDA API.
    """
    try:
        url = "https://api.nal.usda.gov/fdc/v1/foods/search"
        headers = {"Content-Type": "application/json"}
        params = {
            "api_key": os.getenv("USDA_API_KEY"),
            "query": query,
            "dataType": ["Survey (FNDDS)"],
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        if "foods" in data and data["foods"]:
            food = data["foods"][0]
            return {
                "name": food.get("description", "N/A"),
                "calories": next((n["value"] for n in food.get("foodNutrients", []) if n.get("nutrientName") == "Energy"), "N/A"),
                "protein": next((n["value"] for n in food.get("foodNutrients", []) if n.get("nutrientName") == "Protein"), "N/A"),
                "carbs": next((n["value"] for n in food.get("foodNutrients", []) if n.get("nutrientName") == "Carbohydrate, by difference"), "N/A"),
                "fats": next((n["value"] for n in food.get("foodNutrients", []) if n.get("nutrientName") == "Total lipid (fat)"), "N/A"),
            }
        else:
            logger.warning("No foods found in USDA response.")
            return None

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from USDA: {e}")
        return None


def fetch_from_openai(query: str):
    """
    Fetch fallback nutritional information from OpenAI.
    """
    try:
        prompt = f"""
        You are a nutrition assistant. Provide nutritional insights for: "{query}".
        """
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
            json={"model": "gpt-4", "messages": [{"role": "user", "content": prompt}]},
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from OpenAI: {e}")
        return None
