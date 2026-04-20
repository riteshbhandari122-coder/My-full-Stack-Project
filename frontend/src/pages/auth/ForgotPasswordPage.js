import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiLock } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const RESEND_SECONDS = 60;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, verifyOtpAndReset } = useAuthStore();

  const [step, setStep] = useState(1); // 1=email, 2=OTP, 3=new password, 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (step === 2) startCountdown();
    return () => clearInterval(timerRef.current);
  }, [step]);

  const startCountdown = () => {
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendOtp(email);
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  // Step 2: Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await sendOtp(email);
      toast.success('New code sent!');
      startCountdown();
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    }
    setLoading(false);
  };

  // OTP input handlers
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const updated = [...otp];
    pasted.split('').forEach((char, i) => { updated[i] = char; });
    setOtp(updated);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // Step 2: Verify OTP — calls backend to confirm code is correct BEFORE step 3
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ email, otp: code }); // ✅ backend check here
      toast.success('Code verified!');
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Incorrect code. Please try again.');
      setOtp(['', '', '', '', '', '']); // clear boxes
      otpRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  // Step 3: Reset password — auto login after success
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpAndReset({ email, otp: otp.join(''), newPassword: password });
      toast.success('Password reset successfully! Logging you in...');
      // Auto login if backend returns token
      if (data.token) {
        const { loginWithToken } = useAuthStore.getState();
        await loginWithToken(data.token);
        navigate('/');
      } else {
        setStep(4);
      }
    } catch (err) {
      toast.error(err.message || 'Reset failed. Please try again.');
      setStep(2);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shopmart-blue to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
              <FiArrowLeft size={16} /> Back to Login
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
              <p className="text-gray-500 mt-1">Enter your email to receive a verification code</p>
            </div>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Verification Code'}
              </button>
            </form>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
              <FiArrowLeft size={16} /> Back
            </button>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📧</div>
              <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
              <p className="text-gray-500 mt-1 text-sm">
                We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-12 h-14 text-center text-xl font-bold text-black bg-white border-2 border-gray-400 rounded-xl focus:border-shopmart-blue focus:outline-none transition-colors" style={{backgroundColor: "#ffffff", color: "#000000"}}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={loading} className="text-shopmart-blue font-medium hover:underline">
                    Resend code
                  </button>
                ) : (
                  <>Resend code in <span className="font-medium text-gray-700">{countdown}s</span></>
                )}
              </p>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify Code'}
              </button>
            </form>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
              <FiArrowLeft size={16} /> Back
            </button>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
              <p className="text-gray-500 mt-1">Choose a strong password for your account</p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {[['New Password', password, setPassword], ['Confirm Password', confirmPassword, setConfirmPassword]].map(([label, val, setter]) => (
                <div key={label}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      className="input-field pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-gray-500 mb-6">Your password has been updated. You can now log in.</p>
            <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;