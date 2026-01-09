import { useState } from "react";
import { signupUser, loginUser } from "../services/api";
import "./AuthModal.css";

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      if (mode === "signup") {
        await signupUser({ email, password });
        setMode("login");
        setError("Signup successful. Please login.");
      } else {
        const res = await loginUser({ email, password });

        // ✅ SESSION STORE (required for planner)
        localStorage.setItem("userEmail", res.email);

        // ✅ THIS IS THE MISSING LINK
        onSuccess();   // 👉 Landing.jsx navigates to /planner
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed");
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <button className="auth-close" onClick={onClose}>×</button>

        <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-btn" onClick={handleSubmit}>
          {mode === "login" ? "Login" : "Signup"}
        </button>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              New here?{" "}
              <span onClick={() => setMode("signup")}>Create account</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setMode("login")}>Login</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
