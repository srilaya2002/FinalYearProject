import requests
import json
from fastapi import HTTPException
from app.utils.config import OPENAI_API_KEY

OPENAI_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}",
}

def generate_diet_plan_with_openai(user_details, dietary_preferences):
    """
    Generate a personalized diet plan using OpenAI.
    """
    total_height_inches = user_details.height_feet * 12 + user_details.height_inches
    prompt = f"""
    I am a {user_details.age}-year-old {user_details.gender} with a height of {total_height_inches} inches and weight of {user_details.weight} kg. 
    I follow a {dietary_preferences.diet_type} diet. I would like a weekly diet plan with {dietary_preferences.weekly_variety} unique meals. 
    My budget is {dietary_preferences.budget}. Additionally, I dislike the following foods: {dietary_preferences.dislikes}.
    Please generate a detailed personalized diet plan for me.
    """
    data = {"model": "gpt-4", "messages": [{"role": "user", "content": prompt}], "temperature": 0.7}

    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=OPENAI_HEADERS, data=json.dumps(data))
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error generating diet plan. Please try again.")
