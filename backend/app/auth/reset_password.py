from fastapi import APIRouter, HTTPException
from app.model import ResetPasswordRequest, OTPVerificationRequest, SetNewPasswordRequest
from app.database import get_cursor
from app.email_utils import send_email
from datetime import datetime, timedelta, timezone
from passlib.hash import bcrypt
import random

router = APIRouter()


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    cursor, connection = get_cursor()

    cursor.execute("SELECT password FROM users WHERE email = %s", (request.email,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="Email not registered.")


    if not user["password"]:
        raise HTTPException(status_code=400, detail="This account does not have a password set.")


    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=5)

    cursor.execute(
        """
        INSERT INTO otps (email, otp, expiry) 
        VALUES (%s, %s, %s)
        ON CONFLICT (email) 
        DO UPDATE SET otp = EXCLUDED.otp, expiry = EXCLUDED.expiry
        """,
        (request.email, otp, otp_expiry)
    )
    connection.commit()

    send_email(
        to_email=request.email,
        subject="Your OTP for Password Reset",
        body=f"Your OTP is {otp}. It will expire in 5 minutes."
    )

    return {"message": "OTP sent to email for password reset."}




@router.post("/reset-password/verify-otp")
def verify_reset_otp(request: OTPVerificationRequest):
    cursor, connection = get_cursor()

    cursor.execute("SELECT otp, expiry FROM otps WHERE email = %s", (request.email,))
    otp_data = cursor.fetchone()

    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP not found or expired")

    stored_otp = otp_data["otp"]
    expiry = otp_data["expiry"]

    print("📥 Received OTP:", request.otp)
    print("📦 Stored OTP:", stored_otp)
    print("⏰ Expiry:", expiry)


    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if stored_otp != request.otp or datetime.now(timezone.utc) > expiry:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    return {"message": "OTP verified. You can now reset your password."}



@router.post("/reset-password/set-new")
def set_new_password(request: SetNewPasswordRequest):
    cursor, connection = get_cursor()
    hashed_password = bcrypt.hash(request.new_password)

    cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, request.email))
    cursor.execute("DELETE FROM otps WHERE email = %s", (request.email,))
    connection.commit()

    return {"message": "Password reset successfully."}
