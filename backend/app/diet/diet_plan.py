from fastapi import APIRouter, Depends, HTTPException
from app.model import UserDetailsRequest, DietaryPreferencesRequest, DietPlanResponse
from app.diet.services.spoonacular_service import fetch_diet_plan_from_spoonacular
from app.diet.storage.file_storage import save_diet_plan
from app.auth.utils import get_current_user
from app.database import get_cursor
import logging
import json

router = APIRouter()

@router.post("/generate-diet-plan", response_model=DietPlanResponse)
def generate_diet_plan(
        user_details: UserDetailsRequest,
        dietary_preferences: DietaryPreferencesRequest,
        user: dict = Depends(get_current_user),
        db=Depends(get_cursor),
):
    cursor, connection = db
    logging.debug(f"Generating diet plan for user: {user['email']} with details {user_details}")

    cursor.execute("SELECT id FROM users WHERE email = %s", (user["email"],))
    user_data = cursor.fetchone()
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user_data["id"]

    logging.debug(f"Fetching diet plan from Spoonacular API for user ID {user_id}...")
    diet_plan = fetch_diet_plan_from_spoonacular(user_details, dietary_preferences)

    logging.debug(f"Fetched diet plan: {diet_plan}")


    diet_plan_content = json.dumps(diet_plan, indent=4)
    save_diet_plan(user_id, diet_plan_content, dietary_preferences, user_details, cursor,user["email"])

    return {"message": "Diet plan generated successfully.", "diet_plan": diet_plan_content}

@router.get("/diet-plan", response_model=dict)
def get_diet_plan(user: dict = Depends(get_current_user)):

    cursor, connection = get_cursor()
    cursor.execute(
        "SELECT diet_plan FROM dietary_preferences WHERE user_id = (SELECT id FROM users WHERE email = %s)",
        (user["email"],)
    )
    user_data = cursor.fetchone()

    if not user_data or not user_data["diet_plan"]:
        raise HTTPException(status_code=404, detail="Diet plan not found.")

    diet_plan_path = user_data["diet_plan"]

    logging.debug(f"Attempting to retrieve diet plan from: {diet_plan_path}")

    try:

        with open(diet_plan_path, "r", encoding="utf-8") as file:
            diet_plan_content = json.load(file)

        logging.debug("Successfully retrieved diet plan snippet: %s", json.dumps(diet_plan_content)[:100])


        return {"diet_plan": diet_plan_content}

    except FileNotFoundError:
        logging.error(f"File not found: {diet_plan_path}")
        raise HTTPException(status_code=404, detail="Diet plan file not found.")
    except Exception as e:
        logging.error(f"Error loading diet plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error loading diet plan: {str(e)}")
