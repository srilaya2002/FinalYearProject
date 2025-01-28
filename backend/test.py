from jose import jwt

# Use the same secret key
secret_key = "EniQJroHQwDpxEVSvkul6iFXiQEG0y8B4kKHiPRqDY8"

# Use the generated token
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjaGFuZHJhc3JlZTIwMDJAZ21haWwuY29tIiwiZXhwIjoxNzM2MDEwNzE2fQ.0f5Of1KGKjpA_gPfPNg9Jw3eyMrwmUGZgX5PgoLnpPQ"

try:
    decoded_payload = jwt.decode(token, secret_key, algorithms=["HS256"])
    print("Decoded Payload:", decoded_payload)
except jwt.ExpiredSignatureError:
    print("Token has expired.")
except jwt.JWTError as e:
    print(f"Failed to decode token: {e}")
