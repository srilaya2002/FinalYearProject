from fastapi import APIRouter, HTTPException, Depends
from passlib.hash import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from app.model import LoginRequest
from app.database import get_cursor
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse


load_dotenv()

router = APIRouter()


SECRET_KEY = os.getenv("secret_key")
if not SECRET_KEY:
    raise ValueError("🚨 SECRET_KEY is missing in the environment variables!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(user_id: int, email: str, expires_delta: timedelta = timedelta(minutes=60)):

    to_encode = {
        "sub": email,
        "id": user_id,
        "exp": datetime.utcnow() + expires_delta
    }

    print(f"🔑 Encoding JWT with SECRET_KEY: {SECRET_KEY}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"🛡️ Generated JWT Token: {encoded_jwt}")
    return encoded_jwt


@router.post("/login")
def login(request: LoginRequest):

    cursor, connection = get_cursor()


    cursor.execute("SELECT id, email, password FROM users WHERE email = %s", (request.email,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not bcrypt.verify(request.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    cursor.execute(
        """
        SELECT dietary_preferences.diet_plan 
        FROM dietary_preferences 
        WHERE user_id = %s
        """,
        (user["id"],),
    )
    diet_plan = cursor.fetchone()


    access_token = create_access_token(user_id=user["id"], email=user["email"])

    connection.commit()
    return {
        "token": access_token,
        "user_id": user["id"],
        "has_diet_plan": bool(diet_plan and diet_plan["diet_plan"])
    }


@router.post("/logout")
def logout():


    return JSONResponse(content={"message": "Successfully logged out!"})
