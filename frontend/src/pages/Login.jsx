import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Dummy credentials
  const dummyUser = {
    email: "user@test.com",
    password: "654321"
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === dummyUser.email && password === dummyUser.password) {
      setError("");
      navigate("/dashboard"); // go to dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Login</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={{ marginTop: "10px", fontSize: "12px", color: "gray" }}>
          Demo Credentials: user@test.com / 654321
        </p>
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
    background: "#f5f7fa"
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "300px",
    textAlign: "center"
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
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    background: "#4CAF50",
    color: "white",
    cursor: "pointer"
  },
  error: {
    color: "red",
    fontSize: "14px"
  }
};

export default Login;