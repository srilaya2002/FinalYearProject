from fastapi import APIRouter, HTTPException, Depends
from app.database import get_cursor
from app.auth.utils import get_current_user
import json
from datetime import date

router = APIRouter()


@router.post("/api/v1/log-meal")
def log_meal(meal: dict, user=Depends(get_current_user), cursor=Depends(get_cursor)):
    """
    Log a meal manually entered by the user.
    """
    if not meal or "meal_type" not in meal or "meal_name" not in meal:
        raise HTTPException(status_code=400, detail="Meal data is required.")

    user_id = user["id"]
    today = date.today()

    cursor.execute("""
        INSERT INTO meal_log (user_id, day, meal_type, meal_name, calories, protein, carbs, fats, sugar)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (user_id, today, meal["meal_type"], meal["meal_name"], meal["calories"], meal["protein"], meal["carbs"],
          meal["fats"], meal.get("sugar", 0)))

    cursor.connection.commit()

    return {"message": f"{meal['meal_type'].capitalize()} logged successfully with sugar intake."}


@router.post("/api/v1/log-meal-from-diet")
def log_meal_from_diet(user=Depends(get_current_user), cursor=Depends(get_cursor)):
    """
    Auto-fill meals from today's diet plan and log them.
    """
    user_id = user["id"]
    today = date.today().strftime("%A").lower()

    cursor.execute("""
        SELECT diet_plan FROM diet_preferences WHERE user_id = %s
    """, (user_id,))

    result = cursor.fetchone()

    if not result or not result["diet_plan"]:
        raise HTTPException(status_code=404, detail="No diet plan found.")

    try:
        diet_plan = json.loads(result["diet_plan"])
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid diet plan format.")

    if today not in diet_plan:
        raise HTTPException(status_code=404, detail="No meal plan for today.")

    for meal_type, meal in diet_plan[today].items():
        cursor.execute("""
            INSERT INTO meal_log (user_id, day, meal_type, meal_name, calories, protein, carbs, fats, sugar)
            VALUES (%s, CURRENT_DATE, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, meal_type, meal["name"], meal["calories"], meal["protein"], meal["carbs"], meal["fats"],
              meal.get("sugar", 0)))

    cursor.connection.commit()

    return {"message": "Today's diet plan meals logged successfully!"}
