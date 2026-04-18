const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  updatePassword,
} = require('../controllers/authController');
const User = require('../models/User'); // adjust path if needed
const { sendEmail, emailTemplates } = require('../utils/sendEmail'); // adjust path if needed

// ─── OTP Store (in-memory, works fine for production at small scale) ──────────
// For high traffic, replace with Redis. Structure: { email: { hashedOtp, expiresAt } }
const otpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ─── Existing Routes ──────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.put('/update-password', protect, updatePassword);

// ─── NEW: Send OTP to email ───────────────────────────────────────────────────
// Replaces the old POST /forgot-password (which sent a reset link)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check user exists — but return same message either way (prevents email enumeration)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a code has been sent.',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing (security best practice)
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Store with expiry
    otpStore.set(email.toLowerCase().trim(), {
      hashedOtp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // Send the OTP email
    await sendEmail({
      to: email,
      subject: 'ShopMart — Your Password Reset Code',
      html: emailTemplates.otpEmail(otp),
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (err) {
    console.error('forgot-password (OTP) error:', err);
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
});

// ─── NEW: Verify OTP and reset password ──────────────────────────────────────
// Replaces the old PUT /reset-password/:token
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const key = email.toLowerCase().trim();
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No code found for this email. Please request a new one.',
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: 'Code has expired. Please request a new one.',
      });
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect code. Please try again.',
      });
    }

    // Update password
    const user = await User.findOne({ email: key });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear legacy token fields if they exist on the model
    if (user.resetPasswordToken !== undefined) user.resetPasswordToken = undefined;
    if (user.resetPasswordExpire !== undefined) user.resetPasswordExpire = undefined;

    await user.save();
    otpStore.delete(key); // clean up used OTP

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (err) {
    console.error('reset-password (OTP) error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});


// ─── NEW: Verify OTP only (no password reset) — used at step 2 ───────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }
    const key = email.toLowerCase().trim();
    const record = otpStore.get(key);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No code found. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Code has expired. Please request a new one.' });
    }
    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' });
    }
    // Code correct — keep in store, still needed for final password reset
    return res.status(200).json({ success: true, message: 'Code verified.' });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
});



// ─── Google OAuth Routes ──────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);

module.exports = router;