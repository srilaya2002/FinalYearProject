# from fastapi import APIRouter, Depends, HTTPException
# from app.database import get_cursor
# from app.auth.utils import get_current_user
# from app.model import UserDetailsRequest, DietaryPreferencesRequest, DietPlanResponse
# from app.diet.storage.file_storage import  load_diet_plan
# from app.diet.diet_plan import generate_diet_plan
# from typing import TextIO
# import os
# import json
#
# router = APIRouter(prefix="/api/v1", tags=["Dietary Preferences"])
#
# # Helper function to save the diet plan as a JSON file
#
# def save_diet_plan_to_file(user_id: int, diet_plan_content: str) -> str:
#     """
#     Save the diet plan to a JSON file and return the file path.
#
#     :param user_id: The ID of the user
#     :param diet_plan_content: The diet plan content to save
#     :return: The file path of the saved JSON file
#     """
#     try:
#         # Define file path
#         file_name = f"user_{user_id}_diet_plan.json"
#         file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../dietPlan", file_name))
#
#         # Ensure directory exists
#         os.makedirs(os.path.dirname(file_path), exist_ok=True)
#
#         # Write to the JSON file
#         with open(file_path, mode="w", encoding="utf-8") as json_file:
#             json.dump({"diet_plan": diet_plan_content}, json_file, ensure_ascii=False, indent=4)
#
#         return file_path
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error saving diet plan file: {str(e)}")
#
# # Helper function to update user details
# def update_user_details(cursor, user_id, user_details: UserDetailsRequest):
#     cursor.execute(
#         """
#         UPDATE users
#         SET age = %s, gender = %s, weight = %s, height_feet = %s, height_inches = %s, updated_at = NOW()
#         WHERE id = %s
#         """,
#         (
#             user_details.age,
#             user_details.gender,
#             user_details.weight,
#             user_details.height_feet,
#             user_details.height_inches,
#             user_id,
#         )
#     )
#
# # Helper function to save or update dietary preferences
# def save_or_update_preferences(cursor, user_id, dietary_preferences: DietaryPreferencesRequest, diet_plan_path):
#     cursor.execute("SELECT * FROM dietary_preferences WHERE user_id = %s", (user_id,))
#     existing_preferences = cursor.fetchone()
#
#     if existing_preferences:
#         # Update preferences
#         cursor.execute(
#             """
#             UPDATE dietary_preferences
#             SET diet_type = %s, weekly_variety = %s, budget = %s, dislikes = %s, diet_plan = %s, updated_at = NOW()
#             WHERE user_id = %s
#             """,
#             (
#                 dietary_preferences.diet_type,
#                 dietary_preferences.weekly_variety,
#                 dietary_preferences.budget,
#                 dietary_preferences.dislikes,
#                 diet_plan_path,
#                 user_id,
#             )
#         )
#     else:
#         # Insert new preferences
#         cursor.execute(
#             """
#             INSERT INTO dietary_preferences (user_id, diet_type, weekly_variety, budget, dislikes, diet_plan, created_at, updated_at)
#             VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
#             """,
#             (
#                 user_id,
#                 dietary_preferences.diet_type,
#                 dietary_preferences.weekly_variety,
#                 dietary_preferences.budget,
#                 dietary_preferences.dislikes,
#                 diet_plan_path,
#             )
#         )
#
# # POST endpoint to save preferences
# @router.post("/preferences", response_model=DietPlanResponse)
# def save_preferences(
#     user_details: UserDetailsRequest,
#     dietary_preferences: DietaryPreferencesRequest,
#     cursor=Depends(get_cursor),
#     user=Depends(get_current_user)
# ):
#     """
#     Save or update user details and dietary preferences for the current user and generate a diet plan.
#     """
#     try:
#         # Get the user's ID
#         cursor.execute("SELECT id FROM users WHERE email = %s", (user["email"],))
#         user_data = cursor.fetchone()
#         if not user_data:
#             raise HTTPException(status_code=404, detail="User not found")
#         user_id = user_data["id"]
#
#         # Update user details in the `users` table
#         update_user_details(cursor, user_id, user_details)
#
#         # Generate the diet plan
#         diet_plan_response = generate_diet_plan(user_details, dietary_preferences, user, cursor)
#
#         # Save the diet plan to a file
#         diet_plan_file_path = save_diet_plan_to_file(user_id, diet_plan_response["diet_plan"])
#
#         # Save or update dietary preferences in the database
#         save_or_update_preferences(cursor, user_id, dietary_preferences, diet_plan_file_path)
#
#         # Commit the changes
#         cursor.connection.commit()
#
#         return {"message": "Preferences and diet plan saved successfully.", "diet_plan": diet_plan_file_path}
#
#     except Exception as e:
#         cursor.connection.rollback()
#         raise HTTPException(status_code=500, detail=f"Failed to save preferences or generate diet plan: {str(e)}")
#
# @router.get("/preferences", response_model=dict)
# def get_preferences(
#     cursor=Depends(get_cursor),
#     user=Depends(get_current_user)
# ):
#     """
#     Retrieve dietary preferences for the current user, including the decrypted diet plan.
#     """
#     try:
#         # Get the user's ID
#         cursor.execute("SELECT id FROM users WHERE email = %s", (user["email"],))
#         user_data = cursor.fetchone()
#         if not user_data:
#             raise HTTPException(status_code=404, detail="User not found")
#         user_id = user_data["id"]
#
#         # Fetch the user's preferences
#         cursor.execute(
#             """
#             SELECT diet_type, weekly_variety, dislikes, budget, diet_plan
#             FROM dietary_preferences
#             WHERE user_id = %s
#             """,
#             (user_id,)
#         )
#         preferences = cursor.fetchone()
#
#         if not preferences:
#             raise HTTPException(status_code=404, detail="No dietary preferences found")
#
#         # Decrypt the diet plan
#         diet_plan_content = None
#         if preferences["diet_plan"]:
#             try:
#                 diet_plan_content = load_diet_plan_from_file(preferences["diet_plan"])
#             except Exception as e:
#                 raise HTTPException(status_code=500, detail=f"Error decrypting diet plan: {str(e)}")
#
#         # Return preferences with the decrypted diet plan content
#         return {
#             "diet_type": preferences["diet_type"],
#             "weekly_variety": preferences["weekly_variety"],
#             "dislikes": preferences["dislikes"],
#             "budget": preferences["budget"],
#             "diet_plan": diet_plan_content,  # Decrypted content
#         }
#
#
#
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to retrieve preferences: {str(e)}")
#
#
#
