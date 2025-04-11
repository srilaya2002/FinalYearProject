from fastapi import APIRouter, HTTPException, Depends
from app.database import get_cursor, release_db_connection
from app.auth.utils import get_current_user
import traceback

router = APIRouter()

@router.get("/meal-history/{user_id}/{selected_date}")
async def get_meal_history(
    user_id: int,
    selected_date: str,
):
    try:
        cursor, connection = get_cursor()

        cursor.execute("""
            SELECT meal_name, meal_type, servings, calories, protein, carbs, fats, extra_meal_reason
            FROM meal_log
            WHERE user_id = %s AND day = %s
        """, (user_id, selected_date))

        meals_data = cursor.fetchall()

        release_db_connection(connection)


        meals = [
            {
                "meal_name": meal["meal_name"],
                "meal_type": meal["meal_type"],
                "servings": float(meal["servings"]),
                "calories": float(meal["calories"]),
                "protein": float(meal["protein"]),
                "carbs": float(meal["carbs"]),
                "fats": float(meal["fats"]),
                "extra_meal_reason": meal["extra_meal_reason"]
            } for meal in meals_data
        ]

        return {"meals": meals}

    except Exception as e:
        print("❌ Error fetching meal history:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")
