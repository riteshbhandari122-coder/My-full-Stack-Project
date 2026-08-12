// routes/auth.otp.routes.js
// Add these routes to your existing Express auth router.
// This handles the OTP-based forgot password flow.

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/User'); // adjust path to your User model
const { sendEmail, emailTemplates } = require('../utils/sendEmail'); // adjust path

// ─── In-memory OTP store (use Redis in production) ───────────────────────────
// Structure: { email: { hashedOtp, expiresAt } }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ─── Helper: generate 6-digit OTP ────────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-otp
// Body: { email }
// Sends a 6-digit OTP to the user's email for password reset
// ─────────────────────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success anyway to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a code has been sent.',
      });
    }

    // Generate and hash OTP
    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Store hashed OTP with expiry
    otpStore.set(email.toLowerCase(), {
      hashedOtp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // Send email
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
    console.error('send-otp error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Body: { email, otp, newPassword }
// Verifies the OTP and resets the user's password
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
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

    // Check OTP exists
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email. Please request a new code.',
      });
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: 'Code has expired. Please request a new one.',
      });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect code. Please try again.',
      });
    }

    // Update user password
    const user = await User.findOne({ email: key });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear any legacy reset tokens if your User model has them
    if ('resetPasswordToken' in user) user.resetPasswordToken = undefined;
    if ('resetPasswordExpire' in user) user.resetPasswordExpire = undefined;

    await user.save();

    // Clear OTP from store
    otpStore.delete(key);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO PLUG IN:
// In your main app.js / server.js, add:
//
//   const otpRoutes = require('./routes/auth.otp.routes');
//   app.use('/api/auth', otpRoutes);
//
// This adds:
//   POST /api/auth/send-otp
//   POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────────────────────────────