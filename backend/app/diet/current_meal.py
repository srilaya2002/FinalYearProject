from fastapi import APIRouter, Depends, HTTPException
from app.diet.services.diet_utils import get_current_meal_from_diet_plan
from app.diet.storage.file_storage import load_diet_plan
from app.auth.utils import get_current_user
from app.database import get_cursor
from pydantic import BaseModel
from app.model import CurrentMealResponse

# Define the response model for the API response

router = APIRouter()

@router.get("/current-meal", response_model=CurrentMealResponse)
def get_current_meal(user: dict = Depends(get_current_user), cursor=Depends(get_cursor)):
    """
    Retrieve the current meal from the user's diet plan.
    """
    # Fetch diet plan for the user
    cursor.execute(
        "SELECT diet_plan FROM dietary_preferences WHERE user_id = (SELECT id FROM users WHERE email = %s)",
        (user["email"],),
    )
    user_data = cursor.fetchone()

    # Check if diet plan exists for the user
    if not user_data or not user_data.get("diet_plan"):
        raise HTTPException(status_code=404, detail="Diet plan not found.")

    # Load the user's diet plan and extract current meal
    diet_plan_content = load_diet_plan(user_data["diet_plan"])
    current_meal = get_current_meal_from_diet_plan(diet_plan_content)

    # Return the current meal in the response model format
    return {"message": current_meal, "source": "Diet Plan API"}

