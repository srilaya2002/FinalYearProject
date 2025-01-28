import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("sender_email")
SENDER_PASSWORD = os.getenv("sender_password")

def send_email(to_email: str, subject: str, body: str):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        raise RuntimeError("Email credentials are not set in environment variables.")

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            message = f"Subject: {subject}\n\n{body}"
            server.sendmail(SENDER_EMAIL, to_email, message)
    except Exception as e:
        raise RuntimeError(f"Failed to send email: {e}")
