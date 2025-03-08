const productModel = require('../models/productModel');

const productController = {
  async getProducts(req, res) {
    try {
      const products = await productModel.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
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
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.deleteProduct(id);
      if (!product) return res.status(404).json({ message: 'Товар не найден' });
      res.json({ message: 'Товар удален' });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async incrementViews(req, res) {
    try {
      const { productId } = req.params;
      const views = await productModel.incrementViews(productId);
      res.json({ views_count: views });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async exportProductViews(req, res) {
    try {
      const products = await productModel.getAllProducts();
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Product Views');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Views', key: 'views_count', width: 15 },
      ];

      products.forEach(product => {
        worksheet.addRow({
          id: product.id,
          name: product.name,
          price: product.price,
          views_count: product.views_count,
        });
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename=product_views.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },
};

module.exports = productController;