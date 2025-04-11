from datetime import datetime
import re

MEAL_PERIODS = {
    "Breakfast": range(5, 11),
    "Lunch": range(11, 16),
    "Dinner": range(17, 22),
}


def get_current_meal_from_diet_plan(diet_plan_content: str) -> str:

    current_day = datetime.now().strftime("%A")
    current_hour = datetime.now().hour


    current_meal = None
    for meal, hours in MEAL_PERIODS.items():
        if current_hour in hours:
            current_meal = meal
            break


    if not current_meal:
        if current_hour < 5:
            return "It's too early for meals! Breakfast starts at 5 AM."
        elif 16 <= current_hour < 17:
            return "It's between meals. Your next meal is dinner at 5 PM. Would you like suggestions for a snack?"
        elif current_hour >= 22:
            return "Dinner has ended. If you're hungry, try a light snack like fruit or yogurt."


    day_section = extract_day_section(diet_plan_content, current_day)
    if not day_section:
        return f"Couldn't find meal details for {current_day}."


    meal_details = extract_meal_details(day_section, current_meal)
    if not meal_details:
        return f"Couldn't find {current_meal} details for {current_day}."

    return f"According to your diet plan, you should be eating: {meal_details}"

def extract_day_section(diet_plan_content: str, current_day: str) -> str:

    day_pattern = re.compile(rf"\*\*{current_day}:\*\*", re.IGNORECASE)
    match = day_pattern.search(diet_plan_content)

    if not match:
        return None

    start_index = match.end()
    next_day_match = re.search(r"\*\*[A-Za-z]+:\*\*", diet_plan_content[start_index:])

    if next_day_match:
        end_index = start_index + next_day_match.start()
        return diet_plan_content[start_index:end_index].strip()
    else:
        return diet_plan_content[start_index:].strip()

def extract_meal_details(day_section: str, current_meal: str) -> str:

    meal_pattern = re.compile(rf"\*{current_meal}:\*\s*(.*)", re.IGNORECASE)
    match = meal_pattern.search(day_section)

    if match:
        return match.group(1).strip()  # Extract meal details
    return None

def get_all_meals_for_today(diet_plan_content: str) -> str:

    current_day = datetime.now().strftime("%A")

    day_section = extract_day_section(diet_plan_content, current_day)
    if not day_section:
        return f"Couldn't find meal details for {current_day}."

    return f"Here is your full meal plan for {current_day}:\n\n{day_section}"

