import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { Pie, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);

  // 🔥 Format currency (INDIAN FORMAT)
  const formatCurrency = (num) =>
    Number(num).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });

  // 🔥 Fetch data from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  }, []);

  // 🧮 Calculate Income / Expenses
  const income = transactions
    .filter(t => t.Type === "income")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const expenses = transactions
    .filter(t => t.Type === "expense")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const savings = income - expenses;

  // 📊 Pie Chart (Category-wise expenses)
  const categoryMap = {};
  transactions
    .filter(t => t.Type === "expense")
    .forEach(t => {
      if (!categoryMap[t.Category]) {
        categoryMap[t.Category] = 0;
      }
      categoryMap[t.Category] += Number(t.Amount);
    });

  const pieData = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        data: Object.values(categoryMap),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9966FF",
          "#FF9F40"
        ]
      }
    ]
  };

  // 📈 Line Chart (Monthly expenses)
  const monthMap = {};
  transactions
    .filter(t => t.Type === "expense")
    .forEach(t => {
      const month = new Date(t.Date).toLocaleString("default", {
        month: "short"
      });

      if (!monthMap[month]) {
        monthMap[month] = 0;
      }

      monthMap[month] += Number(t.Amount);
    });

  const lineData = {
    labels: Object.keys(monthMap),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(monthMap),
        borderColor: "#36A2EB",
        fill: false
      }
    ]
  };

  return (
    <div style={styles.container}>
      
      {/* Header */}
      <div style={styles.header}>
        <h2>Dashboard</h2>

        <div>
          <button
            onClick={() => navigate("/add-transaction")}
            style={styles.secondaryButton}
          >
            + Add Transaction
          </button>

          <button
            onClick={() => navigate("/loan")}
            style={styles.primaryButton}
          >
            Apply for Loan
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h4>Total Income</h4>
          <p>₹{formatCurrency(income)}</p>
        </div>

        <div style={styles.card}>
          <h4>Total Expenses</h4>
          <p>₹{formatCurrency(expenses)}</p>
        </div>

        <div style={styles.card}>
          <h4>Savings</h4>
          <p style={{ color: savings < 0 ? "red" : "green" }}>
            {savings < 0
              ? `Loss: ₹${formatCurrency(Math.abs(savings))}`
              : `₹${formatCurrency(savings)}`}
          </p>

          {/* 🔥 Optional Insight */}
          {savings < 0 && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
              Warning: Your expenses exceed your income
            </p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartContainer}>
        <div style={styles.chartBox}>
          <h4>Spending Breakdown</h4>
          <Pie data={pieData} />
        </div>

        <div style={styles.chartBox}>
          <h4>Monthly Expenses</h4>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#f5f7fa",
    minHeight: "100vh"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  primaryButton: {
    padding: "10px 20px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    marginLeft: "10px"
  },

  secondaryButton: {
    padding: "10px 20px",
    background: "#36A2EB",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },

  cardContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px"
  },

  card: {
    flex: 1,
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center"
  },

  chartContainer: {
    display: "flex",
    gap: "20px"
  },

  chartBox: {
    flex: 1,
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }
};

export default Dashboard;