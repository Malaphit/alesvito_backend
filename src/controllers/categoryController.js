const categoryModel = require('../models/categoryModel');

const categoryController = {
  async getCategories(req, res) {
    try {
      const categories = await categoryModel.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryModel.getCategoryById(id);
      if (!category) return res.status(404).json({ message: 'Категория не найдена' });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async createCategory(req, res) {
    try {
      const { name, description, weight } = req.body;
      const category = await categoryModel.createCategory(name, description, weight);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, weight } = req.body;
      const category = await categoryModel.updateCategory(id, name, description, weight);
      if (!category) return res.status(404).json({ message: 'Категория не найдена' });
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryModel.deleteCategory(id);
      if (!category) return res.status(404).json({ message: 'Категория не найдена' });
      res.json({ message: 'Категория удалена' });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
};

module.exports = categoryController;