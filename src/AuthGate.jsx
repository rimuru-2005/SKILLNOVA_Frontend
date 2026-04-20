// src/AuthGate.jsx
import { useState } from 'react';
import UserApp  from "./user/App";
import AdminApp from "./admin/App";
import Login from "./auth/pages/Login";
import Signup from "./auth/pages/Signup";
import AdminOTP from "./auth/pages/AdminOTP";
import User2FA from "./auth/pages/User2FA";

const AuthGate = () => {
  // role: null | 'admin' | 'intern'
  const [role, setRole] = useState(null); 
  
  // auth step: 'LOGIN' | 'SIGNUP' | 'OTP' | '2FA' | 'AUTHENTICATED'
  const [authStep, setAuthStep] = useState('LOGIN');
  
  // temporary user details
  const [tempUser, setTempUser] = useState(null);
  const [loginNotice, setLoginNotice] = useState('');
  const [prefilledEmail, setPrefilledEmail] = useState('');

  const handleLoginSuccess = (userRole, email) => {
    setLoginNotice('');
    setTempUser({ role: userRole, email });
    if (userRole === "admin") {
      setAuthStep("OTP");
    } else {
      setAuthStep("2FA");
    }
  };

  const handleVerificationSuccess = () => {
    setRole(tempUser.role);
    setAuthStep("AUTHENTICATED");
  };

  const handleLogout = () => {
    setRole(null);
    setAuthStep("LOGIN");
    setTempUser(null);
  };

  const handleShowSignup = () => {
    setAuthStep("SIGNUP");
    setLoginNotice('');
  };

  const handleSignupSuccess = (email) => {
    setPrefilledEmail(email);
    setLoginNotice("Account created successfully. Sign in to continue.");
    setAuthStep("LOGIN");
  };

  if (authStep === 'LOGIN') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onShowSignup={handleShowSignup}
        initialEmail={prefilledEmail}
        notice={loginNotice}
      />
    );
  }

  if (authStep === 'SIGNUP') {
    return (
      <Signup
        onSignupSuccess={handleSignupSuccess}
        onBackToLogin={() => setAuthStep("LOGIN")}
      />
    );
  }
  
  if (authStep === 'OTP') {
    return (
      <AdminOTP 
        tempUser={tempUser} 
        onVerify={handleVerificationSuccess} 
        onCancel={handleLogout} 
      />
    );
  }
  
  if (authStep === '2FA') {
    return (
      <User2FA 
        tempUser={tempUser} 
        onVerify={handleVerificationSuccess} 
        onCancel={handleLogout} 
      />
    );
  }

  if (authStep === 'AUTHENTICATED') {
    // In a real app we'd pass `handleLogout` to these apps, but they may handle their own top-bar logout.
    if (role === "admin")  return <AdminApp onLogout={handleLogout} />;
    if (role === "intern") return <UserApp onLogout={handleLogout} />;
  }

  return null;
};

export default AuthGate;
