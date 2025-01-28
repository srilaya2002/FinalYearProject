import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Validate required environment variables
REQUIRED_ENV_VARS = [
    "OPENAI_API_KEY",
    "NUTRITIONIX_APP_ID",
    "NUTRITIONIX_APP_KEY",
    "USDA_API_KEY"
]

missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing_vars:
    raise RuntimeError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Export variables directly for easier imports
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NUTRITIONIX_APP_ID = os.getenv("NUTRITIONIX_APP_ID")
NUTRITIONIX_APP_KEY = os.getenv("NUTRITIONIX_APP_KEY")
USDA_API_KEY = os.getenv("USDA_API_KEY")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"  # Optional debug mode
TIME_ZONE = os.getenv("TIME_ZONE", "UTC")  # Default to UTC if not set

# Optional: Class-based Config for additional organization
class Config:
    # OpenAI API settings
    OPENAI_API_KEY = OPENAI_API_KEY

    # Nutritionix API settings
    NUTRITIONIX_APP_ID = NUTRITIONIX_APP_ID
    NUTRITIONIX_APP_KEY = NUTRITIONIX_APP_KEY

    # USDA API settings
    USDA_API_KEY = USDA_API_KEY

    # General application settings
    DEBUG = DEBUG
    TIME_ZONE = TIME_ZONE
