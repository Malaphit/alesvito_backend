const chatModel = require('../models/chatModel');
const axios = require('axios');

const chatController = {
  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const messages = await chatModel.getMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { adminId, message } = req.body;

      const newMessage = await chatModel.createMessage(userId, adminId, message);

      // Интеграция с AmoCRM (пока заглушка)
      // const amoResponse = await axios.post('https://yourdomain.amocrm.ru/api/v4/leads', {
      //   name: `Чат от пользователя ${userId}`,
      //   custom_fields_values: [{ field_id: YOUR_FIELD_ID, values: [{ value: message }] }],
      // }, {
      //   headers: { Authorization: `Bearer ${YOUR_AMO_TOKEN}` },
      // });

      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const updatedMessage = await chatModel.markAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },
};

module.exports = chatController;