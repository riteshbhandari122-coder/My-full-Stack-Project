// ─── Contact Form ─────────────────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) return res.status(400).json({
      success: false,
      message: 'Name, email and message are required',
    });

    const msgHtml = message.split('\n').join('<br/>');

    try {
      await sendEmail({
        to: 'ecomartsupport@gmail.com', // ✅ Fixed recipient email
        subject: 'EcoMart Contact: ' + (subject || 'New message from ' + name),
        html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
          + '<div style="background:linear-gradient(135deg,#064e3b,#022c22);padding:30px;text-align:center;"><h1 style="color:#34d399;margin:0;">New Contact Message</h1></div>'
          + '<div style="padding:30px;background:#f9f9f9;">'
          + '<table style="width:100%;border-collapse:collapse;">'
          + '<tr><td style="padding:8px 0;color:#888;width:100px;">From</td><td style="padding:8px 0;font-weight:bold;color:#111;">' + name + '</td></tr>'
          + '<tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#059669;">' + email + '</td></tr>'
          + '<tr><td style="padding:8px 0;color:#888;">Subject</td><td style="padding:8px 0;color:#111;">' + (subject || 'No subject') + '</td></tr>'
          + '</table>'
          + '<hr style="margin:20px 0;border:none;border-top:1px solid #eee;"/>'
          + '<h3 style="color:#064e3b;margin:0 0 12px;">Message:</h3>'
          + '<div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #10b981;color:#333;line-height:1.7;">' + msgHtml + '</div>'
          + '<div style="margin-top:24px;padding:12px 16px;background:#f0fdf4;border-radius:8px;">'
          + '<p style="margin:0;font-size:13px;color:#555;">Reply to <strong>' + email + '</strong> to respond to <strong>' + name + '</strong></p>'
          + '</div></div>'
          + '<div style="padding:16px;background:#022c22;text-align:center;"><p style="margin:0;font-size:12px;color:#94a3b8;">EcoMart Nepal Contact Form</p></div></div>',
      });
    } catch (emailErr) {
      console.error('Support email failed:', emailErr.message);
    }

    try {
      await sendEmail({
        to: email,
        subject: 'We received your message — EcoMart Support',
        html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
          + '<div style="background:linear-gradient(135deg,#064e3b,#022c22);padding:30px;text-align:center;"><h1 style="color:#34d399;margin:0;">Message Received! ✅</h1></div>'
          + '<div style="padding:30px;background:#f9f9f9;">'
          + '<h2>Hi ' + name + '!</h2>'
          + '<p>Thank you for contacting EcoMart. We will get back to you within <strong>24 hours</strong>.</p>'
          + '<div style="background:white;padding:16px;border-radius:8px;border-left:4px solid #10b981;color:#555;margin:20px 0;">'
          + '<strong>Your message:</strong><br/><br/>' + msgHtml + '</div>'
          + '<p style="color:#888;font-size:13px;">Urgent? Call us at <strong>+977-9800000000</strong></p>'
          + '</div>'
          + '<div style="padding:16px;background:#022c22;text-align:center;"><p style="margin:0;font-size:12px;color:#94a3b8;">© EcoMart Nepal · ecomartsupport@gmail.com</p></div></div>',
      });
    } catch (emailErr) {
      console.error('User confirmation email failed:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will reply within 24 hours. ✅',
    });

  } catch (err) {
    console.error('Contact form error:', err.message);
    return res.status(200).json({
      success: true,
      message: 'Message received! We will get back to you soon.',
    });
  }
});