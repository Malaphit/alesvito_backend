const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const notificationModel = require('../models/notificationModel');

const orderController = {
  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      let orders;

      if (isAdmin) {
        orders = await orderModel.getAllOrders();
      } else {
        orders = await orderModel.getOrdersByUser(userId);
      }

      res.json(orders);
    } catch (error) {
      console.error('Ошибка в getOrders:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async createOrder(req, res) {
    try {
      const { items, address, bonusPointsUsed = 0 } = req.body;
      const userId = req.user.id;

      // Создаём или обновляем адрес
      const newAddress = await addressModel.createAddress(userId, address);
      const addressId = newAddress.id;

      const order = await orderModel.createOrder(userId, items, addressId, bonusPointsUsed);
      const user = await userModel.getUserById(userId);
      await notificationModel.sendOrderConfirmation(user.email, order.id);
      res.status(201).json(order);
    } catch (error) {
      console.error('Ошибка в createOrder:', error);
      res.status(500).json({ message: error.message || 'Ошибка сервера' });
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
      console.error('Ошибка в updateOrderStatus:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
};

module.exports = orderController;