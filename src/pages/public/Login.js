// src/pages/public/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email && password) {
      // ✅ Save user info in localStorage (mock authentication)
      const user = { email, role };
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Redirect to respective dashboard
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "franchise") {
        navigate("/franchise/dashboard");
      }
    } else {
      alert("Please enter email & password");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Role Based Login</h2>

        <label style={styles.label}>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Select Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
        >
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="franchise">Franchise</option>
        </select>

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  form: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    marginTop: "10px",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#667eea",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
