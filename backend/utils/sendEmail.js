const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.verify().catch((err) => {
    console.error('❌ Email transporter verify failed:', err.message);
    throw new Error(
      `Email configuration error: ${err.message}. ` +
      `Make sure EMAIL_USER and EMAIL_PASS are set correctly. ` +
      `For Gmail, use an App Password from https://myaccount.google.com/apppasswords`
    );
  });

  const mailOptions = {
    from: `"ShopMart" <${process.env.EMAIL_USER || 'noreply@shopmart.com'}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  return info;
};

const emailTemplates = {
  welcomeEmail: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to ShopMart! 🛍️</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Hi ${name}!</h2>
        <p>Welcome to ShopMart - your one-stop online shopping destination!</p>
        <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Start Shopping</a>
      </div>
    </div>
  `,

  orderConfirmation: (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Confirmed! ✅</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Order #${order.orderNumber}</h2>
        <p>Thank you for your order!</p>
        <p><strong>Total: NPR ${order.totalPrice}</strong></p>
        <p>Estimated delivery: 3-5 business days</p>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Track Order</a>
      </div>
    </div>
  `,

  otpEmail: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset Code 🔐</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="margin-top: 0;">Your Verification Code</h2>
        <p>Use the code below to reset your ShopMart password. Expires in <strong>10 minutes</strong>.</p>
        <div style="background: white; border: 2px dashed #667eea; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 2px;">One-Time Code</p>
          <p style="margin: 0; font-size: 48px; font-weight: bold; letter-spacing: 16px; color: #667eea; font-family: 'Courier New', monospace;">${otp}</p>
        </div>
        <p style="color: #999; font-size: 13px;">Do not share this code. If you didn't request this, ignore this email.</p>
      </div>
      <div style="padding: 16px 30px; background: #eee; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #aaa;">© ShopMart Nepal</p>
      </div>
    </div>
  `,

  passwordReset: (resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset 🔒</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Reset Your Password</h2>
        <p>Click the button below. This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Reset Password</a>
        <p style="color: #999; margin-top: 16px;">If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `,

  emailVerification: (verifyUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Verify Your Email 📧</h1>
      </div>
      <div style="padding: 30px;">
        <h2>Almost there!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Verify Email</a>
      </div>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };