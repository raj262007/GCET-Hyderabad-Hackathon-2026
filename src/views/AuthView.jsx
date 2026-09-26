import React, { useState } from 'react';
import { 
  Boxes, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function AuthView({ onLoginSuccess }) {
  const { setCurrentUser } = useInventory();

  // Mode: 'login' | 'signup' | 'forgot_email' | 'forgot_otp' | 'forgot_newpass'
  const [mode, setMode] = useState('login');

  // Form fields
  const [email, setEmail] = useState('aditi.manager@stocksense.io');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('manager');

  // OTP State
  const [resetEmail, setResetEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpSentNotification, setOtpSentNotification] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    setCurrentUser({
      name: email.includes('aditi') ? 'Aditi Sharma' : (name || 'Operations Lead'),
      email,
      role: email.includes('staff') ? 'staff' : role,
      warehouseId: 'wh-main'
    });

    onLoginSuccess();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill all mandatory fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setCurrentUser({
      name,
      email,
      role,
      warehouseId: 'wh-main'
    });

    alert('Account created successfully! Redirecting to Dashboard...');
    onLoginSuccess();
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      alert('Please enter your email.');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSentNotification(`⚡ DEMO OTP: ${otp} (Simulated SMS/Email delivery)`);
    setMode('forgot_otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp !== generatedOtp) {
      alert('Invalid OTP code. Please enter the code shown in the demo notification banner.');
      return;
    }
    setMode('forgot_newpass');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match.');
      return;
    }
    alert('Password reset successfully! You can now log in.');
    setMode('login');
    setPassword(newPassword);
    setOtpSentNotification('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #241624 0%, #090d16 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #714b67 0%, #9d688f 100%)',
            color: 'white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 8px 16px rgba(113, 75, 103, 0.3)'
          }}>
            <Boxes size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Stock<span style={{ color: 'var(--primary)' }}>Sense</span>
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Next-Gen Modular Inventory Management System
          </p>
        </div>

        {/* Demo OTP Banner if triggered */}
        {otpSentNotification && (
          <div style={{
            background: 'var(--primary-light)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            {otpSentNotification}
          </div>
        )}

        {/* MODE 1: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email Address or Username</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot_email'); setResetEmail(email); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Forgot Password?
                </button>
              </div>
              <input 
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Quick Demo Pre-fill shortcuts */}
            <div style={{ 
              background: 'var(--bg-subtle)', 
              padding: '10px 12px', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              <span style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>⚡ Demo One-Click Sign In:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ flex: 1, fontSize: '0.72rem' }}
                  onClick={() => {
                    setEmail('aditi.manager@stocksense.io');
                    setPassword('admin123');
                    setRole('manager');
                  }}
                >
                  Manager (Aditi)
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ flex: 1, fontSize: '0.72rem' }}
                  onClick={() => {
                    setEmail('raj.staff@stocksense.io');
                    setPassword('staff123');
                    setRole('staff');
                  }}
                >
                  Staff (Raj)
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '4px' }}>
              <span>Log In to Inventory Dashboard</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => setMode('signup')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: Sign Up */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text"
                className="form-input"
                placeholder="e.g. Vikram Malhotra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email *</label>
              <input 
                type="email"
                className="form-input"
                placeholder="vikram@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select System Role</label>
              <select 
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="manager">Inventory Manager</option>
                <option value="staff">Warehouse Floor Staff</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input 
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input 
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px' }}>
              <span>Create Account & Continue</span>
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button 
                type="button" 
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* MODE 3: Forgot Password - Step 1: Send OTP */}
        {mode === 'forgot_email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>OTP Password Reset</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Enter your registered email address to receive a 6-digit verification code.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email"
                className="form-input"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Send 6-Digit OTP Code
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setMode('login')}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* MODE 4: Forgot Password - Step 2: Enter OTP */}
        {mode === 'forgot_otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Enter Verification Code</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                A 6-digit OTP code was sent to <strong>{resetEmail}</strong>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">6-Digit OTP Code</label>
              <input 
                type="text"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: 800 }}
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="••••••"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Verify Code
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setMode('forgot_email')}
            >
              Resend Code
            </button>
          </form>
        )}

        {/* MODE 5: Forgot Password - Step 3: Set New Password */}
        {mode === 'forgot_newpass' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Create New Password</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Enter your new secure password below
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password"
                className="form-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Reset Password & Log In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
