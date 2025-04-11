# ✅ FILE: graph_insight.py (your backend OpenAI call with DB caching like daily summary)
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database import get_cursor, release_db_connection
import openai
import os
from datetime import date

router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

class WeeklyGraphEntry(BaseModel):
    day: str
    calories: float
    target: float
    protein: float
    carbs: float
    fat: float

class WeeklyGraphInsightRequest(BaseModel):
    user_id: int
    bmi: float
    diet_goal: str
    weekly_data: List[WeeklyGraphEntry]

@router.post("/generate-weekly-nutrition-summary")
def generate_graph_insight(request: WeeklyGraphInsightRequest):
    cursor, conn = get_cursor()
    today = date.today()
    try:

        cursor.execute("""
            SELECT summary FROM weekly_graph_insights
            WHERE user_id = %s AND week_ending = %s
        """, (request.user_id, today))
        existing = cursor.fetchone()
        if existing:
            return {"graph_insight": existing["summary"]}


        intake_text = "\n".join([
            f"{entry.day}: {entry.calories} kcal (target: {entry.target}), "
            f"{entry.protein}g protein, {entry.carbs}g carbs, {entry.fat}g fat"
            for entry in request.weekly_data
        ])

        prompt = f"""
You are a certified nutritionist. Analyze the user's weekly diet graph data.

User Info:
- BMI: {request.bmi}
- Diet Goal: {request.diet_goal}

Weekly Intake vs Target:
{intake_text}

 Identify how many days they met their calorie goal
 Detect trends like consistently low protein, high carbs or fats
 Mention any spikes or drops (e.g. Friday had excess fat)
 Give specific advice for improving next week’s intake
Keep it short (max 120 words) and personalized
"""

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful and professional nutritionist."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )

        summary = response['choices'][0]['message']['content']


        cursor.execute("""
            INSERT INTO weekly_graph_insights (user_id, week_ending, summary)
            VALUES (%s, %s, %s)
        """, (request.user_id, today, summary))
        conn.commit()

        return {"graph_insight": summary}

    except Exception as e:
        print("❌ Error generating graph insight:", e)
        raise HTTPException(status_code=500, detail="Failed to generate graph insight")

    finally:
        release_db_connection(conn)
