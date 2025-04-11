from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime
import os
from dotenv import load_dotenv


load_dotenv()


SECRET_KEY = os.getenv("secret_key")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not found in environment variables.")

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    print(f"Received Token: {token}")
    if not token:
        raise HTTPException(status_code=400, detail="Token is missing or malformed.")
    try:
        print(f"🔑 Decoding JWT with SECRET_KEY: {SECRET_KEY}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded Payload: {payload}")

        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        exp: int = payload.get("exp")


        if exp is None or email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        current_time = int(datetime.utcnow().timestamp())
        print(f"🕒 Current Time: {current_time} ({datetime.utcfromtimestamp(current_time)})")
        print(f"🔒 Token Expiry: {exp} ({datetime.utcfromtimestamp(exp)})")


        if current_time > exp:
            raise HTTPException(status_code=401, detail="Expired token")

        return {"email": email, "id": user_id}

    except JWTError as e:
        print(f"❌ JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
