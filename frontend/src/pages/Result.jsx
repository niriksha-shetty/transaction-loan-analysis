import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const prediction = location.state?.prediction;

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

        {/* Optional button */}
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
    width: "300px"
  },

  approved: {
    color: "green",
    margin: "20px 0"
  },

  rejected: {
    color: "red",
    margin: "20px 0"
  },

  secondaryButton: {
    padding: "10px",
    border: "none",
    background: "#36A2EB",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer"
  }
};

export default Result;