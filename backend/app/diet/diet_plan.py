from fastapi import APIRouter, Depends, HTTPException
from app.model import UserDetailsRequest, DietaryPreferencesRequest, DietPlanResponse
from app.diet.services.openai_service import generate_diet_plan_with_openai
from app.diet.storage.file_storage import save_diet_plan
from app.auth.utils import get_current_user
from app.database import get_cursor

router = APIRouter()

@router.post("/generate-diet-plan", response_model=DietPlanResponse)
def generate_diet_plan(
    user_details: UserDetailsRequest,
    dietary_preferences: DietaryPreferencesRequest,
    user: dict = Depends(get_current_user),
    cursor=Depends(get_cursor),
):
    """
    Generate a personalized diet plan using OpenAI.
    """
    cursor.execute("SELECT id FROM users WHERE email = %s", (user["email"],))
    user_data = cursor.fetchone()
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user_data["id"]

    diet_plan_content = generate_diet_plan_with_openai(user_details, dietary_preferences)
    save_diet_plan(user_id, diet_plan_content, dietary_preferences, cursor)
    return {"message": "Diet plan generated successfully.", "diet_plan": diet_plan_content}

from fastapi import APIRouter, Depends, HTTPException
from app.database import get_cursor
from app.auth.utils import get_current_user

router = APIRouter()

@router.get("/diet-plan", response_model=dict)
def get_diet_plan(user: dict = Depends(get_current_user), cursor=Depends(get_cursor)):
    """
    Retrieve the user's diet plan.
    """
    cursor.execute(
        "SELECT diet_plan FROM dietary_preferences WHERE user_id = (SELECT id FROM users WHERE email = %s)",
        (user["email"],)
    )
    user_data = cursor.fetchone()

    if not user_data or not user_data["diet_plan"]:
        raise HTTPException(status_code=404, detail="Diet plan not found.")

    # Assuming `diet_plan` contains the path to the diet plan file
    diet_plan_path = user_data["diet_plan"]
    try:
        with open(diet_plan_path, "r", encoding="utf-8") as file:
            diet_plan_content = file.read()
        return {"diet_plan": diet_plan_content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Diet plan file not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading diet plan: {str(e)}")



