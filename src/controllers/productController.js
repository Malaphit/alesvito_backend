const productModel = require('../models/productModel');

const productController = {
  async getProducts(req, res) {
    try {
      const products = await productModel.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async createProduct(req, res) {
    try {
      const { categoryId, name, description, price, imageUrls, sizeIds } = req.body;
      if (!imageUrls || !Array.isArray(imageUrls)) {
        return res.status(400).json({ message: 'imageUrls должен быть массивом' });
      }
      const product = await productModel.createProduct(
        categoryId,
        name,
        description,
        price,
        imageUrls,
        sizeIds
      );
      res.status(201).json(product);
    } catch (error) {
      console.error('Ошибка в контроллере:', error);
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { categoryId, name, description, price, imageUrls, sizeIds } = req.body;
      const product = await productModel.updateProduct(
        id,
        categoryId,
        name,
        description,
        price,
        imageUrls,
        sizeIds
      );
      if (!product) return res.status(404).json({ message: 'Товар не найден' });
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.deleteProduct(id);
      if (!product) return res.status(404).json({ message: 'Товар не найден' });
      res.json({ message: 'Товар удален' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
};

module.exports = productController;