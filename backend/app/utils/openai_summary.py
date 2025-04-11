from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_cursor, release_db_connection
import openai
from datetime import date
import os
import traceback


router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

class NutritionInput(BaseModel):
    user_id: int
    nutrition_data: dict

@router.post("/generate-nutrition-summary")
def generate_summary(request: NutritionInput):
    cursor, conn = get_cursor()
    today = date.today()

    try:

        if all(float(value) == 0 for value in request.nutrition_data.values()):
            print("⚠️ All nutrition values are 0 — skipping summary generation.")
            return {"summary": "Waiting for meal log data..."}

        cursor.execute("""
            SELECT summary FROM nutrition_summaries 
            WHERE user_id = %s AND summary_date = %s
        """, (request.user_id, today))
        existing_summary = cursor.fetchone()

        if existing_summary:
            return {"summary": existing_summary["summary"]}


        cursor.execute("""
            SELECT age, gender, height_feet, height_inches, weight
            FROM users
            WHERE id = %s
        """, (request.user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")


        height_feet = user.get('height_feet') or 0
        height_inches = user.get('height_inches') or 0
        weight = user.get('weight')


        if weight is None:
            raise HTTPException(status_code=400, detail="Weight is missing for BMI calculation")

        total_inches = height_feet * 12 + height_inches
        height_m = total_inches * 0.0254

        if height_m == 0:
            raise HTTPException(status_code=400, detail="Height cannot be zero for BMI calculation")

        bmi = round(weight / (height_m ** 2), 2)


        cursor.execute("""
            SELECT diet_type, activity_type, budget, dislikes, allergens,
                   weekly_variety, reason_for_diet, lactose_free_ok, other_allergen
            FROM dietary_preferences
            WHERE user_id = %s
        """, (request.user_id,))
        prefs = cursor.fetchone()
        if not prefs:
            raise HTTPException(status_code=404, detail="Preferences not found")

        cursor.execute("""
            SELECT meal_name, servings
            FROM meal_log
            WHERE user_id = %s AND day = %s
        """, (request.user_id, today))
        meals = cursor.fetchall()

        meal_list_text = "\n".join([
            f"- {meal['meal_name']} ({meal['servings']} servings)" for meal in meals
        ]) if meals else "- No meals logged today"


        prompt = f"""
You are a certified nutritionist. Based on the user's profile, preferences, and today's nutrient intake, generate a short, actionable nutritional insight.

User Info:
- Age: {user['age']}
- Gender: {user['gender']}
- Height: {user['height_feet']} ft {user['height_inches']} in
- Weight: {user['weight']} kg
- BMI: {bmi}

Diet Preferences:
- Diet Type: {prefs['diet_type']}
- Activity Level: {prefs['activity_type']}
- Reason for Diet: {prefs['reason_for_diet']}
- Allergens: {prefs['allergens'] or 'None'}
- Dislikes: {prefs['dislikes'] or 'None'}

Nutrition Intake Today:
- Calories: {request.nutrition_data['calories']} kcal
- Protein: {request.nutrition_data['protein']} g
- Carbs: {request.nutrition_data['carbs']} g
- Fats: {request.nutrition_data['fats']} g

Meals Consumed:
{meal_list_text}

 Write a clear and concise summary under 150 words.
 Highlight strengths and areas to improve.
 Suggest changes to tomorrow's diet based on intake.
Avoid generic advice and keep it specific to the user.
"""


        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful and professional nutritionist."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.7
        )

        summary = response['choices'][0]['message']['content']


        cursor.execute("""
            INSERT INTO nutrition_summaries (user_id, summary_date, summary)
            VALUES (%s, %s, %s)
        """, (request.user_id, today, summary))
        conn.commit()

        return {"summary": summary}

    except Exception as e:
        print("❌ Error generating summary:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to generate nutritional summary")

    finally:
        release_db_connection(conn)
