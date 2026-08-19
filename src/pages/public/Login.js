// src/pages/public/Login.js - Upgraded for MongoDB REST API + Demo Quick-fills
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { useFranchiseAuth } from "../../utils/FranchiseAuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { login: userLogin } = useAuth();
  const { login: franchiseLogin } = useFranchiseAuth();
  const navigate = useNavigate();

  const handleQuickFill = (fillRole) => {
    setRole(fillRole);
    if (fillRole === 'admin') {
      setEmail('admin@itpl.com');
      setPassword('admin123');
    } else if (fillRole === 'franchise') {
      setEmail('franchise@itpl.com');
      setPassword('franchise123');
    } else if (fillRole === 'student') {
      setEmail('student@itpl.com');
      setPassword('student123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      let result;
      if (role === 'franchise') {
        result = await franchiseLogin(email, password);
      } else {
        result = await userLogin(email, password, role);
      }

      if (result && result.success) {
        if (role === "admin" || role === "superadmin") {
          navigate("/admin/dashboard");
        } else if (role === "student") {
          navigate("/student/dashboard");
        } else if (role === "franchise") {
          navigate("/franchise/dashboard");
        }
      } else {
        setErrorMessage(result?.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>SaaS Portal</div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your MS-CIT Education Portal Account</p>
        </div>

        {/* Quick Fill Demo Helper */}
        <div style={styles.demoSection}>
          <span style={styles.demoLabel}>Demo Quick Login:</span>
          <div style={styles.demoButtons}>
            <button
              type="button"
              style={{ ...styles.demoBtn, ...(role === 'admin' ? styles.demoBtnActive : {}) }}
              onClick={() => handleQuickFill('admin')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              style={{ ...styles.demoBtn, ...(role === 'franchise' ? styles.demoBtnActive : {}) }}
              onClick={() => handleQuickFill('franchise')}
            >
              🏢 Franchise
            </button>
            <button
              type="button"
              style={{ ...styles.demoBtn, ...(role === 'student' ? styles.demoBtnActive : {}) }}
              onClick={() => handleQuickFill('student')}
            >
              🎓 Student
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={styles.errorAlert}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="student">Student Portal</option>
              <option value="franchise">Franchise Center Portal</option>
              <option value="admin">Super Admin Portal</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email / Username / Roll Number</label>
            <input
              type="text"
              placeholder="e.g. admin@itpl.com or MSCIT-2026-0001"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Want to start an MS-CIT Training Center?{" "}
            <Link to="/affiliation" style={styles.link}>
              Apply for Affiliation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  header: {
    textAlign: "center",
    marginBottom: "24px"
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "rgba(102, 126, 234, 0.12)",
    color: "#667eea",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "8px"
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 6px 0"
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0
  },
  demoSection: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "20px"
  },
  demoLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "8px"
  },
  demoButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "6px"
  },
  demoBtn: {
    padding: "6px 8px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  demoBtnActive: {
    background: "#667eea",
    borderColor: "#667eea",
    color: "#ffffff"
  },
  errorAlert: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "16px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155"
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s"
  },
  select: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
    cursor: "pointer"
  },
  button: {
    marginTop: "8px",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
    transition: "transform 0.2s, box-shadow 0.2s"
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "16px"
  },
  footerText: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0
  },
  link: {
    color: "#667eea",
    fontWeight: "600",
    textDecoration: "none"
  }
};
