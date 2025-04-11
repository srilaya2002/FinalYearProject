# import requests
# import json
# import logging
# from app.utils.config import OPENAI_API_KEY
#
# OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
# OPENAI_HEADERS = {
#     "Content-Type": "application/json",
#     "Authorization": f"Bearer {OPENAI_API_KEY}",
# }
#
#
# def make_day_plan_user_friendly(day_plan, day_name):
#     """
#     Convert a raw day plan from Spoonacular to a user-friendly format using OpenAI.
#     """
#     prompt = f"""
#     Convert this diet plan into a user-friendly format for {day_name}:
#
#     {json.dumps(day_plan, indent=2)}
#
#     Format the output as:
#     **{day_name}:**
#
#     **Breakfast:**
#     - [Meal 1]
#     - [Meal 2]
#
#     **Lunch:**
#     - [Meal 1]
#     - [Meal 2]
#
#     **Dinner:**
#     - [Meal 1]
#     - [Meal 2]
#
#     **Snacks:**
#     - [Snack 1]
#     - [Snack 2]
#     """
#
#     data = {
#         "model": "gpt-4",
#         "messages": [{"role": "user", "content": prompt}],
#         "temperature": 0.7,
#     }
#
#     try:
#         response = requests.post(OPENAI_API_URL, headers=OPENAI_HEADERS, json=data, timeout=30)
#         response.raise_for_status()
#         api_response = response.json()
#
#         if "choices" in api_response and len(api_response["choices"]) > 0:
#             return api_response["choices"][0]["message"]["content"].strip()
#
#         logging.error("Invalid response structure from OpenAI API.")
#         return f"Could not generate a user-friendly diet plan for {day_name}."
#
#     except Exception as e:
#         logging.error(f"Error generating user-friendly plan: {str(e)}")
#         return f"Could not generate a user-friendly diet plan for {day_name}."
