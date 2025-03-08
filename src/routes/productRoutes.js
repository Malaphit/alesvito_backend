const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


router.get('/', productController.getProducts);

router.post('/', authMiddleware(['admin']), productController.createProduct);
router.put('/:id', authMiddleware(['admin']), productController.updateProduct);
router.delete('/:id', authMiddleware(['admin']), productController.deleteProduct);
router.put('/views/:productId', productController.incrementViews);

module.exports = router;