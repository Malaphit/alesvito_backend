const orderModel = require('../models/orderModel');

const orderController = {
  async getOrders(req, res) {
    try {
      const orders = await orderModel.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const updatedOrder = await orderModel.updateOrderStatus(orderId, status);
      if (!updatedOrder) return res.status(404).json({ message: 'Заказ не найден' });
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async createOrder(req, res) {
    try {
      const { items, deliveryAddress, bonusPointsUsed = 0 } = req.body;
      const userId = req.user.id;
      const order = await orderModel.createOrder(userId, items, deliveryAddress, bonusPointsUsed);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },
};

module.exports = orderController;