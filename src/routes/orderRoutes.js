const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware(['admin']), orderController.getOrders);
router.post('/', authMiddleware(), orderController.createOrder);
router.put('/:orderId/status', authMiddleware(['admin']), orderController.updateOrderStatus);

module.exports = router;