const orderModel = require('../models/orderModel');

const orderController = {
  async createOrder(req, res) {
    try {
      const { items, deliveryAddress, bonusPointsUsed = 0 } = req.body;
      const userId = req.user.id;
      const order = await orderModel.createOrder(userId, items, deliveryAddress, bonusPointsUsed);
      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },
};

module.exports = orderController;