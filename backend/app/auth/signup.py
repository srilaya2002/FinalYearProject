from fastapi import APIRouter, HTTPException, Depends
from app.model import SignupRequest, OTPVerificationRequest
from app.database import get_cursor
from app.email_utils import send_email
from datetime import datetime, timedelta, timezone
from passlib.hash import bcrypt

import random

router = APIRouter()

@router.post("/signup")
def signup(request: SignupRequest, cursor=Depends(get_cursor)):
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

@router.post("/verify-otp")
def verify_otp(request: OTPVerificationRequest, cursor=Depends(get_cursor)):
    """
    Endpoint to verify the OTP and complete user registration.
    """
    print(f"Start OTP verification for email: {request.email}")

    # Fetch OTP and expiry from the database
    cursor.execute("SELECT otp, expiry FROM otps WHERE email = %s", (request.email,))
    otp_data = cursor.fetchone()
    print(f"OTP data fetched from DB: {otp_data}")

    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP not found or expired")

    stored_otp = otp_data["otp"]
    expiry = otp_data["expiry"]

    # Convert expiry to an offset-aware datetime
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    now_utc = datetime.now(timezone.utc)

    print(f"Stored OTP: {stored_otp}, Expiry: {expiry}")
    print(f"Provided OTP: {request.otp}, Current Time: {now_utc}")

    # Validate OTP and expiry
    if stored_otp != request.otp:
        print("OTP mismatch")
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if now_utc > expiry:
        print("OTP expired")
        raise HTTPException(status_code=400, detail="Expired OTP")

    # OTP is valid; hash the password and insert user into the database
    hashed_password = bcrypt.hash(request.password)
    cursor.execute(
        """
        INSERT INTO users (email, password)
        VALUES (%s, %s)
        """,
        (request.email, hashed_password)
    )

    # Delete OTP entry after successful verification
    cursor.execute("DELETE FROM otps WHERE email = %s", (request.email,))
    conn = cursor.connection
    conn.commit()

    print("OTP verification successful")
    return {"message": "Account verified successfully."}
