import { useState } from "react";
import "./auth.css";
import { createAuthUser } from "../utils/mockAuth";

const Signup = ({ onSignupSuccess, onBackToLogin }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    try {
      const user = createAuthUser({
        name,
        email,
        password: form.password,
      });

      onSignupSuccess(user.email);
    } catch (signupError) {
      setError(signupError.message || "Failed to create account.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join SkillNova and set up your account to get started.</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="auth-input"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              className="auth-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="auth-input"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {error && <span className="auth-error">{error}</span>}
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>
        </form>

        <button type="button" className="auth-button auth-secondary-btn" onClick={onBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
