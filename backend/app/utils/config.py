import os
from dotenv import load_dotenv

load_dotenv()

REQUIRED_ENV_VARS = [
    "OPENAI_API_KEY",
    "NUTRITIONIX_APP_ID",
    "NUTRITIONIX_APP_KEY",
]

missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NUTRITIONIX_APP_ID = os.getenv("NUTRITIONIX_APP_ID")
NUTRITIONIX_APP_KEY = os.getenv("NUTRITIONIX_APP_KEY")
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
TIME_ZONE = os.getenv("TIME_ZONE", "UTC")


class Config:
    OPENAI_API_KEY = OPENAI_API_KEY

    NUTRITIONIX_APP_ID = NUTRITIONIX_APP_ID
    NUTRITIONIX_APP_KEY = NUTRITIONIX_APP_KEY
    DEBUG = DEBUG
    TIME_ZONE = TIME_ZONE
