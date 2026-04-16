import { useState, useRef, useEffect } from 'react';
import './auth.css';

const User2FA = ({ tempUser, onVerify, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto verify if complete
    if (newCode.every(digit => digit !== '')) {
      verify2FA(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verify2FA = (codeString) => {
    // Mock 2FA verification - 654321 will succeed
    if (codeString === '654321') {
      onVerify();
    } else {
      setError('Invalid Authenticator Code. Use 654321 for demo.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify2FA(code.join(''));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Two-Factor Authentication</h2>
        <p className="auth-subtitle">
          Enter the 6-digit code from your Authenticator app for {tempUser?.email}.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="otp-input-group">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="otp-input"
                style={{ borderRadius: '8px' }}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                required
              />
            ))}
          </div>
          {error && <div className="auth-error" style={{textAlign: 'center', marginBottom: '16px'}}>{error}</div>}
          
          <button type="submit" className="auth-button">
            Verify Code
          </button>
          
          <button type="button" className="auth-button auth-secondary-btn" onClick={onCancel}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default User2FA;
