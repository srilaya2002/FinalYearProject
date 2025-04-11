from fastapi import APIRouter, HTTPException
from app.database import get_cursor
from app.database import release_db_connection

from datetime import datetime
from app.utils.portion_ml_model import predict_servings
from app.utils.nutrition_fetcher import fetch_nutrition_data
import traceback
import requests

router = APIRouter()

@router.post("/manual-log-meals")
async def manual_log_meals(
        data: dict,

):
    try:
        user_id = data.get("user_id")
        meals = data.get("meals")
        if not user_id or not meals:
            raise HTTPException(status_code=400, detail="Missing user_id or meals")

        today_date = datetime.now().date()

        cursor, connection = get_cursor()

        cursor.execute(
            """
            SELECT u.weight, u.height_feet, u.height_inches, dp.activity_type 
            FROM users u
            LEFT JOIN dietary_preferences dp ON u.id = dp.user_id
            WHERE u.id = %s
            """,
            (user_id,)
        )

        user_data = cursor.fetchone()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        weight = user_data.get("weight")
        height_feet = user_data.get("height_feet")
        height_inches = user_data.get("height_inches")
        activity_type = user_data.get("activity_type", "moderately_active")

        if weight is not None and height_feet is not None and height_inches is not None:
            try:
                weight = float(weight)
                height_feet = int(height_feet)
                height_inches = int(height_inches)
            except Exception as conv_err:
                raise HTTPException(status_code=500, detail="Error converting height/weight values: " + str(conv_err))
            height_m = ((height_feet * 12) + height_inches) * 0.0254
            bmi = weight / (height_m ** 2)
        else:
            bmi = None

        inserted_meals = []

        for meal in meals:
            meal_name = meal.get("meal")
            meal_type = meal.get("type").lower()
            extra_meal_reason = meal.get("reason", "No reason provided")

            if not meal_name or not meal_type:
                continue

            user_portion = meal.get("portion_size")

            if user_portion and user_portion > 0:
                num_servings = round(user_portion / 100, 2)
            else:
                num_servings = predict_servings(user_id, bmi, activity_type, meal_type)

            try:
                nutrition = fetch_nutrition_data(meal_name, num_servings)
            except requests.exceptions.HTTPError as api_error:
                raise HTTPException(status_code=400, detail=f"Please enter a valid food name: '{meal_name}' is invalid or not found.")

            cursor.execute(
                "SELECT 1 FROM meal_log WHERE user_id = %s AND day = %s AND meal_name = %s",
                (user_id, today_date, meal_name)
            )
            exists = cursor.fetchone()
            if exists:
                continue

            cursor.execute("""
                INSERT INTO meal_log 
                (user_id, day, meal_type, meal_name, servings, calories, protein, carbs, fats, extra_meal_reason, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (
                user_id, today_date, meal_type, meal_name, num_servings,
                nutrition["calories"], nutrition["protein"], nutrition["carbs"], nutrition["fats"],
                extra_meal_reason
            ))

            inserted_meals.append(meal_name)

        connection.commit()
        release_db_connection(connection)

        return {"message": "Meals logged successfully", "meals_logged": inserted_meals}

    except HTTPException as http_ex:
        raise http_ex

    except Exception as e:
        print("❌ Error logging manual meals:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")
