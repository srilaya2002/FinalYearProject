

import requests
import os

NUTRITIONIX_API_URL = "https://trackapi.nutritionix.com/v2/natural/nutrients"
NUTRITIONIX_APP_ID = os.getenv("NUTRITIONIX_APP_ID")
NUTRITIONIX_APP_KEY = os.getenv("NUTRITIONIX_APP_KEY")

def fetch_nutrition_data(meal_name, servings):
    """Fetch calories, protein, fats, and carbs for a given meal from Nutritionix."""
    try:
        headers = {
            "x-app-id": NUTRITIONIX_APP_ID,
            "x-app-key": NUTRITIONIX_APP_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "query": meal_name,
            "num_servings": servings
        }

        response = requests.post(NUTRITIONIX_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

        if 'foods' not in data or len(data['foods']) == 0:
            raise ValueError("Nutritionix did not return valid data")

        food_data = data['foods'][0]
        nutrition_data = {
            "calories": round(food_data.get("nf_calories", 0), 2),
            "protein": round(food_data.get("nf_protein", 0), 2),
            "carbs": round(food_data.get("nf_total_carbohydrate", 0), 2),
            "fats": round(food_data.get("nf_total_fat", 0), 2)
        }

        return nutrition_data
    except Exception as e:
        print(f"Error fetching nutrition data: {e}")
        raise
