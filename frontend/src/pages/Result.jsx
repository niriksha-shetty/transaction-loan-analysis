import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const prediction = location.state?.prediction;
  const explanation = location.state?.explanation || [];

  return (
    <div style={styles.container}>
      
      {/* 🔙 Back Button */}
      <button style={styles.backButton} onClick={() => navigate("/dashboard")}>
        ← Back
      </button>

      <div style={styles.card}>
        <h2>Loan Result</h2>

        {prediction === 1 ? (
          <h3 style={styles.approved}>Approved ✅</h3>
        ) : (
          <h3 style={styles.rejected}>Rejected ❌</h3>
        )}

        {/* 🔍 Explanation Section */}
        <div style={styles.explanationBox}>
          <h4>Analysis</h4>

          {explanation.length === 0 ? (
            <p>No details available</p>
          ) : (
            explanation.map((item, i) => (
              <p key={i} style={styles.reason}>
                {item}
              </p>
            ))
          )}
        </div>

        {/* 💡 Extra Insight */}
        {prediction === 0 && (
          <div style={styles.tipBox}>
            <p>
              💡 Tip: Improve your credit score, reduce loan amount, or increase assets to improve approval chances.
            </p>
          </div>
        )}

        {/* 🔁 Try Again */}
        <button
          style={styles.secondaryButton}
          onClick={() => navigate("/loan")}
        >
          Try Again
        </button>
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
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "350px"
  },

  approved: {
    color: "green",
    margin: "20px 0",
    fontSize: "22px"
  },

  rejected: {
    color: "red",
    margin: "20px 0",
    fontSize: "22px"
  },

  explanationBox: {
    textAlign: "left",
    marginTop: "20px",
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px"
  },

  reason: {
    margin: "5px 0",
    fontSize: "14px"
  },

  tipBox: {
    marginTop: "15px",
    padding: "10px",
    background: "#fff3cd",
    borderRadius: "6px",
    fontSize: "13px"
  },

  secondaryButton: {
    marginTop: "20px",
    padding: "10px",
    border: "none",
    background: "#36A2EB",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Result;