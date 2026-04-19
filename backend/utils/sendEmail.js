const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER, // shopmartsupport@gmail.com
      pass: process.env.EMAIL_PASS, // App Password for that Gmail
    },
    tls: { rejectUnauthorized: false },
  });

  await transporter.verify().catch((err) => {
    console.error('❌ Email transporter verify failed:', err.message);
    throw new Error(`Email config error: ${err.message}`);
  });

  const mailOptions = {
    from: `"ShopMart" <${process.env.EMAIL_USER}>`, // shows as ShopMart
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  return info;
};

const emailTemplates = {

  // ─── Welcome email ────────────────────────────────────────────────────────
  welcomeEmail: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to ShopMart! 🛍️</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Hi ${name}!</h2>
        <p>Welcome to ShopMart — Nepal's best online shopping destination!</p>
        <p>Start exploring thousands of products across hundreds of categories.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#667eea;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px;">Start Shopping</a>
      </div>
      <div style="padding:16px;background:#eee;text-align:center;">
        <p style="margin:0;font-size:12px;color:#aaa;">© ShopMart Nepal · shopmartsupport@gmail.com</p>
      </div>
    </div>
  `,

  // ─── Order confirmation ───────────────────────────────────────────────────
  orderConfirmation: (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Confirmed! ✅</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="margin-top:0;">Hi there!</h2>
        <p>Thank you for your order! We have received it and will start processing right away.</p>

        <div style="background:white;border-radius:10px;padding:20px;margin:20px 0;border:1px solid #eee;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#888;width:140px;">Order Number</td>
              <td style="padding:8px 0;font-weight:bold;color:#111;">#${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#888;">Total Amount</td>
              <td style="padding:8px 0;font-weight:bold;color:#667eea;">NPR ${order.totalPrice}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#888;">Payment Method</td>
              <td style="padding:8px 0;text-transform:capitalize;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#888;">Est. Delivery</td>
              <td style="padding:8px 0;">3–5 business days</td>
            </tr>
          </table>
        </div>

        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#0f1b2d;font-weight:700;padding:14px 28px;text-decoration:none;border-radius:10px;margin-top:8px;">📦 Track Your Order</a>

        <p style="color:#888;font-size:13px;margin-top:24px;">
          Questions? Reply to this email or contact us at
          <a href="mailto:shopmartsupport@gmail.com" style="color:#667eea;">shopmartsupport@gmail.com</a>
        </p>
      </div>
      <div style="padding:16px;background:#eee;text-align:center;">
        <p style="margin:0;font-size:12px;color:#aaa;">© ShopMart Nepal · shopmartsupport@gmail.com</p>
      </div>
    </div>
  `,

  // ─── OTP email ────────────────────────────────────────────────────────────
  otpEmail: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset Code 🔐</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="margin-top:0;">Your Verification Code</h2>
        <p>Use the code below to reset your ShopMart password. Expires in <strong>10 minutes</strong>.</p>
        <div style="background:white;border:2px dashed #667eea;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:2px;">One-Time Code</p>
          <p style="margin:0;font-size:48px;font-weight:bold;letter-spacing:16px;color:#667eea;font-family:'Courier New',monospace;">${otp}</p>
        </div>
        <p style="color:#999;font-size:13px;">Do not share this code. If you did not request this, ignore this email.</p>
      </div>
      <div style="padding:16px;background:#eee;text-align:center;">
        <p style="margin:0;font-size:12px;color:#aaa;">© ShopMart Nepal · shopmartsupport@gmail.com</p>
      </div>
    </div>
  `,

  // ─── Legacy token-based reset (kept as fallback) ──────────────────────────
  passwordReset: (resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset 🔒</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Reset Your Password</h2>
        <p>Click the button below. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#667eea;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px;">Reset Password</a>
        <p style="color:#999;margin-top:16px;">If you did not request this, ignore this email.</p>
      </div>
      <div style="padding:16px;background:#eee;text-align:center;">
        <p style="margin:0;font-size:12px;color:#aaa;">© ShopMart Nepal · shopmartsupport@gmail.com</p>
      </div>
    </div>
  `,

  // ─── Email verification ───────────────────────────────────────────────────
  emailVerification: (verifyUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Verify Your Email 📧</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Almost there!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#667eea;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px;">Verify Email</a>
      </div>
      <div style="padding:16px;background:#eee;text-align:center;">
        <p style="margin:0;font-size:12px;color:#aaa;">© ShopMart Nepal · shopmartsupport@gmail.com</p>
      </div>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };