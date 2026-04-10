const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ShopMart" <${process.env.EMAIL_USER || 'noreply@shopmart.com'}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
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
        <p>Start exploring thousands of products across hundreds of categories.</p>
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
        <p>Thank you for your order! We'll start processing it right away.</p>
        <p><strong>Total: NPR ${order.totalPrice}</strong></p>
        <p>Estimated delivery: 3-5 business days</p>
        <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Track Order</a>
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
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <p>This link expires in 15 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Reset Password</a>
        <p style="color: #999; margin-top: 16px;">If you didn't request this, please ignore this email.</p>
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
