import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoanForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    income: "",
    loan_amount: "",
    loan_term: "",
    credit_score: "",
    assets: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ CONNECT TO BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      income: Number(form.income),
      loan_amount: Number(form.loan_amount),
      loan_term: Number(form.loan_term),
      credit_score: Number(form.credit_score),
      assets: Number(form.assets)
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
      alert("Error connecting to server");
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 🔙 Back Button */}
      <button style={styles.backButton} onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      <div style={styles.card}>
        <h2>Loan Application</h2>
        <p style={styles.subtitle}>
          Enter your financial details to check loan eligibility
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          <input
            type="number"
            name="income"
            placeholder="Annual Income (₹)"
            value={form.income}
            onChange={handleChange}
            required
            style={styles.input}
          />

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
            placeholder="CIBIL Score (300 - 900)"
            value={form.credit_score}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="number"
            name="assets"
            placeholder="Total Assets Value (₹)"
            value={form.assets}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Check Eligibility
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================
// 🎨 STYLES
// =========================
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
    position: "relative"
  },

  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "8px 12px",
    border: "none",
    background: "#ddd",
    borderRadius: "5px",
    cursor: "pointer"
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center"
  },

  subtitle: {
    fontSize: "14px",
    color: "gray",
    marginBottom: "20px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },

  button: {
    padding: "12px",
    borderRadius: "5px",
    border: "none",
    background: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default LoanForm;