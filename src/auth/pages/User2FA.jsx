import { useState, useRef, useEffect } from 'react';
import './auth.css';
import { verifyUserTwoFactor } from '../../services/apiClient';

const User2FA = ({ tempUser, onVerify, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if complete
    if (newCode.every(digit => digit !== '')) {
      verify2FA(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (!pasted) {
      return;
    }

    const nextCode = [...code];
    pasted.split('').forEach((character, index) => {
      nextCode[index] = character;
    });
    setCode(nextCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();

    if (pasted.length === 6) {
      verify2FA(pasted);
    }
  };

  const verify2FA = async (codeString) => {
    setLoading(true);
    setError('');

    try {
      const data = await verifyUserTwoFactor(tempUser?.email, codeString);
      onVerify(data?.token || null);
    } catch (verifyError) {
      setError(
        verifyError.message ||
          'Invalid code. Please check your authenticator app and try again.',
      );
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const codeString = code.join('');

    if (codeString.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    verify2FA(codeString);
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
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                style={{ borderRadius: '8px' }}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                disabled={loading}
                required
              />
            ))}
          </div>
          {error && <div className="auth-error" style={{textAlign: 'center', marginBottom: '16px'}}>{error}</div>}
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          
          <button type="button" className="auth-button auth-secondary-btn" onClick={onCancel} disabled={loading}>
            Back to Login
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280', marginTop: '20px' }}>
          Open your authenticator app and enter the current 6-digit code for SkillNova.
        </p>
      </div>
    </div>
  );
};

export default User2FA;
