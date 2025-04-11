import os
import uuid
import json

import httpx
import requests
from fastapi import APIRouter, HTTPException, Depends
from app.auth.utils import get_current_user
from app.database import get_cursor, release_db_connection
import openai
from app.utils.config import OPENAI_API_KEY,SPOONACULAR_API_KEY

import re

openai.api_key = OPENAI_API_KEY


NUTRITIONIX_API_URL = "https://trackapi.nutritionix.com/v2/natural/nutrients"


SPOONACULAR_API_URL = "https://api.spoonacular.com/mealplanner/generate"


router = APIRouter()
session_data = {}

def save_conversation(user_email: str, user_msg: str, ai_msg: str, session_id: str = None):
    cursor, conn = get_cursor()
    try:
        if not session_id:
            session_id = str(uuid.uuid4())

        cursor.execute(
            """
            INSERT INTO conversation_logs (user_id, user_message, ai_response, timestamp, session_id)
            VALUES (
              (SELECT id FROM users WHERE email = %s),
              %s, %s, NOW(), %s
            )
            """,
            (user_email, user_msg, ai_msg, session_id),
        )
        conn.commit()
        return session_id
    except Exception as e:
        print(f"❌ Failed to save chat: {e}")
    finally:
        release_db_connection(conn)

def get_user_preferences(user_email: str):
    cursor, conn = get_cursor()
    try:
        cursor.execute(
            """
            SELECT 
                dp.diet_type, 
                dp.weekly_variety, 
                dp.dislikes, 
                dp.allergens, 
                dp.activity_type, 
                dp.budget, 
                dp.lactose_free_ok, 
                dp.other_allergen,
                u.age, 
                u.gender, 
                u.weight, 
                u.height_feet, 
                u.height_inches 
            FROM dietary_preferences dp
            JOIN users u ON u.id = dp.user_id
            WHERE u.email = %s
            """,
            (user_email,)
        )
        preferences = cursor.fetchone()


        print(f"Fetched user preferences for {user_email}: {preferences}")


        if preferences:

            diet_type = preferences['diet_type']
            dislikes = preferences['dislikes']
            allergens = preferences['allergens']
            activity_type = preferences['activity_type']
            budget = preferences['budget']
            lactose_free_ok = preferences['lactose_free_ok']
            other_allergen = preferences['other_allergen']
            age = preferences['age']
            gender = preferences['gender']
            weight = preferences['weight']
            height_feet = preferences['height_feet']
            height_inches = preferences['height_inches']

            # Log the fetched values for debugging
            print(f"Fetched values: {diet_type}, {dislikes}, {allergens}, {activity_type}, {budget}, {lactose_free_ok}, {other_allergen}, {age}, {gender}, {weight}, {height_feet}, {height_inches}")



            try:

                if weight is not None:
                    weight = float(weight)

                else:
                    print("❌ Invalid weight: None")
                    return None
            except ValueError:
                print(f"❌ Invalid weight value: {weight}")
                return None


            try:
                height_in_inches = float(height_inches) if height_inches else 0
                age = int(age) if age else 0
                print(f"Height (in inches): {height_in_inches}, Age: {age}")
            except ValueError as e:
                print(f"❌ Invalid height or age: {e}")
                return None


            return preferences
        else:
            print("❌ No preferences found.")
            return None

    except Exception as e:
        print(f"❌ Error fetching user preferences: {e}")
        return None
    finally:
        release_db_connection(conn)




async def call_openai_api(prompt: str):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": "You are a helpful assistant."},
                      {"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return "Sorry, there was an error processing your request."


async def call_nutritionix_api(food_item: str):
    try:
        url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
        headers = {
            "x-app-id": os.getenv("NUTRITIONIX_APP_ID"),
            "x-app-key": os.getenv("NUTRITIONIX_APP_KEY"),
            "Content-Type": "application/json",
        }
        payload = {"query": food_item}
        print(f"🚀 Sending Nutritionix request for: {food_item}")


        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()

        data = response.json()

        if "foods" in data and data["foods"]:
            return [
                {
                    "name": food["food_name"],
                    "calories": food.get("nf_calories", "N/A"),
                    "protein": food.get("nf_protein", "N/A"),
                    "carbs": food.get("nf_total_carbohydrate", "N/A"),
                    "fats": food.get("nf_total_fat", "N/A"),
                    "sugars": food.get("nf_sugars", "N/A"),
                }
                for food in data["foods"]
            ]
        else:
            print(f"No food data found for query '{food_item}'")
            return []

    except Exception as e:
        print(f"Error fetching data from Nutritionix: {e}")
        return None

async def call_spoonacular_api(user_email: str,  extra_food: str = None):
    try:
        preferences = get_user_preferences(user_email)
        if not preferences:
            print(f"❌ No preferences found for user {user_email}")
            return None

        diet_type = preferences['diet_type']
        dislikes = preferences['dislikes']
        allergens = preferences['allergens']
        activity_type = preferences['activity_type']
        budget = preferences['budget']
        lactose_free_ok = preferences['lactose_free_ok']
        other_allergen = preferences['other_allergen']
        age = preferences['age']
        gender = preferences['gender']
        weight_value = preferences['weight']
        height_feet_value = preferences['height_feet']
        height_inches_value = preferences['height_inches']


        weight_value = float(weight_value)
        total_height_in_inches = float(height_feet_value) * 12 + float(height_inches_value)
        age_value = int(age)


        if extra_food:
            print(f"📦 User requested to include: {extra_food}")
            if dislikes and extra_food.lower() in dislikes.lower():
                dislikes = dislikes.replace(extra_food, "").strip(", ")


        bmr = 10 * weight_value + 6.25 * total_height_in_inches - 5 * age_value + (5 if gender.lower() == 'male' else -161)
        tdee = bmr * {
            "sedentary": 1.2,
            "lightly active": 1.375,
            "moderately active": 1.55,
            "very active": 1.725,
            "super active": 1.9
        }.get(activity_type.lower(), 1.55)

        print(f"🔥 TDEE: {tdee}")

        params = {
            "apiKey": SPOONACULAR_API_KEY,
            "timeFrame": "week",
            "targetCalories": int(tdee),
            "diet": diet_type,
            "exclude": dislikes,
            "intolerances": allergens,
            "query": extra_food or ""
        }

        response = requests.get(SPOONACULAR_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        print("📦 Spoonacular raw data:", json.dumps(data, indent=2))
        return format_diet_plan(data)

    except Exception as e:
        print(f"❌ Error calling Spoonacular: {e}")
        return None


def format_diet_plan(data):
    if "week" not in data:
        return "Sorry, I couldn't retrieve a valid diet plan at this time."

    formatted_plan = ""

    for day, day_info in data["week"].items():
        formatted_plan += f"\n**{day.capitalize()}**\n"

        meals = day_info.get("meals", [])
        nutrients = day_info.get("nutrients", {})

        if not meals:
            formatted_plan += "No meals found for this day.\n"
            continue

        for meal in meals:
            title = meal.get("title", "Unknown Meal")
            ready_in = meal.get("readyInMinutes", "N/A")
            servings = meal.get("servings", "N/A")
            url = meal.get("sourceUrl", "#")

            formatted_plan += (
                f" **{title}**\n"
                f" Ready in: {ready_in} minutes |  Servings: {servings}\n"
                f" [View Recipe]({url})\n\n"
            )


        formatted_plan += (
            f" **Daily Nutrients**:\n"
            f"Calories: {nutrients.get('calories', 'N/A')} kcal | "
            f"Protein: {nutrients.get('protein', 'N/A')} g | "
            f"Carbs: {nutrients.get('carbohydrates', 'N/A')} g | "
            f"Fats: {nutrients.get('fat', 'N/A')} g\n"
        )

        formatted_plan += "\n" + ("-" * 40) + "\n"

    return formatted_plan.strip()



def parse_markdown_diet_plan(markdown_plan: str) -> dict:
    week_plan = {}
    days = re.split(r'-{10,}', markdown_plan)  # Split by dashed line
    for day_data in days:
        day_data = day_data.strip()
        if not day_data:
            continue

        lines = day_data.split("\n")
        day_name = lines[0].strip(" *").lower()
        meals = []
        nutrients = {}

        i = 1
        while i < len(lines):
            line = lines[i].strip()
            if line.startswith("**Daily Nutrients**"):
                i += 1
                nutrients_line = lines[i].strip()
                nutrients_parts = dict(
                    part.split(": ")
                    for part in nutrients_line.replace(" kcal", "")
                    .replace("g", "")
                    .split(" | ")
                )
                nutrients = {
                    "calories": float(nutrients_parts["Calories"]),
                    "protein": float(nutrients_parts["Protein"]),
                    "carbohydrates": float(nutrients_parts["Carbs"]),
                    "fat": float(nutrients_parts["Fats"]),
                }
                break

            if line.startswith("**"):
                title = line.strip(" *")
                i += 1
                time_line = lines[i].strip()
                servings_line = ""
                if "|  Servings:" in time_line:
                    time_part, servings_part = time_line.split("|")
                else:
                    i += 1
                    time_part = lines[i].strip()
                    servings_part = lines[i + 1].strip()
                    i += 1

                ready_in = int(re.search(r"(\d+)", time_part).group(1))
                servings = int(re.search(r"(\d+)", servings_part).group(1))

                i += 1
                link = re.search(r"\((.*?)\)", lines[i]).group(1)

                meals.append({
                    "title": title,
                    "readyInMinutes": ready_in,
                    "servings": servings,
                    "sourceUrl": link
                })

            i += 1

        week_plan[day_name] = {"meals": meals, "nutrients": nutrients}
    return {"week": week_plan}

def save_updated_diet_plan(user_email: str, updated_plan: str):
    cursor, conn = get_cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))
        user_data = cursor.fetchone()
        if not user_data:
            print("❌ User not found.")
            return

        user_id = user_data["id"]
        file_path = os.path.abspath(os.path.join("diet_plans", f"user_{user_id}_diet_plan.json"))
        os.makedirs(os.path.dirname(file_path), exist_ok=True)


        structured_plan = parse_markdown_diet_plan(updated_plan)

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(structured_plan, f, indent=2)


        cursor.execute(
            "UPDATE dietary_preferences SET diet_plan = %s WHERE user_id = %s",
            (file_path, user_id)
        )
        conn.commit()

        print(f"✅ Updated diet plan saved to {file_path} and path stored in DB.")

    except Exception as e:
        print(f"❌ Error updating diet plan: {e}")
    finally:
        release_db_connection(conn)

def update_conversation_log(session_id, plan_updated):
    cursor, conn = get_cursor()
    query = "UPDATE conversation_logs SET is_plan_updated = %s WHERE session_id = %s;"
    cursor.execute(query, (plan_updated, session_id))
    conn.commit()
    cursor.close()
    release_db_connection(conn)




@router.post("/chat")
async def chat_endpoint(payload: dict, user: dict = Depends(get_current_user)):
    user_msg = payload.get("message", "").lower()
    print(f"User: {user}")
    print(f"Received Payload: {payload}")

    user_message = payload.get("message", "").lower()
    session_id = payload.get("session_id")

    if not user_message:
        print("❌ No message found in payload")
        raise HTTPException(status_code=400, detail="Message is required.")

    if not session_id:
        session_id = str(uuid.uuid4())


    if "nutrition" in user_message or "calories" in user_message or "protein" in user_message or "sugar" in user_message:
        food_item = user_message.split(" ")[-1]  # Assume last word is food item
        nutrition_data = await call_nutritionix_api(food_item)

        if nutrition_data:
            bot_response = f"The nutritional information for {food_item} is as follows:\n" \
                           f"Calories: {nutrition_data[0].get('calories', 'N/A')} kcal\n" \
                           f"Sugars: {nutrition_data[0].get('sugars', 'N/A')} g\n" \
                           f"fats: {nutrition_data[0].get('fats', 'N/A')} g\n" \
                           f"carbohydrates: {nutrition_data[0].get('carbs', 'N/A')} g\n" \
                           f"Protein: {nutrition_data[0].get('protein', 'N/A')} g"
        else:

            prompt = f"Provide nutritional information for {food_item}, including calories, sugars, and protein."
            bot_response = await call_openai_api(prompt)

        save_conversation(user["email"], user_message, bot_response, session_id)
        return {"message": bot_response, "session_id": session_id}



    if "update diet plan" in user_msg:
        extra = user_msg.split("with", 1)[1].strip() if "with" in user_msg else None
        plan = await call_spoonacular_api(user["email"], session_id, extra_food=extra)
        if plan:
            session_data[session_id] = {"diet_update": plan}
            return {
                "message": f"Here is your updated diet plan:\n\n{plan}\n\nDo you like this plan? Reply 'yes' to confirm or 'no' to reject.",
                "session_id": session_id
            }
        return {"message": "Sorry, I couldn't update your diet plan.", "session_id": session_id}

    if user_msg == "yes" and session_id in session_data:
        save_updated_diet_plan(user["email"], session_data[session_id]["diet_update"])
        update_conversation_log(session_id, True)
        return {"message": "Your diet plan has been successfully updated and saved.", "session_id": session_id}


    prompt = f"You are a helpful diet assistant. The user asked: '{user_message}'. Please provide a detailed and helpful answer."
    bot_response = await call_openai_api(prompt)
    save_conversation(user["email"], user_message, bot_response, session_id)
    return {"message": bot_response, "session_id": session_id}






