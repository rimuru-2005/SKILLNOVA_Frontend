import { useState } from 'react';
import './auth.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Mock login verification logic
    if (email === 'admin@skillnova.com' && password === 'admin') {
      onLoginSuccess('admin', email);
    } else if (email === 'user@skillnova.com' && password === 'user') {
      onLoginSuccess('intern', email);
    } else {
      setError('Invalid email or password (try admin@../admin or user@../user)');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your SkillNova account to continue.</p>
        
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
          Don't have an account? <span style={{ color: "#ff6d34", cursor: "pointer", fontWeight: "600" }}>Sign up</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
