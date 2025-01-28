from datetime import datetime

MEAL_PERIODS = {
    "Breakfast": range(5, 11),
    "Lunch": range(11, 16),
    "Dinner": range(17, 22),
}


def get_current_meal_from_diet_plan(diet_plan_content: str) -> str:
    """
    Fetch the current meal based on the time of day and diet plan content.
    """
    current_day = datetime.now().strftime("%A")
    current_hour = datetime.now().hour
    current_meal = next((meal for meal, hours in MEAL_PERIODS.items() if current_hour in hours), None)

    if not current_meal:
        return "It's outside meal times! Please check your diet plan."

    day_section = extract_day_section(diet_plan_content, current_day)
    if not day_section:
        return f"Couldn't find details for {current_day} in your diet plan."

    meal_details = extract_meal_details(day_section, current_meal)
    if not meal_details:
        return f"Couldn't find {current_meal} details for {current_day}."

    return f"According to your diet plan, you should be eating: {meal_details}"


def extract_day_section(diet_plan_content: str, current_day: str) -> str:
    """
    Extract the section of the diet plan for the given day.
    """
    day_start = diet_plan_content.lower().find(f"**{current_day.lower()}:**")
    if day_start == -1:
        return None

    next_day_start = diet_plan_content.find("**", day_start + 1)
    return diet_plan_content[day_start:next_day_start].strip() if next_day_start != -1 else diet_plan_content[
                                                                                            day_start:].strip()


def extract_meal_details(day_section: str, current_meal: str) -> str:
    """
    Extract meal details for the current meal from the day's section.
    """
    meal_start = day_section.lower().find(f"*{current_meal.lower()}:*")
    if meal_start == -1:
        return None

    meal_end = day_section.find("\n", meal_start)
    meal_details = day_section[meal_start:meal_end].strip() if meal_end != -1 else day_section[meal_start:].strip()
    return meal_details.split(":", 1)[-1].strip()
