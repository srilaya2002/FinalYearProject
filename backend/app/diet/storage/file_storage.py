import os
import json
import logging


from fastapi import HTTPException

def save_user_details(user_id, user_details, cursor, user_email):

    try:
        cursor.execute(
            """
            INSERT INTO users 
            (id, email, age, gender, weight, height_feet, height_inches, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            age = EXCLUDED.age,
            gender = EXCLUDED.gender,
            weight = EXCLUDED.weight,
            height_feet = EXCLUDED.height_feet,
            height_inches = EXCLUDED.height_inches,
            updated_at = NOW();
            """,
            (
                user_id,
                user_email,
                user_details.age,
                user_details.gender,
                user_details.weight,
                user_details.height_feet,
                user_details.height_inches,
            )
        )
        cursor.connection.commit()
    except Exception as e:
        cursor.connection.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving user details: {str(e)}")


def save_diet_plan(user_id, diet_plan_content: dict, dietary_preferences, user_details, cursor,user_email):

    save_user_details(user_id, user_details, cursor, user_email)

    file_name = f"user_{user_id}_diet_plan.json"
    file_path = os.path.abspath(os.path.join("diet_plans", file_name))
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(diet_plan_content, file, indent=4)

    dislikes_array = dietary_preferences.dislikes or []
    allergens_array = dietary_preferences.allergens or []

    logging.debug(f"Dislikes Array: {dislikes_array}, Allergens Array: {allergens_array}")

    cursor.execute(
        """
        INSERT INTO dietary_preferences 
        (user_id, diet_type, weekly_variety, dislikes, diet_plan, created_at, updated_at, budget, reason_for_diet, allergens, lactose_free_ok, other_allergen)
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), %s, %s, %s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE SET
        diet_type = EXCLUDED.diet_type,
        weekly_variety = EXCLUDED.weekly_variety,
        dislikes = EXCLUDED.dislikes,
        diet_plan = EXCLUDED.diet_plan,
        updated_at = NOW(),
        budget = EXCLUDED.budget,
        reason_for_diet = EXCLUDED.reason_for_diet,
        allergens = EXCLUDED.allergens,
        lactose_free_ok = EXCLUDED.lactose_free_ok,
        other_allergen = EXCLUDED.other_allergen;
        """,
        (
            user_id,
            dietary_preferences.diet_type,
            dietary_preferences.weekly_variety,
            dislikes_array,
            file_path,
            dietary_preferences.budget,
            dietary_preferences.reason_for_diet,
            allergens_array,
            dietary_preferences.lactose_free_ok,
            dietary_preferences.other_allergen,
        )
    )
    cursor.connection.commit()

def load_diet_plan(file_path: str) -> dict:

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)
