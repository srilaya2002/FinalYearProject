from fastapi import APIRouter, HTTPException, Depends
from app.model import SignupRequest, OTPVerificationRequest
from app.database import get_cursor
from app.email_utils import send_email
from datetime import datetime, timedelta, timezone
from passlib.hash import bcrypt

import random

router = APIRouter()

@router.post("/signup")
def signup(request: SignupRequest):
    cursor, connection = get_cursor()
    """
    Signup endpoint that verifies matching passwords before sending OTP.
    """
    # Check if passwords match
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check if the user already exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (request.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    # Generate OTP and expiry time
    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=5)

    # Insert OTP into the database
    cursor.execute(
        """
        INSERT INTO otps (email, otp, expiry)
        VALUES (%s, %s, %s)
        ON CONFLICT (email)
        DO UPDATE SET otp = EXCLUDED.otp, expiry = EXCLUDED.expiry
        """,
        (request.email, otp, otp_expiry)
    )
    conn = cursor.connection
    conn.commit()

    # Send OTP email
    send_email(
        to_email=request.email,
        subject="Your OTP for Signup",
        body=f"Your OTP is {otp}. It will expire in 5 minutes."
    )

    return {"message": "OTP sent to email. Please verify to complete signup."}

@router.post("/signup/verify-otp")
def verify_signup_otp(request: OTPVerificationRequest):
    cursor, connection = get_cursor()


    cursor.execute("SELECT otp, expiry FROM otps WHERE email = %s", (request.email,))
    otp_data = cursor.fetchone()

    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP not found or expired")

    stored_otp = otp_data["otp"]
    expiry = otp_data["expiry"]

    print("📨 Received OTP:", request.otp)
    print("📦 Stored OTP in DB:", stored_otp)
    print("⏰ Expiry Time:", expiry)
    print("🔑 Password received for signup:", request.password)


    if stored_otp != request.otp or datetime.now() > expiry:
        raise HTTPException(status_code=400, detail="Invalid OTP")


    hashed_password = bcrypt.hash(request.password)


    cursor.execute("INSERT INTO users (email, password) VALUES (%s, %s)", (request.email, hashed_password))
    connection.commit()


    cursor.execute("DELETE FROM otps WHERE email = %s", (request.email,))
    connection.commit()

    return {"message": "Account successfully verified and created."}
