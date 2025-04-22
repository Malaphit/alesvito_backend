const chatModel = require('../models/chatModel');
const axios = require('axios');

const chatController = {
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      const { userId: targetUserId } = req.query;

      let messages;
      if (isAdmin && targetUserId) {
        messages = await chatModel.getMessagesByUser(userId, targetUserId);
      } else {
        messages = await chatModel.getMessages(userId, isAdmin);
      }

      res.json(messages);
    } catch (error) {
      console.error('Ошибка в getMessages:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async getUsersWithMessages(req, res) {
    try {
      const isAdmin = req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json({ message: 'Доступ запрещён' });
      }
      const users = await chatModel.getUsersWithMessages();
      res.json(users);
    } catch (error) {
      console.error('Ошибка в getUsersWithMessages:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      const { message, targetUserId } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Сообщение не может быть пустым' });
      }

      if (isAdmin && !targetUserId) {
        return res.status(400).json({ message: 'Не указан ID пользователя' });
      }

      const newMessage = await chatModel.createMessage(userId, message, isAdmin, targetUserId);

      // Заглушка для AmoCRM
      // await axios.post('https://yourdomain.amocrm.ru/api/v4/leads', {
      //   name: `Чат от пользователя ${userId}`,
      //   custom_fields_values: [
      //     { field_id: YOUR_FIELD_ID, values: [{ value: message }] },
      //   ],
      // }, {
      //   headers: { Authorization: `Bearer ${YOUR_AMO_TOKEN}` },
      // });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Ошибка в sendMessage:', error);
      res.status(500).json({ message: error.message || 'Ошибка сервера' });
    }
  },

  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const updatedMessage = await chatModel.markAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      console.error('Ошибка в markAsRead:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
};

module.exports = chatController;