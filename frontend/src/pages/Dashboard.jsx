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
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error(err));
  }, []);

  // =========================
  // BASIC CALCULATIONS
  // =========================
  const income = transactions
    .filter((t) => t.Type === "income")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const expenses = transactions
    .filter((t) => t.Type === "expense")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const savings = income - expenses;

  // =========================
  // MONTHLY KPI
  // =========================
  const currentMonth = new Date().getMonth();

  const monthlyTransactions = transactions.filter((t) => {
    const date = new Date(t.Date);
    return date.getMonth() === currentMonth;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.Type === "income")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.Type === "expense")
    .reduce((sum, t) => sum + Number(t.Amount), 0);

  const cashFlow = monthlyIncome - monthlyExpense;
  const avgDailySpend = monthlyExpense / 30;

  // =========================
  // CATEGORY ANALYSIS
  // =========================
  const expenseTransactions = transactions.filter(
    (t) => t.Type === "expense"
  );

  const categoryMap = {};

  expenseTransactions.forEach((t) => {
    categoryMap[t.Category] =
      (categoryMap[t.Category] || 0) + Number(t.Amount);
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

  // =========================
  // TOP 3 CATEGORIES
  // =========================
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const topData = {
    labels: topCategories.map((item) => item[0]),
    datasets: [
      {
        label: "Total Spend (₹)",
        data: topCategories.map((item) => item[1]),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56"
        ]
      }
    ]
  };

  const topOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // =========================
  // MONTHLY & DAILY TRENDS
  // =========================
  const monthMap = {};
  const dailyMap = {};

  expenseTransactions.forEach((t) => {
    const date = new Date(t.Date);

    const month = date.toLocaleString("default", {
      month: "short"
    });

    const day = date.getDate();

    monthMap[month] =
      (monthMap[month] || 0) + Number(t.Amount);

    dailyMap[day] =
      (dailyMap[day] || 0) + Number(t.Amount);
  });

  const lineData = {
    labels: Object.keys(monthMap),
    datasets: [
      {
        label: "Monthly Expenses",
        data: Object.values(monthMap),
        borderColor: "#36A2EB",
        fill: false,
        tension: 0.3
      }
    ]
  };

  const dailyData = {
    labels: Object.keys(dailyMap),
    datasets: [
      {
        label: "Daily Expenses",
        data: Object.values(dailyMap),
        borderColor: "#FF6384",
        fill: false,
        tension: 0.3
      }
    ]
  };

  // =========================
  // OUTLIER DETECTION
  // =========================
  const amounts = expenseTransactions.map((t) =>
    Number(t.Amount)
  );

  const mean =
    amounts.reduce((a, b) => a + b, 0) /
    (amounts.length || 1);

  const stdDev = Math.sqrt(
    amounts.reduce(
      (sum, val) =>
        sum + Math.pow(val - mean, 2),
      0
    ) / (amounts.length || 1)
  );

  const outliers = expenseTransactions.filter(
    (t) => Number(t.Amount) > mean + 2 * stdDev
  );

  const topOutliers = outliers
    .sort((a, b) => b.Amount - a.Amount)
    .slice(0, 3);

  // =========================
  // UPCOMING PAYMENTS
  // =========================
  const upcomingPayments = topCategories.map(
    ([category, total]) => ({
      category,
      estimatedAmount: total / 3,
      dueDate: "Next month"
    })
  );

  // =========================
  // CUSTOM BUDGET
  // =========================
  const uniqueCategories = [
    ...new Set(
      expenseTransactions.map((t) => t.Category)
    )
  ];

  const handleSetBudget = () => {
    if (selectedCategory && customLimit) {
      setActiveBudget({
        category: selectedCategory,
        limit: Number(customLimit)
      });
      setIsBudgetMode(false);
    }
  };

  let actualSpendForBudget = 0;
  let budgetAdvice = "";
  let budgetChartData = null;

  if (activeBudget) {
    actualSpendForBudget = monthlyTransactions
      .filter(
        (t) =>
          t.Type === "expense" &&
          t.Category === activeBudget.category
      )
      .reduce(
        (sum, t) => sum + Number(t.Amount),
        0
      );

    budgetChartData = {
      labels: [activeBudget.category],
      datasets: [
        {
          label: "Actual Spend",
          data: [actualSpendForBudget],
          backgroundColor:
            actualSpendForBudget >
            activeBudget.limit
              ? "#e53935"
              : "#43a047"
        },
        {
          label: "Limit",
          data: [activeBudget.limit],
          backgroundColor: "#cfd8dc"
        }
      ]
    };

    if (
      actualSpendForBudget >
      activeBudget.limit
    ) {
      budgetAdvice =
        "⚠️ Limit exceeded. Reduce discretionary expenses.";
    } else if (
      actualSpendForBudget >
      activeBudget.limit * 0.8
    ) {
      budgetAdvice =
        "⚠️ Near limit. Spend carefully for the rest of month.";
    } else {
      budgetAdvice =
        "✅ Healthy spending. You are within budget.";
    }
  }

  // =========================
  // APPLY LOAN BUTTON FLOW
  // =========================
  const handleApplyLoan = () => {
    navigate("/loanpredict", {
      state: {
        income: monthlyIncome * 12, // ✅ Converted to Annual Income
        assets: savings > 0 ? savings * 12 : 0 // ✅ Estimated Annual Savings
      }
    });
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>Dashboard</h2>

        <div>
          <button
            onClick={() =>
              navigate("/add-transaction")
            }
            style={styles.secondaryButton}
          >
            + Add Transaction
          </button>

          <button
            onClick={handleApplyLoan}
            style={styles.primaryButton}
          >
            Apply Loan
          </button>
        </div>
      </div>

      {/* KPI */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h4>Monthly Income</h4>
          <p>
            ₹{formatCurrency(monthlyIncome)}
          </p>
        </div>

        <div style={styles.card}>
          <h4>Monthly Expense</h4>
          <p>
            ₹{formatCurrency(monthlyExpense)}
          </p>
        </div>

        <div style={styles.card}>
          <h4>Cash Flow</h4>
          <p
            style={{
              color:
                cashFlow < 0
                  ? "red"
                  : "green",
              fontWeight: "bold"
            }}
          >
            ₹{formatCurrency(cashFlow)}
          </p>
        </div>

        <div style={styles.card}>
          <h4>Avg Daily Spend</h4>
          <p>
            ₹{formatCurrency(avgDailySpend)}
          </p>
        </div>
      </div>

      {/* ALERTS + PAYMENTS */}
      <div style={styles.chartContainer}>
        <div
          style={{
            ...styles.chartBox,
            flex: 1
          }}
        >
          <h4>📅 Upcoming Payments</h4>

          {upcomingPayments.map(
            (item, i) => (
              <div
                key={i}
                style={styles.paymentCard}
              >
                <strong>
                  {item.category}
                </strong>
                <p>
                  ₹
                  {formatCurrency(
                    item.estimatedAmount
                  )}
                </p>
                <small>
                  {item.dueDate}
                </small>
              </div>
            )
          )}
        </div>

        <div
          style={{
            ...styles.chartBox,
            flex: 1,
            background: "#fff8e1"
          }}
        >
          <h4>🚨 Smart Alerts</h4>

          {topOutliers.length === 0 ? (
            <p>
              ✅ No unusual spending
              detected
            </p>
          ) : (
            topOutliers.map(
              (t, i) => (
                <div
                  key={i}
                  style={
                    styles.alertItem
                  }
                >
                  ₹
                  {formatCurrency(
                    t.Amount
                  )}{" "}
                  on {t.Category}
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* BUDGET */}
      <div style={styles.chartBox}>
        <div style={styles.rowBetween}>
          <h4>
            🎯 Budget Tracker
          </h4>

          <button
            onClick={() =>
              setIsBudgetMode(
                !isBudgetMode
              )
            }
            style={
              styles.outlineButton
            }
          >
            {isBudgetMode
              ? "Cancel"
              : "Set Budget"}
          </button>
        </div>

        {isBudgetMode && (
          <div style={styles.budgetForm}>
            <select
              value={
                selectedCategory
              }
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              style={
                styles.inputField
              }
            >
              <option value="">
                Select Category
              </option>

              {uniqueCategories.map(
                (cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                )
              )}
            </select>

            <input
              type="number"
              placeholder="Limit ₹"
              value={customLimit}
              onChange={(e) =>
                setCustomLimit(
                  e.target.value
                )
              }
              style={
                styles.inputField
              }
            />

            <button
              onClick={
                handleSetBudget
              }
              style={
                styles.primaryButton
              }
            >
              Analyze
            </button>
          </div>
        )}

        {activeBudget && (
          <>
            <Bar
              data={
                budgetChartData
              }
              options={{
                indexAxis: "y"
              }}
            />

            <p
              style={{
                marginTop: "10px",
                fontWeight: "bold"
              }}
            >
              {budgetAdvice}
            </p>
          </>
        )}
      </div>

      {/* CHART ROW 1 */}
      <div style={styles.chartContainer}>
        <div
          style={{
            ...styles.chartBox,
            flex: 1
          }}
        >
          <h4>
            Spending Breakdown
          </h4>
          <Doughnut data={pieData} />
        </div>

        <div
          style={{
            ...styles.chartBox,
            flex: 2
          }}
        >
          <h4>
            Monthly Trend
          </h4>
          <Line data={lineData} />
        </div>
      </div>

      {/* CHART ROW 2 */}
      <div style={styles.chartContainer}>
        <div
          style={{
            ...styles.chartBox,
            flex: 2
          }}
        >
          <h4>Daily Trend</h4>
          <Line data={dailyData} />
        </div>

        <div
          style={{
            ...styles.chartBox,
            flex: 1
          }}
        >
          <h4>
            Top Categories
          </h4>
          <Bar
            data={topData}
            options={topOptions}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#f5f7fa",
    fontFamily: "Arial"
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    marginBottom: "20px"
  },

  rowBetween: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center"
  },

  primaryButton: {
    background: "#4CAF50",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px"
  },

  secondaryButton: {
    background: "#36A2EB",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  outlineButton: {
    background: "white",
    border: "1px solid #36A2EB",
    color: "#36A2EB",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  cardContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px"
  },

  card: {
    flex: 1,
    background: "white",
    padding: "18px",
    borderRadius: "8px",
    textAlign: "center"
  },

  chartContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px"
  },

  chartBox: {
    background: "white",
    padding: "20px",
    borderRadius: "8px"
  },

  paymentCard: {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "10px"
  },

  alertItem: {
    background: "white",
    padding: "10px",
    marginBottom: "8px",
    borderLeft:
      "4px solid #e53935"
  },

  budgetForm: {
    display: "flex",
    gap: "10px",
    margin: "15px 0"
  },

  inputField: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    flex: 1
  }
};

export default Dashboard;