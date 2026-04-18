import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoanPredict() {
  const location = useLocation();
  const navigate = useNavigate();

  // 📥 Auto-filled values from Dashboard
  const dashboardData = location.state || {};

  const [form, setForm] = useState({
    income: dashboardData.income || "",
    assets: dashboardData.assets || "",
    loan_amount: "",
    loan_term: "",
    credit_score: ""
  });

  const [loading, setLoading] = useState(false);

  const formatCurrency = (num) =>
    Number(num).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // 🔮 Predict Loan Eligibility
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const payload = {
      income: Number(form.income),
      assets: Number(form.assets),
      loan_amount: Number(form.loan_amount),
      loan_term: Number(form.loan_term),
      credit_score: Number(form.credit_score)
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      navigate("/result", { state: data });

    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      
      {/* 🔙 Back */}
      <button
        style={styles.backButton}
        onClick={() => navigate("/dashboard")}
      >
        ← Back
      </button>

      <div style={styles.card}>
        <h2>Loan Prediction</h2>

        <p style={styles.subtitle}>
          Using your dashboard financial data
        </p>

        {/* 🔗 Integration Proof */}
        <div style={styles.infoBox}>
          <p>
            <strong>Auto-filled Income:</strong>{" "}
            ₹{formatCurrency(form.income || 0)}
          </p>

          <p>
            <strong>Auto-filled Assets:</strong>{" "}
            ₹{formatCurrency(form.assets || 0)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >
          {/* Readonly Auto Values */}
          <input
            type="number"
            name="income"
            value={form.income}
            readOnly
            style={styles.readonlyInput}
          />

          <input
            type="number"
            name="assets"
            value={form.assets}
            readOnly
            style={styles.readonlyInput}
          />

          {/* User Inputs */}
          <input
            type="number"
            name="loan_amount"
            placeholder="Loan Amount (₹)"
            value={form.loan_amount}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="number"
            name="loan_term"
            placeholder="Loan Term (months)"
            value={form.loan_term}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="number"
            name="credit_score"
            placeholder="Credit Score (300 - 900)"
            value={form.credit_score}
            onChange={handleChange}
            min="300" 
            max="900"
            required
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading
              ? "Checking..."
              : "Check Eligibility"}
          </button>
        </form>

        {/* 🧪 Test Mode */}
        <button
          style={styles.testButton}
          onClick={() => navigate("/loan")}
        >
          Test Mode
        </button>

        <p style={styles.smallText}>
          Test Mode allows manual what-if scenario testing.
        </p>
      </div>
    </div>
  );
}

// =========================
// 🎨 Styles
// =========================
const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: "20px"
  },

  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#ddd",
    cursor: "pointer"
  },

  card: {
    width: "420px",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
  },

  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "15px"
  },

  infoBox: {
    background: "#eef7ff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "14px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  input: {
    padding: "11px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  readonlyInput: {
    padding: "11px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#f0f0f0"
  },

  button: {
    marginTop: "5px",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  testButton: {
    marginTop: "18px",
    width: "100%",
    padding: "11px",
    border: "1px solid #36A2EB",
    background: "white",
    color: "#36A2EB",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  smallText: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#777",
    textAlign: "center"
  }
};

export default LoanPredict;