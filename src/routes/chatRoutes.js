const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware(), chatController.getMessages);
router.post('/', authMiddleware(), chatController.sendMessage);
router.put('/:messageId/read', authMiddleware(), chatController.markAsRead);

module.exports = router;