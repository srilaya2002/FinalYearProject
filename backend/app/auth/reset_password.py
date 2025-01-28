from fastapi import APIRouter, HTTPException, Depends
from app.model import ResetPasswordRequest, ResetPasswordOTPRequest
from app.database import get_cursor
from app.email_utils import send_email
from datetime import datetime, timedelta
import random
from passlib.hash import bcrypt

router = APIRouter()

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, cursor=Depends(get_cursor)):
    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.now() + timedelta(minutes=5)

    cursor.execute(
        "INSERT INTO otps (email, otp, expiry) VALUES (%s, %s, %s) "
        "ON CONFLICT (email) DO UPDATE SET otp = %s, expiry = %s",
        (request.email, otp, otp_expiry, otp, otp_expiry)
    )
    conn = cursor.connection
    conn.commit()

    send_email(
        to_email=request.email,
        subject="Your OTP for Password Reset",
        body=f"Your OTP is {otp}. It will expire in 5 minutes."
    )

    return {"message": "OTP sent to email for password reset."}

@router.post("/reset-password/verify")
def reset_password_verify(request: ResetPasswordOTPRequest, cursor=Depends(get_cursor)):
    cursor.execute("SELECT otp, expiry FROM otps WHERE email = %s", (request.email,))
    otp_data = cursor.fetchone()

    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP not found or expired")

    stored_otp, expiry = otp_data
    if stored_otp != request.otp or datetime.now() > expiry:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    hashed_password = bcrypt.hash(request.new_password)

    cursor.execute(
        "UPDATE users SET password = %s WHERE email = %s",
        (hashed_password, request.email)
    )
    cursor.execute("DELETE FROM otps WHERE email = %s", (request.email,))
    conn = cursor.connection
    conn.commit()

    return {"message": "Password reset successfully."}
