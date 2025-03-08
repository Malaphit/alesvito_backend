const sizeModel = require('../models/sizeModel');

const sizeController = {
  async getSizes(req, res) {
    try {
      const sizes = await sizeModel.getAllSizes();
      res.json(sizes);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async createSize(req, res) {
    try {
      const { size } = req.body;
      const newSize = await sizeModel.createSize(size);
      res.status(201).json(newSize);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async updateSize(req, res) {
    try {
      const { id } = req.params;
      const { size } = req.body;
      const updatedSize = await sizeModel.updateSize(id, size);
      if (!updatedSize) return res.status(404).json({ message: 'Размер не найден' });
      res.json(updatedSize);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },

  async deleteSize(req, res) {
    try {
      const { id } = req.params;
      const deletedSize = await sizeModel.deleteSize(id);
      if (!deletedSize) return res.status(404).json({ message: 'Размер не найден' });
      res.json({ message: 'Размер удален' });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
  },
};

module.exports = sizeController;