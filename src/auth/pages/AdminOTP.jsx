import { useState, useRef, useEffect } from 'react';
import './auth.css';

const AdminOTP = ({ tempUser, onVerify, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto verify if complete
    if (newOtp.every(digit => digit !== '')) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOTP = (otpString) => {
    // Mock OTP verification - 123456 will succeed
    if (otpString === '123456') {
      onVerify();
    } else {
      setError('Invalid OTP code. Use 123456 for demo.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyOTP(otp.join(''));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Admin Verification</h2>
        <p className="auth-subtitle">
          Enter the 6-digit OTP sent to your registered admin email ({tempUser?.email}).
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="otp-input"
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
            Verify OTP
          </button>
          
          <button type="button" className="auth-button auth-secondary-btn" onClick={onCancel}>
            Cancel Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminOTP;
