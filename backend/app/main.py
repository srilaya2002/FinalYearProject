from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.auth.signup import router as signup_router
from app.auth.login import router as login_router
from app.auth.reset_password import router as reset_password_router
from app.auth.webSocket import websocket_router
from app.diet.diet_plan import router as diet_plan_router
from app.diet.chat import router as chat_router
from app.diet.fetch_nutrition import router as nutrition_router
from app.diet.services.calories_nutrients import router as calorie_router
from app.diet.fetch_diet_plan import router as diet_router
from app.diet.auto_log_meal import router as auto_log_meals_router
from app.diet.manual_meal_log import router as manual_log_meal_router
from app.diet.nutrition_summary import router as summary_router
from app.utils.openai_summary import router as openai_insight_router
from app.utils.generate_weekly_summary import router as weekly_summary_router
from app.utils.meal_history import router as meal_history_router
from app.utils.chat_history import router as chat_history_router
from app.schema import Base
from app.database import engine


app = FastAPI()

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(signup_router, prefix="/auth", tags=["Auth"])
app.include_router(login_router, prefix="/auth", tags=["Auth"])
app.include_router(reset_password_router, prefix="/auth", tags=["Auth"])
app.include_router(diet_plan_router, prefix="/api/v1", tags=["Diet Plan"])
app.include_router(chat_router, prefix="/api/v1", tags=["Chat"])
app.include_router(nutrition_router, prefix="/api/v1")
app.include_router(websocket_router)

app.include_router(diet_router)


app.include_router(calorie_router, prefix="/api/v1", tags=["Calorie Breakdown"])
app.include_router(weekly_summary_router, prefix="/api/v1",tags=["weekly summary generator"])
app.include_router(auto_log_meals_router, prefix="/api/v1", tags=["Auto Meal Logging"])
app.include_router(manual_log_meal_router, prefix="/api/v1", tags=["Meal Logging"])
app.include_router(summary_router, prefix="/api/v1", tags=["Nutritional Summary"])
app.include_router(openai_insight_router, prefix="/api/v1", tags=["OpenAi insights"])
app.include_router(meal_history_router, prefix="/api/v1", tags=["meal_history"])
app.include_router(chat_history_router, prefix="/api/v1", tags=["chat_history"])

@app.get("/")
def read_root():
    return {"message": "Welcome to NutriMate API!"}
