from fastapi import FastAPI
from app.diet.chat import router as chat_router
from starlette.middleware.cors import CORSMiddleware

from app.auth.signup import router as signup_router
from app.auth.login import router as login_router
from app.auth.reset_password import router as reset_password_router
from app.diet.diet_plan import router as diet_plan_router
from app.auth.webSocket import websocket_router
from app.diet.fetch_nutrition import router as nutrition_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # Add your React app URL here
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(chat_router)
app.include_router(nutrition_router, prefix="/api/v1")
# Include routers
app.include_router(signup_router, prefix="/auth", tags=["Auth"])
app.include_router(login_router, prefix="/auth", tags=["Auth"])
app.include_router(reset_password_router, prefix="/auth", tags=["Auth"])
app.include_router(diet_plan_router, prefix="/api/v1", tags=["Diet Plan"])
app.include_router(websocket_router)
