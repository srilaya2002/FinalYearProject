import json

from fastapi import Depends, HTTPException, APIRouter


from app.database import get_cursor
from app.auth.utils import get_current_user

router = APIRouter()

@router.get("/calories-nutrients")
def get_calorie_nutrient_breakdown(period: str = "daily", user=Depends(get_current_user), cursor=Depends(get_cursor)):

    cursor.execute("""
        SELECT food_logs FROM dietary_preferences
        WHERE user_id = (SELECT id FROM users WHERE email = %s)
    """, (user["email"],))
    user_data = cursor.fetchone()

    if not user_data or not user_data["food_logs"]:
        raise HTTPException(status_code=404, detail="No food logs found.")


    food_logs = json.loads(user_data["food_logs"])


    total_calories = sum(meal["calories"] for meal in food_logs)
    total_protein = sum(meal["protein"] for meal in food_logs)
    total_carbs = sum(meal["carbs"] for meal in food_logs)
    total_fats = sum(meal["fats"] for meal in food_logs)

    response = {
        "message": f"Here is your {period} calorie and nutrient breakdown.",
        "data": {
            "calories": total_calories,
            "protein": total_protein,
            "carbs": total_carbs,
            "fats": total_fats,
        }
    }
    return response
