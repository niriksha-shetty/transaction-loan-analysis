import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddTransaction() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
    type: "" // ✅ NEW FIELD
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Prepare payload for backend
    const payload = {
      Date: form.date,
      Category: form.category,
      Amount: Number(form.amount),
      Type: form.type
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/add-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      alert(data.message || "Transaction added successfully!");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error adding transaction");
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 🔙 Back Button */}
      <button style={styles.backButton} onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      <div style={styles.card}>
        <h2>Add Transaction</h2>
        <p style={styles.subtitle}>
          Record your financial activity
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Amount */}
          <input
            type="number"
            name="amount"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {/* Category */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Shopping">Shopping</option>
            <option value="Travel">Travel</option>
            <option value="Other">Other</option>
          </select>

          {/* Type (IMPORTANT) */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Date */}
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {/* Description (optional) */}
          <input
            type="text"
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Submit */}
          <button type="submit" style={styles.button}>
            Add Transaction
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

export default AddTransaction;