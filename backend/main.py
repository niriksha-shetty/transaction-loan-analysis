from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle

app = FastAPI()

# =========================
# 🌐 CORS (Frontend access)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 📊 Load Transaction Dataset
# =========================
df = pd.read_csv("cleaned_transactions.csv")

df["Type"] = df["Type"].str.lower()
df["Amount"] = df["Amount"].astype(float)

# =========================
# 🤖 Load NEW ML Model
# =========================
model = pickle.load(open("model2.pkl", "rb"))

# =========================
# 🧠 Explanation Function
# =========================
def generate_explanation(income, loan, ratio, cibil, assets):
    reasons = []

    # Credit Score
    if cibil >= 750:
        reasons.append("✔ Excellent credit score")
    elif cibil >= 700:
        reasons.append("✔ Good credit score")
    elif cibil < 600:
        reasons.append("⚠ Low credit score")

    # Loan burden
    if ratio < 5:
        reasons.append("✔ Low loan-to-income ratio (safe)")
    elif ratio < 10:
        reasons.append("⚠ Moderate loan burden")
    else:
        reasons.append("⚠ High loan burden")

    # Assets
    if assets >= loan:
        reasons.append("✔ Strong asset backing")
    else:
        reasons.append("⚠ Weak asset support")

    return reasons

# =========================
# 🏠 Home Route
# =========================
@app.get("/")
def home():
    return {"message": "Backend running successfully"}

# =========================
# 📊 Get Transactions
# =========================
@app.get("/transactions")
def get_transactions():
    return df.to_dict(orient="records")

# =========================
# ➕ Add Transaction
# =========================
@app.post("/add-transaction")
def add_transaction(data: dict):
    global df

    new_row = pd.DataFrame([data])

    new_row["Amount"] = new_row["Amount"].astype(float)
    new_row["Type"] = new_row["Type"].str.lower()

    df = pd.concat([df, new_row], ignore_index=True)

    df.to_csv("cleaned_transactions.csv", index=False)

    return {"message": "Transaction added and saved"}

# =========================
# 🔮 Loan Prediction API (FINAL)
# =========================
@app.post("/predict")
def predict(data: dict):
    try:
        income = float(data["income"])
        loan = float(data["loan_amount"])
        term = float(data["loan_term"])
        cibil = float(data["credit_score"])
        assets = float(data["assets"])

        # =========================
        # 🔥 Derived Feature
        # =========================
        if income == 0:
            return {"prediction": 0, "message": "Invalid income"}

        loan_to_income = loan / income

        # =========================
        # 🔥 Safety Rule
        # =========================
        if loan_to_income > 20:
            return {
                "prediction": 0,
                "message": "Loan too high compared to income"
            }

        # =========================
        # 🔥 MODEL FEATURES (IMPORTANT ORDER)
        # =========================
        features = [[
            income,
            loan,
            loan_to_income,
            cibil,
            assets,
            term
        ]]

        prediction = model.predict(features)[0]

        # =========================
        # 🔥 Explanation
        # =========================
        explanation = generate_explanation(
            income, loan, loan_to_income, cibil, assets
        )

        return {
            "prediction": int(prediction),
            "details": {
                "loan_to_income_ratio": round(loan_to_income, 2)
            },
            "explanation": explanation
        }

    except Exception as e:
        return {"error": str(e)}