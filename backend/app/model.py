from typing import Optional
from pydantic import BaseModel, EmailStr

# Model for user signup
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

# Model for OTP verification
class OTPVerificationRequest(BaseModel):
    email: EmailStr
    otp: str
    password: str

# Model for user login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Model for reset password request
class ResetPasswordRequest(BaseModel):
    email: EmailStr

# Model for reset password OTP verification
class ResetPasswordOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# Model for capturing user details
class UserDetailsRequest(BaseModel):
    age: int
    gender: str
    weight: float
    height_feet: int
    height_inches: int

# Model for capturing dietary preferences
class DietaryPreferencesRequest(BaseModel):
    diet_type: str
    weekly_variety: int
    budget: str
    dislikes: str

# Response model for diet plan
class DietPlanResponse(BaseModel):
    message: str
    diet_plan: Optional[str] = None

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