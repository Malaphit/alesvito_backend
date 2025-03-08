const pool = require('../config/db');

const sizeModel = {
  async getAllSizes() {
    const query = 'SELECT * FROM sizes';
    const result = await pool.query(query);
    return result.rows;
  },

  async createSize(size) {
    const query = 'INSERT INTO sizes (size) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [size]);
    return result.rows[0];
  },

  async updateSize(id, size) {
    const query = 'UPDATE sizes SET size = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [size, id]);
    return result.rows[0];
  },

  async deleteSize(id) {
    const query = 'DELETE FROM sizes WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = sizeModel;