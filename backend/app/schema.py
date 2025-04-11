from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, Text, ForeignKey, Numeric, ARRAY, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    weight = Column(Float)
    height_feet = Column(Integer)
    height_inches = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)



class DietaryPreference(Base):
    __tablename__ = 'dietary_preferences'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    diet_type = Column(String(50))
    weekly_variety = Column(Integer)
    dislikes = Column(Text)
    diet_plan = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    budget = Column(String(10))
    reason_for_diet = Column(String(50))
    allergens = Column(ARRAY(String))
    lactose_free_ok = Column(String(5))
    other_allergen = Column(Text)
    activity_type = Column(String(50), default="moderate")



class MealLog(Base):
    __tablename__ = 'meal_log'
    __table_args__ = (
        UniqueConstraint('user_id', 'day', 'meal_name', name='unique_meal_per_day'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    day = Column(Date, default=datetime.utcnow().date, nullable=False)
    meal_type = Column(String(20))
    meal_name = Column(String(255), nullable=False)
    calories = Column(Numeric(10, 2), nullable=False)
    protein = Column(Numeric(10, 2), nullable=False)
    carbs = Column(Numeric(10, 2), nullable=False)
    fats = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    extra_meal_reason = Column(Text)
    servings = Column(Numeric)


class NutritionSummary(Base):
    __tablename__ = 'nutrition_summaries'
    __table_args__ = (
        UniqueConstraint('user_id', 'summary_date', name='nutrition_summary_unique'),
    )

    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    summary_date = Column(Date, primary_key=True, default=datetime.utcnow().date)
    summary = Column(Text, nullable=False)



class OTP(Base):
    __tablename__ = 'otps'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    otp = Column(String(6), nullable=False)
    expiry = Column(DateTime, nullable=False)


class WeeklyGraphInsight(Base):
    __tablename__ = 'weekly_graph_insights'
    __table_args__ = (
        UniqueConstraint('user_id', 'week_ending', name='weekly_graph_user_week_unique'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    week_ending = Column(Date, nullable=False)
    summary = Column(Text)


class ConversationLog(Base):
    __tablename__ = 'conversation_logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    is_plan_updated = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(UUID(as_uuid=True), default=uuid.uuid4)
