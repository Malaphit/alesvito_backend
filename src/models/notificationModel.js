const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready');
  }
});

const notificationModel = {
  async sendResetPasswordEmail(email, token) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Сброс пароля',
      text: `Для сброса пароля перейдите по ссылке: ${resetLink}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to:', email);
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  },
};

module.exports = notificationModel;