import { useState, useRef, useEffect } from 'react';
import './auth.css';
import { sendAdminOtp, verifyAdminOtp } from '../../services/apiClient';

const AdminOTP = ({ tempUser, onVerify, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    sendOtpCode();

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    clearInterval(timerRef.current);
    setResendTimer(60);

    timerRef.current = setInterval(() => {
      setResendTimer((currentTimer) => {
        if (currentTimer <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }

        return currentTimer - 1;
      });
    }, 1000);
  };

  const sendOtpCode = async () => {
    setSending(true);
    setError('');

    try {
      await sendAdminOtp(tempUser?.email);
      startResendTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (sendError) {
      setError(sendError.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if complete
    if (newOtp.every(digit => digit !== '')) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (!pasted) {
      return;
    }

    const nextOtp = [...otp];
    pasted.split('').forEach((character, index) => {
      nextOtp[index] = character;
    });
    setOtp(nextOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();

    if (pasted.length === 6) {
      verifyOTP(pasted);
    }
  };

  const verifyOTP = async (otpString) => {
    setLoading(true);
    setError('');

    try {
      const data = await verifyAdminOtp(tempUser?.email, otpString);
      onVerify(data?.token || null);
    } catch (verifyError) {
      setError(verifyError.message || 'Invalid OTP code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    verifyOTP(otpString);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Admin Verification</h2>
        <p className="auth-subtitle">
          {sending
            ? 'Sending OTP to your registered admin email...'
            : `Enter the 6-digit OTP sent to ${tempUser?.email}.`}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                disabled={loading || sending}
                required
              />
            ))}
          </div>
          {error && <div className="auth-error" style={{textAlign: 'center', marginBottom: '16px'}}>{error}</div>}
          
          <button type="submit" className="auth-button" disabled={loading || sending}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            className="auth-button auth-secondary-btn"
            onClick={sendOtpCode}
            disabled={sending || resendTimer > 0 || loading}
            style={{ marginTop: '12px' }}
          >
            {sending
              ? 'Sending...'
              : resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : 'Resend OTP'}
          </button>
          
          <button type="button" className="auth-button auth-secondary-btn" onClick={onCancel} disabled={loading}>
            Cancel Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminOTP;
