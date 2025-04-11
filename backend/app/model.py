from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Model for user signup
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

# Model for OTP verification
class OTPVerificationRequest(BaseModel):
    email: EmailStr
    otp: str
    password: Optional[str] = None

# Model for user login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Model for reset password request
class ResetPasswordRequest(BaseModel):
    email: EmailStr

# In model.py
class SetNewPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str

# Model for reset password OTP verification
class ResetPasswordOTPRequest(BaseModel):
    email: EmailStr
    otp: str

# Model for capturing user details
class UserDetailsRequest(BaseModel):
    age: int
    gender: str
    weight: float
    height_feet: int
    height_inches: int
    bmi: float

# Model for capturing dietary preferences
class DietaryPreferencesRequest(BaseModel):
    diet_type: str
    weekly_variety: int
    budget: str
    dislikes: Optional[List[str]] = Field(default_factory=list)
    reason_for_diet: str  # ✅ Updated: Previously diet_goal, now reason_for_diet
    allergens: Optional[List[str]] = Field(default_factory=list)
    lactose_free_ok: Optional[bool] = None
    other_allergen: Optional[str] = None
    activity_level: str

# Response model for diet plan
class DietPlanResponse(BaseModel):
    message: str
    diet_plan: Optional[str] = None

# Combined model for generating diet plan
class CombinedDietPlanRequest(BaseModel):
    user_details: UserDetailsRequest
    dietary_preferences: DietaryPreferencesRequest


class AdjustDietPlanRequest(BaseModel):
    adjustments: str

class ChatRequest(BaseModel):
    message: str
    adjustments: Optional[str] = None

class CurrentMealResponse(BaseModel):
    message: str
    source: str

class ChatResponse(BaseModel):
    message: str
    data: dict = None
    source: str
    full_message: str = None

class MealLogRequest(BaseModel):
    user_id: int
    meal_type: str
    meal_name: str
    reason: Optional[str] = "No reason provided"
    amount: Optional[str] = "Amount not specified"


# Response model for successful meal logging
class MealLogResponse(BaseModel):
    message: str
    meal_name: str
    amount: float
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fats: Optional[float] = None


class MealLog(BaseModel):
    meal_type: str
    meal_name: str
    amount: Optional[float] = 100.0

class NutritionQuery(BaseModel):
    query: str



