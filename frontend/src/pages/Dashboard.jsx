import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { Doughnut, Line, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  
  // State Variables
  const [transactions, setTransactions] = useState([]);
  const [isBudgetMode, setIsBudgetMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customLimit, setCustomLimit] = useState("");
  const [activeBudget, setActiveBudget] = useState(null);

  const formatCurrency = (num) =>
    Number(num).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error(err));
  }, []);

  // =========================
  // 🧮 BASIC CALCULATIONS
  // =========================
  const income = transactions
    .filter(t => t.Type === "income")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const expenses = transactions
    .filter(t => t.Type === "expense")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const savings = income - expenses;

  // =========================
  // 📅 MONTHLY KPI
  // =========================
  const currentMonth = new Date().getMonth();
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.Date);
    return date.getMonth() === currentMonth;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.Type === "income")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const monthlyExpense = monthlyTransactions
    .filter(t => t.Type === "expense")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const cashFlow = monthlyIncome - monthlyExpense;
  const avgDailySpend = monthlyExpense / 30;

  // =========================
  // 📊 CATEGORY ANALYSIS
  // =========================
  const categoryMap = {};
  transactions
    .filter(t => t.Type === "expense")
    .forEach(t => {
      categoryMap[t.Category] =
        (categoryMap[t.Category] || 0) + Number(t.Amount);
    });

  const pieData = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        data: Object.values(categoryMap),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF", "#FF9F40"]
      }
    ]
  };

  // =========================
  // 🔝 TOP 3 UNIQUE CATEGORIES (HORIZONTAL BAR)
  // =========================
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topData = {
    labels: topCategories.map(item => item[0]),
    datasets: [
      {
        label: "Total Spend (₹)",
        data: topCategories.map(item => item[1]),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }
    ]
  };

  const topOptions = {
    indexAxis: "y", // This makes it a horizontal bar chart
    responsive: true
  };

  // =========================
  // 📈 MONTHLY & DAILY TRENDS
  // =========================
  const monthMap = {};
  const dailyMap = {};

  transactions
    .filter(t => t.Type === "expense")
    .forEach(t => {
      const date = new Date(t.Date);
      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();
      
      monthMap[month] = (monthMap[month] || 0) + Number(t.Amount);
      dailyMap[day] = (dailyMap[day] || 0) + Number(t.Amount);
    });

  const lineData = {
    labels: Object.keys(monthMap),
    datasets: [{ label: "Monthly Expenses", data: Object.values(monthMap), borderColor: "#36A2EB", fill: false }]
  };

  const dailyData = {
    labels: Object.keys(dailyMap),
    datasets: [{ label: "Daily Expenses", data: Object.values(dailyMap), borderColor: "#FF6384", fill: false }]
  };

  // =========================
  // ⚠️ OUTLIER DETECTION (Z-SCORE MATH)
  // =========================
  const expenseTransactions = transactions.filter(t => t.Type === "expense");
  const amounts = expenseTransactions.map(t => Number(t.Amount));
  const mean = amounts.reduce((a, b) => a + b, 0) / (amounts.length || 1);
  const stdDev = Math.sqrt(
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (amounts.length || 1)
  );

  // Flag if > 2 Standard Deviations from mean
  const outliers = expenseTransactions.filter(t => Number(t.Amount) > mean + 2 * stdDev);
  const topOutliers = outliers.sort((a, b) => b.Amount - a.Amount).slice(0, 3);

  // =========================
  // 🔮 PREDICTED UPCOMING PAYMENTS
  // =========================
  const upcomingPayments = topCategories.slice(0, 2).map(([category, totalAmount]) => ({
    category,
    estimatedAmount: totalAmount / (transactions.length > 30 ? 3 : 1), // Estimate based on history
    dueDate: "Usually 1st week of month",
  }));

  // =========================
  // 🎯 CUSTOM CATEGORY BUDGET TRACKER
  // =========================
  const uniqueCategories = [...new Set(expenseTransactions.map(t => t.Category))];

  const handleSetBudget = () => {
    if (selectedCategory && customLimit) {
      setActiveBudget({ category: selectedCategory, limit: Number(customLimit) });
      setIsBudgetMode(false);
    }
  };

  let budgetChartData = null;
  let budgetAdvice = "";
  let actualSpendForBudget = 0;

  if (activeBudget) {
    actualSpendForBudget = monthlyTransactions
      .filter(t => t.Category === activeBudget.category && t.Type === "expense")
      .reduce((sum, t) => sum + Number(t.Amount), 0);

    budgetChartData = {
      labels: [activeBudget.category],
      datasets: [
        {
          label: "Actual Spend",
          data: [actualSpendForBudget],
          backgroundColor: actualSpendForBudget > activeBudget.limit ? "#e53935" : "#43a047",
        },
        {
          label: "Set Limit",
          data: [activeBudget.limit],
          backgroundColor: "#d3d3d3",
        }
      ]
    };

    if (actualSpendForBudget > activeBudget.limit) {
      budgetAdvice = `⚠️ You exceeded your limit by ₹${formatCurrency(actualSpendForBudget - activeBudget.limit)}. High overspending negatively impacts loan eligibility.`;
    } else if (actualSpendForBudget > activeBudget.limit * 0.8) {
      budgetAdvice = `⚠️ Careful! You have spent ${((actualSpendForBudget / activeBudget.limit) * 100).toFixed(0)}% of your limit.`;
    } else {
      budgetAdvice = `✅ Excellent discipline. You are well within your limit for this category.`;
    }
  }

  // =========================
  // 🎨 RENDER UI
  // =========================
  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h2>Dashboard</h2>
        <div>
          <button onClick={() => navigate("/add-transaction")} style={styles.secondaryButton}>
            + Add Transaction
          </button>
          <button onClick={() => navigate("/loan")} style={styles.primaryButton}>
            Apply Loan
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h4>Monthly Income</h4>
          <p>₹{formatCurrency(monthlyIncome)}</p>
        </div>
        <div style={styles.card}>
          <h4>Monthly Expense</h4>
          <p>₹{formatCurrency(monthlyExpense)}</p>
        </div>
        <div style={styles.card}>
          <h4>Cash Flow</h4>
          <p style={{ color: cashFlow < 0 ? "red" : "green", fontWeight: "bold" }}>
            ₹{formatCurrency(cashFlow)}
          </p>
        </div>
        <div style={styles.card}>
          <h4>Avg Daily Spend</h4>
          <p>₹{formatCurrency(avgDailySpend)}</p>
        </div>
      </div>

      {/* PREDICTIVE & ALERTS ROW */}
      <div style={styles.chartContainer}>
        {/* UPCOMING PAYMENTS */}
        <div style={{...styles.chartBox, flex: 1, borderTop: "4px solid #36A2EB"}}>
          <h4>📅 Predicted Upcoming Payments</h4>
          <p style={{ color: "#666", fontSize: "13px", marginBottom: "15px" }}>
            Based on historical data, prepare for these recurring expenses:
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            {upcomingPayments.map((payment, i) => (
              <div key={i} style={styles.paymentCard}>
                <h5 style={{ margin: "0 0 5px 0" }}>{payment.category}</h5>
                <h3 style={{ margin: "0 0 5px 0", color: "#36A2EB" }}>₹{formatCurrency(payment.estimatedAmount)}</h3>
                <small style={{ color: "#888" }}>{payment.dueDate}</small>
              </div>
            ))}
          </div>
        </div>

        {/* SMART ALERTS */}
        <div style={{...styles.chartBox, flex: 1, borderTop: "4px solid #FF6384", background: "#fff8e1"}}>
          <h4>🚨 Smart Alerts</h4>
          {topOutliers.length === 0 ? (
            <p style={{ color: "green", fontWeight: "bold" }}>✅ Spending is normal. No statistical outliers detected.</p>
          ) : (
            topOutliers.map((t, i) => (
              <div key={i} style={styles.alertItem}>
                <p style={{ margin: "0 0 5px 0" }}>
                  🚨 <b>₹{formatCurrency(t.Amount)}</b> on {t.Category}
                </p>
                <small style={{ color: "#888" }}>Unusually high compared to your mean spend.</small>
              </div>
            ))
          )}
        </div>
      </div>

      {/* INTERACTIVE BUDGET TRACKER */}
      <div style={{...styles.chartBox, borderTop: "4px solid #4CAF50"}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>🎯 Custom Category Budget Tracker</h4>
          <button onClick={() => setIsBudgetMode(!isBudgetMode)} style={styles.outlineButton}>
            {isBudgetMode ? "Cancel" : "Set New Budget"}
          </button>
        </div>

        {isBudgetMode && (
          <div style={styles.budgetForm}>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.inputField}
            >
              <option value="">Select Category...</option>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input 
              type="number" 
              placeholder="Set Monthly Limit (₹)" 
              value={customLimit} 
              onChange={(e) => setCustomLimit(e.target.value)}
              style={styles.inputField}
            />
            <button onClick={handleSetBudget} style={styles.primaryButton}>Analyze</button>
          </div>
        )}

        {activeBudget && !isBudgetMode && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ height: "120px" }}>
              <Bar 
                data={budgetChartData} 
                options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} 
              />
            </div>
            <div style={{ background: actualSpendForBudget > activeBudget.limit ? "#ffebee" : "#e8f5e9", padding: "10px", borderRadius: "6px", marginTop: "10px" }}>
              <p style={{ margin: 0, fontWeight: "500", color: actualSpendForBudget > activeBudget.limit ? "#c62828" : "#2e7d32" }}>
                {budgetAdvice}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CHARTS ROW 1 */}
      <div style={styles.chartContainer}>
        <div style={{...styles.chartBox, flex: 1}}>
          <h4>Spending Breakdown</h4>
          <Doughnut data={pieData} />
        </div>
        <div style={{...styles.chartBox, flex: 2}}>
          <h4>Monthly Trend</h4>
          <Line data={lineData} />
        </div>
      </div>

      {/* MAIN CHARTS ROW 2 */}
      <div style={styles.chartContainer}>
        <div style={{...styles.chartBox, flex: 2}}>
          <h4>Daily Trend</h4>
          <Line data={dailyData} />
        </div>
        <div style={{...styles.chartBox, flex: 1}}>
          <h4>Top 3 Expenses</h4>
          <Bar data={topData} options={topOptions} />
        </div>
      </div>

    </div>
  );
}

// =========================
// 🎨 STYLES
// =========================
const styles = {
  container: { padding: "20px", background: "#f5f7fa", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  
  primaryButton: { background: "#4CAF50", color: "white", padding: "10px 15px", border: "none", borderRadius: "5px", marginLeft: "10px", cursor: "pointer" },
  secondaryButton: { background: "#36A2EB", color: "white", padding: "10px 15px", border: "none", borderRadius: "5px", cursor: "pointer" },
  outlineButton: { background: "transparent", color: "#36A2EB", padding: "8px 12px", border: "1px solid #36A2EB", borderRadius: "5px", cursor: "pointer" },
  
  cardContainer: { display: "flex", gap: "15px", marginBottom: "20px" },
  card: { flex: 1, background: "white", padding: "20px", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  
  chartContainer: { display: "flex", gap: "20px", marginBottom: "20px" },
  chartBox: { background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  
  paymentCard: { flex: 1, padding: "15px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #ddd", textAlign: "center" },
  alertItem: { background: "white", padding: "10px", borderRadius: "6px", marginBottom: "10px", borderLeft: "4px solid #e53935", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  
  budgetForm: { background: "#f0f4f8", padding: "15px", borderRadius: "8px", marginTop: "15px", display: "flex", gap: "10px" },
  inputField: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc", flex: 1 }
};

export default Dashboard;