from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle

app = FastAPI()

# ✅ Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for dev)
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
# 🤖 Load ML Model
# =========================
model = pickle.load(open("model.pkl", "rb"))

# =========================
# 🏠 Home Route
# =========================
@app.get("/")
def home():
    return {"message": "Backend running successfully"}

# =========================
# 📊 Get All Transactions
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

    # Ensure correct format
    new_row["Amount"] = new_row["Amount"].astype(float)
    new_row["Type"] = new_row["Type"].str.lower()

    # Append
    df = pd.concat([df, new_row], ignore_index=True)

    # ✅ Save persistently
    df.to_csv("cleaned_transactions.csv", index=False)

    return {"message": "Transaction added and saved"}

# =========================
# 🔮 Loan Prediction API (ML)
# =========================
@app.post("/predict")
def predict(data: dict):
    try:
        income = float(data["income"])
        loan = float(data["loan_amount"])
        credit = float(data["credit_score"])

        # ⚠️ IMPORTANT: Same order as training
        features = [[income, loan, credit]]

        prediction = model.predict(features)[0]

        return {"prediction": int(prediction)}

    except Exception as e:
        return {"error": str(e)}