const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authMiddleware(['admin']), categoryController.createCategory);
router.put('/:id', authMiddleware(['admin']), categoryController.updateCategory);
router.delete('/:id', authMiddleware(['admin']), categoryController.deleteCategory);

module.exports = router;