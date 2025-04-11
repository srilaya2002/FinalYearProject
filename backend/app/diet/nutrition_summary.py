from fastapi import APIRouter, Depends, HTTPException, Query
from app.database import get_cursor
from app.auth.utils import get_current_user
from datetime import date, timedelta

router = APIRouter()

@router.get("/nutrition-summary")
async def get_nutrition_summary(
    user: dict = Depends(get_current_user),
    range_type: str = Query("day", enum=["day", "week"]),
    detailed: bool = Query(False)
):
    cursor, connection = get_cursor()
    try:
        user_id = user.get("id")
        today = date.today()

        if range_type == "week":
            start_date = today - timedelta(days=7)

            if detailed:

                cursor.execute("""
                    SELECT day,
                           COALESCE(SUM(calories), 0) AS calories,
                           COALESCE(SUM(protein), 0) AS protein,
                           COALESCE(SUM(carbs), 0) AS carbs,
                           COALESCE(SUM(fats), 0) AS fats
                    FROM meal_log
                    WHERE user_id = %s AND day BETWEEN %s AND %s
                    GROUP BY day
                    ORDER BY day
                """, (user_id, start_date, today))
                daily_data = cursor.fetchall()


                cursor.execute("SELECT weight, height_feet, height_inches FROM users WHERE id = %s", (user_id,))
                user_row = cursor.fetchone()
                total_inches = user_row["height_feet"] * 12 + user_row["height_inches"]
                height_m = total_inches * 0.0254
                bmi = round(user_row["weight"] / (height_m ** 2), 2)


                cursor.execute("SELECT diet_type FROM dietary_preferences WHERE user_id = %s", (user_id,))
                prefs = cursor.fetchone()

                return {
                    "bmi": bmi,
                    "diet_goal": prefs["diet_type"],
                    "weekly_data": [
                        {
                            "day": str(row["day"]),
                            "calories": float(row["calories"]),
                            "protein": float(row["protein"]),
                            "carbs": float(row["carbs"]),
                            "fat": float(row["fats"])
                        }
                        for row in daily_data
                    ]
                }


            cursor.execute("""
                SELECT COALESCE(SUM(calories), 0) AS total_calories,
                       COALESCE(SUM(protein), 0) AS total_protein,
                       COALESCE(SUM(carbs), 0) AS total_carbs,
                       COALESCE(SUM(fats), 0) AS total_fats
                FROM meal_log
                WHERE user_id = %s AND day BETWEEN %s AND %s
            """, (user_id, start_date, today))

        else:
            cursor.execute("""
                SELECT COALESCE(SUM(calories), 0) AS total_calories,
                       COALESCE(SUM(protein), 0) AS total_protein,
                       COALESCE(SUM(carbs), 0) AS total_carbs,
                       COALESCE(SUM(fats), 0) AS total_fats
                FROM meal_log
                WHERE user_id = %s AND day = %s
            """, (user_id, today))

        result = cursor.fetchone()
        return {
            "calories": float(result["total_calories"]),
            "protein": float(result["total_protein"]),
            "carbs": float(result["total_carbs"]),
            "fats": float(result["total_fats"]),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()
