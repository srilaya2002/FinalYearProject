from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime
import os
from dotenv import load_dotenv

SECRET_KEY = os.getenv("secret_key")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    print(f"Received Token: {token}")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded Payload: {payload}")

        email: str = payload.get("sub")
        exp: int = payload.get("exp")
        if email is None or exp is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Verify token expiry
        current_time = datetime.utcnow().timestamp()
        print(f"Current Time: {current_time}, Token Expiry: {exp}")
        if current_time > exp:
            raise HTTPException(status_code=401, detail="Expired token")

        return {"email": email}
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
