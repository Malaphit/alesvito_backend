const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userController = {
  async register(req, res) {
    try {
      const { email, password, referralCode } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email и пароль обязательны' });
      }

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь уже существует' });
      }

      const user = await userModel.createUser(email, password, referralCode);
      res.status(201).json({ message: 'Пользователь зарегистрирован', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await userModel.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await userModel.updateResetToken(user.id, token);
      await notificationModel.sendResetPasswordEmail(email, token);

      res.json({ message: 'Письмо для сброса пароля отправлено' });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token } = req.query;
      const { newPassword } = req.body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await userModel.updatePassword(decoded.id, newPassword);
      res.json({ message: 'Пароль успешно сброшен' });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Неверный email или пароль' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      res.json({ message: 'Успешный вход', token, role: user.role });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async getProfile(req, res) {
    try {
      const userId = req.user.id; // Из middleware
      const user = await userModel.getUserProfile(userId);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
};

module.exports = userController;