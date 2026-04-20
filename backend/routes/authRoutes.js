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

const otpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000;

// ─── Existing Routes ──────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.put('/update-password', protect, updatePassword);

// ─── Send OTP ─────────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(200).json({ success: true, message: 'If this email is registered, a code has been sent.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    otpStore.set(email.toLowerCase().trim(), { hashedOtp, expiresAt: Date.now() + OTP_EXPIRY_MS });

    await sendEmail({ to: email, subject: 'ShopMart — Your Password Reset Code', html: emailTemplates.otpEmail(otp) });

    return res.status(200).json({ success: true, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('forgot-password error:', err);
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
});

// ─── Reset Password + Auto Login ──────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const key = email.toLowerCase().trim();
    const record = otpStore.get(key);
    if (!record) return res.status(400).json({ success: false, message: 'No code found. Please request a new one.' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Code has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' });

    const user = await User.findOne({ email: key });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // ✅ FIX: Hash password manually and use findByIdAndUpdate to bypass
    // the model's pre-save hook which would double-hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: undefined,
          resetPasswordExpire: undefined,
        },
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpire: '',
        }
      },
      { new: true }
    );

    otpStore.delete(key);

    // ✅ Auto login — generate JWT token so user is logged in immediately
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
      token,           // ← frontend uses this to log in automatically
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('reset-password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// ─── Verify OTP Only ──────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and code are required' });

    const key = email.toLowerCase().trim();
    const record = otpStore.get(key);
    if (!record) return res.status(400).json({ success: false, message: 'No code found. Please request a new one.' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Code has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, record.hashedOtp);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' });

    return res.status(200).json({ success: true, message: 'Code verified.' });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// ─── Contact Form ─────────────────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Name, email and message are required' });

    const msgHtml = message.split('\n').join('<br/>');

    await sendEmail({
      to: 'shopmartsupport@gmail.com',
      subject: 'ShopMart Contact: ' + (subject || 'New message from ' + name),
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
        + '<div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center;"><h1 style="color:white;margin:0;">New Contact Message</h1></div>'
        + '<div style="padding:30px;background:#f9f9f9;">'
        + '<table style="width:100%;border-collapse:collapse;">'
        + '<tr><td style="padding:8px 0;color:#888;width:100px;">From</td><td style="padding:8px 0;font-weight:bold;color:#111;">' + name + '</td></tr>'
        + '<tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#667eea;">' + email + '</td></tr>'
        + '<tr><td style="padding:8px 0;color:#888;">Subject</td><td style="padding:8px 0;color:#111;">' + (subject || 'No subject') + '</td></tr>'
        + '</table>'
        + '<hr style="margin:20px 0;border:none;border-top:1px solid #eee;"/>'
        + '<h3 style="color:#333;margin:0 0 12px;">Message:</h3>'
        + '<div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #667eea;color:#333;line-height:1.7;">' + msgHtml + '</div>'
        + '<div style="margin-top:24px;padding:12px 16px;background:#e8f4fd;border-radius:8px;">'
        + '<p style="margin:0;font-size:13px;color:#555;">Reply to <strong>' + email + '</strong> to respond to <strong>' + name + '</strong></p>'
        + '</div></div>'
        + '<div style="padding:16px;background:#eee;text-align:center;"><p style="margin:0;font-size:12px;color:#aaa;">ShopMart Nepal Contact Form</p></div></div>',
    });

    await sendEmail({
      to: email,
      subject: 'We received your message — ShopMart Support',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
        + '<div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center;"><h1 style="color:white;margin:0;">Message Received!</h1></div>'
        + '<div style="padding:30px;background:#f9f9f9;">'
        + '<h2>Hi ' + name + '!</h2>'
        + '<p>Thank you for contacting ShopMart. We will get back to you within <strong>24 hours</strong>.</p>'
        + '<div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #667eea;color:#555;margin:20px 0;">'
        + '<strong>Your message:</strong><br/><br/>' + msgHtml + '</div>'
        + '<p style="color:#888;font-size:13px;">Urgent? Call us at <strong>+977-9800000000</strong></p>'
        + '</div>'
        + '<div style="padding:16px;background:#eee;text-align:center;"><p style="margin:0;font-size:12px;color:#aaa;">© ShopMart Nepal · shopmartsupport@gmail.com</p></div></div>',
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  async (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
      res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);

module.exports = router;