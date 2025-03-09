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

const notificationModel = {
  async sendResetPasswordEmail(email, token) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Сброс пароля',
      text: `Для сброса пароля перейдите по ссылке: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
  },

  async sendOrderConfirmation(email, orderId) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Подтверждение заказа',
      text: `Ваш заказ #${orderId} успешно создан!`,
    };

    await transporter.sendMail(mailOptions);
  },

  async sendRegistrationConfirmation(email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Добро пожаловать!',
      text: 'Спасибо за регистрацию в нашем магазине!',
    };

    await transporter.sendMail(mailOptions);
  },
};

module.exports = notificationModel;