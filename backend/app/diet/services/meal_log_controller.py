# from fastapi import APIRouter, HTTPException, Depends
# from app.database import get_cursor
# from app.auth.utils import get_current_user
# from app.model import MealLog
# import requests
# import os
#
# router = APIRouter()
#
# NUTRITIONIX_API_URL = "https://trackapi.nutritionix.com/v2/natural/nutrients"
# NUTRITIONIX_HEADERS = {
#     "x-app-id": os.getenv("NUTRITIONIX_APP_ID"),
#     "x-app-key": os.getenv("NUTRITIONIX_APP_KEY"),
#     "Content-Type": "application/json",
# }
#
#
#
#
# OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
# OPENAI_HEADERS = {
#     "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
#     "Content-Type": "application/json",
# }
#
#
#
#
#
# @router.get("/get-diet-plan")
# async def get_diet_plan():
#     try:
#         with open("diet_plan.txt", "r") as file:
#             diet_plan = {}
#             lines = file.readlines()
#             for line in lines:
#                 meal_type, meal_name = line.split(":")
#                 diet_plan[meal_type.strip().lower()] = meal_name.strip()
#             return diet_plan
#     except Exception as e:
#         raise HTTPException(status_code=500, detail="Error reading diet plan")
#
#
#
# def fetch_from_openai(query: str):
#
#     try:
#         prompt = f"""
#         You are a nutrition assistant. Provide an estimate of calories, protein, carbs, fats, and sugars for: "{query}".
#         The output should be in JSON format like this:
#         {{
#             "name": "<food_name>",
#             "calories": <value>,
#             "protein": <value>,
#             "carbs": <value>,
#             "fats": <value>,
#             "sugar": <value>
#         }}
#         """
#         response = requests.post(
#             OPENAI_API_URL,
#             headers=OPENAI_HEADERS,
#             json={"model": "gpt-4", "messages": [{"role": "user", "content": prompt}]},
#         )
#         response.raise_for_status()
#
#         openai_response = response.json()
#         print("🔍 OpenAI Raw Response:", openai_response)
#         return response.json()["choices"][0]["message"]["content"]
#
#     except requests.exceptions.RequestException as e:
#         print(f"❌ OpenAI API Error: {e}")
#         return None
#
#
# @router.post("/meal-log")
# async def log_meal(
#         meal_log: MealLog,
#         user: dict = Depends(get_current_user),
#         cursor=Depends(get_cursor)
# ):
#     try:
#         user_id = user.get("id")
#         if not user_id:
#             raise HTTPException(status_code=401, detail="Unauthorized: Missing user ID in token")
#
#         print(f"🔍 Debug: Received meal_type = '{meal_log.meal_type}'")
#
#         # ✅ Normalize `meal_type` to lowercase
#         valid_meal_types = {"breakfast", "lunch", "dinner", "snack"}
#         meal_log.meal_type = meal_log.meal_type.strip().lower()
#
#         if meal_log.meal_type not in valid_meal_types:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Invalid meal_type: '{meal_log.meal_type}'. Must be one of {valid_meal_types}"
#             )
#
#         print(f"✅ Normalized meal_type = '{meal_log.meal_type}'")
#
#         # ✅ Fetch nutrition data from Nutritionix
#         nutritionix_response = requests.post(
#             NUTRITIONIX_API_URL,
#             headers=NUTRITIONIX_HEADERS,
#             json={"query": meal_log.meal_name, "num_servings": meal_log.amount}
#         )
#
#         if nutritionix_response.status_code != 200:
#             raise HTTPException(status_code=500, detail="Failed to fetch nutritional data from Nutritionix.")
#
#         nutrition_data = nutritionix_response.json()
#
#         # ✅ If food not found in Nutritionix, fetch from OpenAI
#         if "foods" not in nutrition_data or not nutrition_data["foods"]:
#             print("⚠️ Food not found in Nutritionix. Fetching from OpenAI...")
#             openai_data = fetch_from_openai(meal_log.meal_name)
#
#             if not openai_data:
#                 raise HTTPException(status_code=400, detail="No nutritional data found for the given meal.")
#
#             import json
#             openai_data = json.loads(openai_data)  # ✅ Convert OpenAI response to dictionary
#             print("🟢 OpenAI Response:", openai_data)  # ✅ Print to debug OpenAI response
#
#             # ✅ Extract values from OpenAI response
#             total_calories = round(openai_data.get("calories", 0) * meal_log.amount, 2)
#             total_protein = round(openai_data.get("protein", 0) * meal_log.amount, 2)
#             total_carbs = round(openai_data.get("carbs", 0) * meal_log.amount, 2)
#             total_fats = round(openai_data.get("fats", 0) * meal_log.amount, 2)
#             total_sugar = round(openai_data.get("sugar", 0) * meal_log.amount, 2)
#
#         else:
#             total_calories = round(sum((item.get("nf_calories", 0) or 0) for item in nutrition_data["foods"]) * meal_log.amount, 2)
#             total_protein = round(sum((item.get("nf_protein", 0) or 0) for item in nutrition_data["foods"]) * meal_log.amount, 2)
#             total_carbs = round( sum((item.get("nf_total_carbohydrate", 0) or 0) for item in nutrition_data["foods"]) * meal_log.amount, 2)
#             total_fats = round(sum((item.get("nf_total_fat", 0) or 0) for item in nutrition_data["foods"]) * meal_log.amount, 2)
#             total_sugar = round(sum((item.get("nf_sugars", 0) or 0) for item in nutrition_data["foods"]) * meal_log.amount, 2)
#
#     # ✅ Extract and sum nutrition values, handling `None` values correctly
#
#         # ✅ Debugging: Print final nutrition values before inserting
#         print(
#             f"🍽️ Nutrition Data - Calories: {total_calories}, Protein: {total_protein}, Carbs: {total_carbs}, Fats: {total_fats}, Sugar: {total_sugar}")
#
#         # ✅ Insert meal log into the database
#         try:
#             cursor.execute("""
#                 INSERT INTO meal_log (user_id, meal_type, meal_name, calories, protein, carbs, fats, sugar, created_at)
#                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
#             """, (
#                 user_id, meal_log.meal_type, meal_log.meal_name,
#                 total_calories, total_protein, total_carbs, total_fats, total_sugar
#             ))
#             cursor.connection.commit()
#
#             print("✅ Meal successfully inserted into database.")
#
#         except Exception as db_error:
#             cursor.connection.rollback()  # ✅ Rollback in case of an error
#             print(f"❌ Database Error: {db_error}")
#             raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
#
#
#
#         return {
#             "message": "Meal logged successfully!",
#             "user_id": user_id,
#             "meal_type": meal_log.meal_type,
#             "meal_name": meal_log.meal_name,
#             "calories": total_calories,
#             "protein": total_protein,
#             "carbs": total_carbs,
#             "fats": total_fats,
#             "sugar": total_sugar
#         }
#
#     except Exception as e:
#         print(f"❌ Error Logging Meal: {e}")
#         raise HTTPException(status_code=500, detail=f"Error logging meal: {str(e)}")
#
#
