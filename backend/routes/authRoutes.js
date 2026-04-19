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
const User = require('../models/User'); 
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// ─── OTP Store ──────────────────────────────────────────────────────────────
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
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, a code has been sent.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    otpStore.set(cleanEmail, {
      hashedOtp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    await sendEmail({
      to: cleanEmail,
      subject: 'ShopMart — Your Password Reset Code',
      html: emailTemplates.otpEmail(otp),
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (err) {
    console.error('forgot-password error:', err);
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
});

// ─── NEW: Verify OTP and reset password ──────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const key = email.toLowerCase().trim();
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No code found. Request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Code has expired.' });
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect code.' });
    }

    const user = await User.findOne({ email: key });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Assigning raw password - assuming your User model has a pre-save hook for hashing!
    user.password = newPassword; 
    
    // Clear legacy fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    otpStore.delete(key);

    return res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('reset-password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// ─── NEW: Verify OTP only ────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const key = email?.toLowerCase().trim();
    const record = otpStore.get(key);

    if (!record || Date.now() > record.expiresAt) {
      if (record) otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Code invalid or expired.' });
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect code.' });
    }

    return res.status(200).json({ success: true, message: 'Code verified.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// ─── Contact Form ───────────────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const messageHtml = message.replace(/\n/g, '<br/>'); // Fixed regex

    // Admin Notification
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `📬 ShopMart Contact: ${subject || 'New Message'}`,
      html: `<h3>New Message from ${name} (${email})</h3><p>${messageHtml}</p>`
      // Use your existing styled HTML here
    });

    // User Confirmation
    await sendEmail({
      to: email,
      subject: 'Message Received — ShopMart',
      html: `<p>Hi ${name}, we received your message and will reply soon!</p>`
    });

    return res.status(200).json({ success: true, message: 'Message sent!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// ─── Google OAuth ────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
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