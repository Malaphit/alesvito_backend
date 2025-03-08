const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware(), orderController.createOrder);

module.exports = router;