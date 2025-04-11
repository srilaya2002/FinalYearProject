from fastapi import APIRouter, HTTPException, Depends
from app.database import get_cursor
from app.auth.utils import get_current_user
from datetime import datetime, timedelta
import json
import os

router = APIRouter()

MEAL_TIME_RANGES = {
    "breakfast": (5, 11),
    "lunch": (11, 17),
    "dinner": (17, 23)
}

@router.post("/auto-log-meals")
async def auto_log_meals(user: dict = Depends(get_current_user)):
    cursor, connection = get_cursor()
    try:
        user_id = user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized: Missing user ID in token")

        now = datetime.now()
        current_hour = now.hour
        today_date = now.date()

        cursor.execute("SELECT COALESCE(MAX(day), %s) AS last_logged_day FROM meal_log WHERE user_id = %s",
                       (today_date - timedelta(days=7), user_id))
        result = cursor.fetchone()

        if isinstance(result, dict):
            last_logged_day = result.get("last_logged_day", today_date - timedelta(days=7))
        elif isinstance(result, (tuple, list)):
            last_logged_day = result[0] if result[0] else today_date - timedelta(days=7)
        else:
            last_logged_day = today_date - timedelta(days=7)

        check_date = last_logged_day + timedelta(days=1)
        while check_date < today_date:
            log_meals_for_day(user_id, check_date, cursor, check_duplicates=True)
            check_date += timedelta(days=1)

        meals_to_log = [meal for meal, (start, _) in MEAL_TIME_RANGES.items() if current_hour >= start]

        log_meals_for_day(user_id, today_date, cursor, meals_to_log, check_duplicates=True)

        connection.commit()
        cursor.close()
        connection.close()

        return {"message": f"Meals logged for missing days and today: {meals_to_log}"}

    except Exception as e:
        print(f"❌ Unexpected Error in automatic meal logging: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Error in automatic meal logging: {repr(e)}")

def log_meals_for_day(user_id, date, cursor, meals_to_log=None, check_duplicates=False):
    today = date.strftime("%A").lower()
    file_path = os.path.abspath(os.path.join("diet_plans", f"user_{user_id}_diet_plan.json"))

    if not os.path.exists(file_path):
        print(f"❌ Diet plan file not found for user {user_id}. Skipping {date}.")
        return

    with open(file_path, "r", encoding="utf-8") as file:
        diet_plan = json.load(file)

    if isinstance(diet_plan, str):
        diet_plan = json.loads(diet_plan)

    meals_for_today = diet_plan.get("week", {}).get(today, {}).get("meals", [])
    nutrients_for_today = diet_plan.get("week", {}).get(today, {}).get("nutrients", {})

    if not isinstance(meals_for_today, list) or not meals_for_today:
        print(f"⚠️ No valid meals found for {today}. Skipping {date}.")
        return

    servings_per_meal = {meal.get("title", "Unnamed Meal"): meal.get("servings", 1) for meal in meals_for_today}

    for index, meal in enumerate(meals_for_today):
        meal_name = meal.get("title", "Unnamed Meal")
        meal_type = ["breakfast", "lunch", "dinner"][index % 3]

        if meals_to_log and meal_type not in meals_to_log:
            continue

        if check_duplicates:
            cursor.execute("SELECT 1 FROM meal_log WHERE user_id = %s AND day = %s AND meal_type = %s",
                           (user_id, date, meal_type))
            if cursor.fetchone():
                continue

        num_servings = servings_per_meal.get(meal_name, 1)
        print(f"📝 Logging meal: {meal_name} ({meal_type}), Servings: {num_servings}")

        cursor.execute("""
            INSERT INTO meal_log (user_id, day, meal_type, meal_name, servings, calories, protein, carbs, fats, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            user_id, date, meal_type, meal_name, num_servings,
            nutrients_for_today.get("calories", 0) / 3,
            nutrients_for_today.get("protein", 0) / 3,
            nutrients_for_today.get("carbohydrates", 0) / 3,
            nutrients_for_today.get("fat", 0) / 3
        ))
