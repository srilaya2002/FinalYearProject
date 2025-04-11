import requests
from fastapi import HTTPException
from app.utils.config import SPOONACULAR_API_KEY
import logging

SPOONACULAR_API_URL = "https://api.spoonacular.com/mealplanner/generate"

def calculate_target_calories(user_details, dietary_preferences):


    if user_details.gender.lower() == "male":
        bmr = 10 * user_details.weight + 6.25 * ((user_details.height_feet * 30.48) + (user_details.height_inches * 2.54)) - 5 * user_details.age + 5
    else:
        bmr = 10 * user_details.weight + 6.25 * ((user_details.height_feet * 30.48) + (user_details.height_inches * 2.54)) - 5 * user_details.age - 161

    activity_level = dietary_preferences.activity_level.lower()


    if activity_level == "muscle building":
        target_calories = bmr * 1.2 + 500
    elif activity_level == "weight loss":
        target_calories = bmr * 1.2 - 500
    elif activity_level == "maintenance":
        target_calories = bmr * 1.2
    else:
        logging.warning(f"Unknown activity level: {activity_level}. Using default maintenance calories.")
        target_calories = bmr * 1.2

    target_calories = round(target_calories)
    logging.info(f"Calculated target calories: {target_calories} for activity level: {activity_level} with BMR: {bmr}")
    return target_calories


def fetch_diet_plan_from_spoonacular(user_details, dietary_preferences):

    if not SPOONACULAR_API_KEY:
        raise RuntimeError("Spoonacular API key is not set.")

    try:
        target_calories = calculate_target_calories(user_details, dietary_preferences)

        exclude_items = dietary_preferences.dislikes or []

        if dietary_preferences.diet_type.lower() == "vegetarian":
            exclude_items.extend([
                "chicken", "pork", "beef", "mutton", "fish", "seafood", "bacon", "sausage", "tuna", "duck", "lamb", "turkey"
            ])
            diet_type = "vegetarian"
        elif dietary_preferences.diet_type.lower() == "vegan":
            exclude_items.extend([
                "chicken", "pork", "beef", "mutton", "fish", "seafood", "egg", "dairy", "bacon", "sausage", "tuna", "duck", "lamb", "turkey"
            ])
            diet_type = "vegan"
        else:
            diet_type = None

        params = {
            "timeFrame": "week",
            "targetCalories": target_calories,
            "diet": diet_type,
            "exclude": ",".join(exclude_items) if exclude_items else None,
            "apiKey": SPOONACULAR_API_KEY,
        }

        logging.debug(f"API Request Params: {params}")

        response = requests.get(SPOONACULAR_API_URL, params=params, timeout=30)
        response.raise_for_status()

        diet_plan = response.json()
        logging.debug(f"Raw Spoonacular API Response: {diet_plan}")

        if "week" not in diet_plan:
            logging.error("Invalid weekly meal plan structure from Spoonacular API.")
            raise HTTPException(status_code=500, detail="Invalid weekly meal plan structure.")

        return diet_plan

    except requests.Timeout:
        logging.error("Spoonacular API request timed out.")
        raise HTTPException(status_code=504, detail="Spoonacular API request timed out.")

    except requests.RequestException as e:
        logging.error(f"Spoonacular API Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch diet plan from Spoonacular.")
