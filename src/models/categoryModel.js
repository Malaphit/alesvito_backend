const pool = require('../config/db');

const categoryModel = {
  async getAllCategories() {
    const query = 'SELECT * FROM categories';
    const result = await pool.query(query);
    return result.rows;
  },

  async getCategoryById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async createCategory(name, description, weight) {
    const query = `
      INSERT INTO categories (name, description, weight)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [name, description, weight];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateCategory(id, name, description, weight) {
    const query = `
      UPDATE categories
      SET name = $1, description = $2, weight = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [name, description, weight, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async deleteCategory(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = categoryModel;