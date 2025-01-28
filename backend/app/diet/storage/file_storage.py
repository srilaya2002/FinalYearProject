import os

def save_diet_plan(user_id, diet_plan_content: str, dietary_preferences, cursor):
    """
    Save the diet plan to a file and update the database.
    """
    file_name = f"user_{user_id}_diet_plan.txt"
    file_path = os.path.abspath(os.path.join("diet_plans", file_name))
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "w", encoding="utf-8") as file:
        file.write(diet_plan_content)

    cursor.execute(
        """
        INSERT INTO dietary_preferences (user_id, diet_plan, diet_type, weekly_variety, budget, dislikes, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            diet_plan = EXCLUDED.diet_plan,
            diet_type = EXCLUDED.diet_type,
            weekly_variety = EXCLUDED.weekly_variety,
            budget = EXCLUDED.budget,
            dislikes = EXCLUDED.dislikes,
            updated_at = NOW()
        """,
        (user_id, file_path, dietary_preferences.diet_type, dietary_preferences.weekly_variety, dietary_preferences.budget, dietary_preferences.dislikes),
    )
    cursor.connection.commit()

def load_diet_plan(file_path: str) -> str:
    """
    Load a diet plan from a file.
    """
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()
