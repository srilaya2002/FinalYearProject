import sys
import os


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.database import get_cursor

import pandas as pd
from sklearn.linear_model import LinearRegression
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def train_serving_model():

    cursor, connection = get_cursor()


    cursor.execute("""
        SELECT dp.activity_type, ml.meal_type, ml.servings, u.weight, u.height_feet, u.height_inches
        FROM meal_log ml
        JOIN users u ON ml.user_id = u.id
        LEFT JOIN dietary_preferences dp ON u.id = dp.user_id
        WHERE ml.servings IS NOT NULL
    """)
    data = cursor.fetchall()

    if not data:
        print("No data available for training the model.")
        return None

    df = pd.DataFrame(data, columns=["activity_type", "meal_type", "servings", "weight", "height_feet", "height_inches"])


    df = df.dropna()

    print("Cleaned Data: ", df.head())

    if df.shape[0] == 0:
        print("No valid data available for training the model after cleaning.")
        return None

    df["meal_type"] = df["meal_type"].astype("category").cat.codes

    activity_mapping = {
        "sedentary": 1,
        "lightly_active": 2,
        "moderately_active": 3,
        "very_active": 4,
        "super_active": 5
    }
    df["activity_type"] = df["activity_type"].map(activity_mapping)

    df["height_m"] = ((df["height_feet"] * 12) + df["height_inches"]) * 0.0254
    df["bmi"] = df["weight"] / (df["height_m"] ** 2)

    X = df[["bmi", "activity_type", "meal_type"]]
    y = df["servings"]


    if X.isnull().values.any() or y.isnull().values.any():
        print("NaN values found in training data. Cleaning again...")
        valid_mask = ~X.isnull().any(axis=1) & ~y.isnull()
        X = X[valid_mask]
        y = y[valid_mask]

    if X.shape[0] == 0:
        print("No valid data available for model training.")
        return None

    model = LinearRegression()
    model.fit(X, y)

    return model

def get_openai_based_servings(bmi, activity_level, meal_name):

    prompt = f"""
    A user with a BMI of {bmi} and an activity level of {activity_level} is eating {meal_name}.

    Recommend a number of servings. 1 serving = 100g.
    Example outputs:
    - "2.0"
    - "1.5"
    - "2.5"

    Only provide a numeric value.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )

    content = response["choices"][0]["message"]["content"].strip()

    try:
        servings = float(content)
    except ValueError:
        servings = 2.5

    return servings

def predict_servings(user_id, bmi, activity_level, meal_type):

    cursor, connection = get_cursor()

    activity_mapping = {
        "sedentary": 1,
        "lightly_active": 2,
        "moderately_active": 3,
        "very_active": 4,
        "super_active": 5
    }
    activity_level_numeric = activity_mapping.get(activity_level, 3)

    cursor.execute("SELECT COUNT(*) FROM meal_log WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()
    meal_count = result[0] if result and isinstance(result, (list, tuple)) else 0

    if meal_count > 0:
        model = train_serving_model()
        if model is None:
            return 2.5

        meal_type_code = {"breakfast": 0, "lunch": 1, "dinner": 2, "snack": 3}.get(meal_type.lower(), 0)
        prediction = model.predict([[bmi, activity_level_numeric, meal_type_code]])
        return round(prediction[0], 2)
    else:
        return get_openai_based_servings(bmi, activity_level, meal_type)


model = train_serving_model()

if model:
    print("Servings-based model trained successfully!")
else:
    print("Model could not be trained. Check data.")
