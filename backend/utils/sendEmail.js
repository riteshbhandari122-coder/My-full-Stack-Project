const { BrevoClient } = require('@getbrevo/brevo');

const sendEmail = async ({ to, subject, html }) => {
  const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });

  try {
    const data = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: { name: 'EcoMart', email: 'ecomartsupport@gmail.com' },
      to: [{ email: to }],
    });
    console.log(`✅ Email sent to ${to}`);
    return data;
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    throw err;
  }
};

const emailTemplates = {

  welcomeEmail: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #34d399; margin: 0; font-size: 28px;">🌱 EcoMart</h1>
        <p style="color: white; margin: 8px 0 0;">Your Sustainable Lifestyle Marketplace</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #064e3b;">Welcome, ${name}! 🎉</h2>
        <p style="color: #555;">Welcome to EcoMart — your destination for sustainable and eco-friendly shopping!</p>
        <p style="color: #555;">Start exploring products that care for our planet.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;font-weight:700;padding:14px 28px;text-decoration:none;border-radius:10px;">
            🌱 Start Shopping
          </a>
        </div>
      </div>
      <div style="padding:16px;background:#022c22;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© EcoMart Nepal · ecomartsupport@gmail.com</p>
      </div>
    </div>
  `,

  orderConfirmation: (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #34d399; margin: 0;">Order Confirmed! ✅</h1>
        <p style="color: white; margin: 8px 0 0;">Thank you for shopping sustainably with EcoMart</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="margin-top:0; color: #064e3b;">Hi there!</h2>
        <p style="color: #555;">Thank you for your order! We have received it and will start processing right away.</p>
        
        <div style="background:white;border-radius:10px;padding:20px;margin:20px 0;border:1px solid #eee;">
          <p style="margin:0 0 12px;font-weight:bold;color:#064e3b;font-size:15px;">
            ${order.items[0]?.name || 'Order'}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
            <span style="font-weight:normal;color:#888;font-size:13px;"> · #${order.orderNumber}</span>
          </p>
          
          <table style="width:100%;border-collapse:collapse;">
            ${order.items.map(item => `
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding:10px 0; width: 50px;">
                  <img src="${item.image}" alt="${item.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;" />
                </td>
                <td style="padding:10px 0; color:#333; font-size: 14px;">
                  <strong>${item.name}</strong><br/>
                  <span style="color:#888; font-size: 12px;">Qty: ${item.quantity} ${item.color ? `| Color: ${item.color}` : ''}</span>
                </td>
                <td style="padding:10px 0; text-align:right; color:#064e3b; font-weight:bold; font-size: 14px;">
                  NPR ${item.price * item.quantity}
                </td>
              </tr>
            `).join('')}
          </table>
          
          <table style="width:100%;border-collapse:collapse;margin-top:15px;border-top:2px solid #eee;padding-top:10px;">
            <tr>
              <td style="padding:8px 0;color:#888;">Total Amount</td>
              <td style="padding:8px 0;text-align:right;font-weight:bold;color:#059669;font-size:16px;">NPR ${order.totalPrice}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#888;">Payment Method</td>
              <td style="padding:8px 0;text-align:right;text-transform:capitalize;color:#555;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#888;">Est. Delivery</td>
              <td style="padding:8px 0;text-align:right;color:#555;">3–5 business days</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;">
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;font-weight:700;padding:14px 28px;text-decoration:none;border-radius:10px;">
            📦 Track Your Order
          </a>
        </div>
        <p style="color:#888;font-size:13px;margin-top:24px;text-align:center;">
          Questions? Contact us at
          <a href="mailto:ecomartsupport@gmail.com" style="color:#059669;">ecomartsupport@gmail.com</a>
        </p>
      </div>
      <div style="padding:16px;background:#022c22;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© EcoMart Nepal · ecomartsupport@gmail.com</p>
      </div>
    </div>
  `,

  otpEmail: (otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #34d399; margin: 0;">Password Reset 🔐</h1>
        <p style="color: white; margin: 8px 0 0;">EcoMart Security Code</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="margin-top:0; color: #064e3b;">Your Verification Code</h2>
        <p style="color: #555;">Use the code below to reset your EcoMart password. This code expires in <strong>10 minutes</strong>.</p>
        <div style="background:white;border:2px dashed #10b981;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:2px;">One-Time Code</p>
          <p style="margin:0;font-size:48px;font-weight:bold;letter-spacing:16px;color:#059669;font-family:'Courier New',monospace;">${otp}</p>
        </div>
        <div style="background:#fef3c7;border-radius:8px;padding:12px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#92400e;">⚠️ Do not share this code with anyone. EcoMart will never ask for this code.</p>
        </div>
      </div>
      <div style="padding:16px;background:#022c22;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© EcoMart Nepal · ecomartsupport@gmail.com</p>
      </div>
    </div>
  `,

  passwordReset: (resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #34d399; margin: 0;">Password Reset 🔒</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #064e3b;">Reset Your Password</h2>
        <p style="color: #555;">Click the button below to reset your password. This link expires in 15 minutes.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;font-weight:700;padding:14px 28px;text-decoration:none;border-radius:10px;">
            🔒 Reset Password
          </a>
        </div>
        <p style="color:#999;font-size:13px;text-align:center;">If you did not request this, please ignore this email.</p>
      </div>
      <div style="padding:16px;background:#022c22;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© EcoMart Nepal · ecomartsupport@gmail.com</p>
      </div>
    </div>
  `,

  emailVerification: (verifyUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); padding: 30px; text-align: center;">
        <h1 style="color: #34d399; margin: 0;">Verify Your Email 📧</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #064e3b;">Almost there!</h2>
        <p style="color: #555;">Please verify your email address to complete your EcoMart registration.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;font-weight:700;padding:14px 28px;text-decoration:none;border-radius:10px;">
            ✅ Verify Email
          </a>
        </div>
        <p style="color:#999;font-size:13px;text-align:center;">If you did not create an account, please ignore this email.</p>
      </div>
      <div style="padding:16px;background:#022c22;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© EcoMart Nepal · ecomartsupport@gmail.com</p>
      </div>
    </div>
  `,
};

module.exports = { sendEmail, emailTemplates };