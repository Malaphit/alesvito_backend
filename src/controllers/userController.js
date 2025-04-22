const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const notificationModel = require('../models/notificationModel');

const userController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userModel.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  
      if (!password || !user.password_hash) {
        return res.status(400).json({ message: 'Email или пароль не указаны' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password_hash); 
      if (!isMatch) return res.status(401).json({ message: 'Неверный пароль' });
  
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, role: user.role });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async register(req, res) {
    try {
      const { email, password, referralCode } = req.body;
      const user = await userModel.createUser(email, password, referralCode);
      res.status(201).json({ message: 'Регистрация успешна', user });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userModel.getUserById(userId);
      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone } = req.body;

      const updatedUser = await userModel.updateUser(userId, {
        firstName,
        lastName,
        phone,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Ошибка в updateProfile:', error);
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

  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id; 
      const user = await userModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      res.json({
        id: user.id,
        email: user.email,
        role: user.role || 'user', 
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },
  
};

module.exports = userController;