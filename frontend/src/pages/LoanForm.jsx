import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoanForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    income: "",
    loan_amount: "",
    credit_score: "",
    employment: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ UPDATED: Call backend instead of dummy logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      income: Number(form.income),
      loan_amount: Number(form.loan_amount),
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

      // Navigate with prediction result
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
          Fill in your details to check loan eligibility
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="number"
            name="income"
            placeholder="Monthly Income (₹)"
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
            name="credit_score"
            placeholder="Credit Score (0 or 1)"
            value={form.credit_score}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <select
            name="employment"
            value={form.employment}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select Employment Type</option>
            <option value="salaried">Salaried</option>
            <option value="self-employed">Self-employed</option>
          </select>

          <button type="submit" style={styles.button}>
            Check Eligibility
          </button>
        </form>
      </div>
    </div>
  );
}

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