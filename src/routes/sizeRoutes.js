const express = require('express');
const sizeController = require('../controllers/sizeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', sizeController.getSizes);
router.post('/', authMiddleware(['admin']), sizeController.createSize);
router.put('/:id', authMiddleware(['admin']), sizeController.updateSize);
router.delete('/:id', authMiddleware(['admin']), sizeController.deleteSize);

module.exports = router;