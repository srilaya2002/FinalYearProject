from fastapi import APIRouter, HTTPException, Depends
from app.database import get_cursor
from app.auth.utils import get_current_user
from datetime import datetime
import json
import os

router = APIRouter()

@router.post("/auto-log-meals")
async def auto_log_meals(user: dict = Depends(get_current_user), cursor=Depends(get_cursor)):
    try:
        user_id = user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized: Missing user ID in token")

        # ✅ Make sure 'datetime' is used correctly
        today = datetime.now().strftime("%A").lower()  # Get current day of the week in lowercase
        today_date = datetime.now().date()

        file_path = os.path.abspath(os.path.join("diet_plans", f"user_{user_id}_diet_plan.json"))
        print(f"📂 Looking for diet plan file at: {file_path}")

        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            raise HTTPException(status_code=400, detail="Diet plan file not found.")

        with open(file_path, "r", encoding="utf-8") as file:
            diet_plan = json.load(file)

        print(f"Loaded diet plan content: {diet_plan}")

        if isinstance(diet_plan, str):
            diet_plan = json.loads(diet_plan)

        if not isinstance(diet_plan, dict) or "week" not in diet_plan:
            raise HTTPException(status_code=400, detail="Invalid diet plan format. 'week' key is missing.")

        available_days = list(diet_plan['week'].keys())

        if today not in available_days:
            raise HTTPException(status_code=400, detail=f"No meals found for {today} in the diet plan.")

        meals_for_today = diet_plan["week"][today].get("meals", [])
        nutrients_for_today = diet_plan["week"][today].get("nutrients", {})

        if not meals_for_today:
            raise HTTPException(status_code=400, detail="No meals data available for today.")
        if not isinstance(nutrients_for_today, dict) or not all(k in nutrients_for_today for k in ['calories', 'protein', 'fat', 'carbohydrates']):
            raise HTTPException(status_code=400, detail="Invalid or missing nutrients data.")

        total_calories = nutrients_for_today.get("calories", 0.0)
        total_protein = nutrients_for_today.get("protein", 0.0)
        total_carbs = nutrients_for_today.get("carbohydrates", 0.0)
        total_fats = nutrients_for_today.get("fat", 0.0)

        for index, meal in enumerate(meals_for_today):
            meal_name = meal.get("title", "Unnamed Meal")
            meal_type = ["breakfast", "lunch", "dinner"][index % 3]

            # ✅ Ensure `meal_name` is not None
            if not meal_name:
                meal_name = "Unnamed Meal"

            # Check if the meal already exists for the same day
            cursor.execute("""
                SELECT 1 FROM meal_log WHERE user_id = %s AND day = %s AND meal_name = %s
            """, (user_id, today_date, meal_name))
            exists = cursor.fetchone()

            if exists:
                print(f"🔍 Meal '{meal_name}' already exists for {today_date}. Skipping insert.")
                continue

            print(f"🍽️ Logging meal: {meal_name}, Type: {meal_type}, Calories: {total_calories}, Protein: {total_protein}, Carbs: {total_carbs}, Fats: {total_fats}")

            cursor.execute("""
                INSERT INTO meal_log (user_id, day, meal_type, meal_name, calories, protein, carbs, fats, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (
                user_id, today_date, meal_type, meal_name,
                total_calories, total_protein, total_carbs, total_fats
            ))

        cursor.connection.commit()

        return {
            "message": f"Meals for {today.capitalize()} logged automatically.",
            "meals_logged": [meal.get("title", "Unnamed Meal") for meal in meals_for_today]
        }

    except Exception as e:
        print(f"❌ Error in automatic meal logging: {e}")
        raise HTTPException(status_code=500, detail=f"Error in automatic meal logging: {str(e)}")
