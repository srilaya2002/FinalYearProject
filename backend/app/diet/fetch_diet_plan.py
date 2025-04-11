import re

from fastapi import APIRouter, HTTPException,  Depends

import os

from app.database import get_cursor

router = APIRouter()


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIET_PLAN_DIR = os.path.join(BASE_DIR, "diet_plans")



def parse_diet_plan(file_path: str) -> dict:

    diet_plan = {}
    current_day = None
    current_meal = None

    with open(file_path, "r", encoding="utf-8") as file:
        lines = file.readlines()

        for line in lines:
            line = line.strip()


            day_match = re.match(r"\*\*Day (\d+):\*\*", line)
            if day_match:
                current_day = f"Day {day_match.group(1)}"
                diet_plan[current_day] = {}
                continue

            meal_match = re.match(r"\*\*(\w+)\*\*: (.+)", line)
            if meal_match:
                current_meal = meal_match.group(1).lower()
                main_meal = meal_match.group(2).strip()
                diet_plan[current_day][current_meal] = {
                    "main": main_meal,
                    "ingredients": []
                }
                continue


            ingredient_match = re.match(r"^-\s(.+)", line)
            if ingredient_match and current_day and current_meal:
                ingredient = ingredient_match.group(1).strip()
                diet_plan[current_day][current_meal]["ingredients"].append(ingredient)

    return diet_plan

@router.get("/get-diet-plan")
def get_diet_plan(user_id: int, cursor=Depends(get_cursor)):


    cursor.execute("SELECT diet_plan FROM dietary_preferences WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()

    if not result or not result["diet_plan"]:
        raise HTTPException(status_code=404, detail=f"No diet plan found for user {user_id}")

    file_path = result["diet_plan"]


    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Diet plan file missing: {file_path}")

    try:
        structured_diet_plan = parse_diet_plan(file_path)
        return {"user_id": user_id, "diet_plan": structured_diet_plan}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing diet plan: {str(e)}")