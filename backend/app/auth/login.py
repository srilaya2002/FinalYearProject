from fastapi import APIRouter, HTTPException, Depends
from passlib.hash import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from app.model import LoginRequest
from app.database import get_cursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

# JWT Configuration
SECRET_KEY = os.getenv("secret_key")  # Corrected to match .env variable
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in the .env file")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=60)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
def login(request: LoginRequest, cursor=Depends(get_cursor)):
    # Verify user credentials
    cursor.execute("SELECT email, password FROM users WHERE email = %s", (request.email,))
    user = cursor.fetchone()

    if not user or not bcrypt.verify(request.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    cursor.execute(
        "SELECT diet_plan FROM dietary_preferences WHERE user_id = (SELECT id FROM users WHERE email = %s)",
        (request.email,),
    )
    diet_plan = cursor.fetchone()



    # Generate JWT token
    access_token = create_access_token(data={"sub": user["email"]})

    return {
        "token": access_token,  # Change 'access_token' to 'token'
        "has_diet_plan": bool(diet_plan and diet_plan["diet_plan"])
    }