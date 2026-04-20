import { useEffect, useState } from 'react';
import './auth.css';
import { findAuthUser } from '../utils/mockAuth';

const Login = ({ onLoginSuccess, onShowSignup, initialEmail = '', notice = '' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const user = findAuthUser(email, password);

    if (user) {
      onLoginSuccess(user.role, user.email);
      return;
    }

    setError('Invalid email or password (try admin@../admin or user@../user)');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your SkillNova account to continue.</p>

        {notice && <div className="auth-success">{notice}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <span className="auth-error">{error}</span>}
          </div>
          
          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>
        
        <div className="auth-divider">
          <span>Demo Credentials</span>
        </div>
        
        <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', lineHeight: '1.6', marginBottom: '16px' }}>
          <strong>Admin:</strong> admin@skillnova.com / admin<br />
          <strong>User:</strong> user@skillnova.com / user
        </div>

        <div style={{ textAlign: "center", fontSize: "14px", color: "#9ca3af" }}>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onShowSignup}
            style={{ color: "#ff6d34", cursor: "pointer", fontWeight: "600", background: "transparent", border: "none", padding: 0 }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
