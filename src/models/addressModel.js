const pool = require('../config/db');

const addressModel = {
  async createAddress(userId, { city, street, house, building, apartment, postalCode }) {
    const query = `
      INSERT INTO addresses (user_id, city, street, house, building, apartment, postal_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      city,
      street,
      house,
      building,
      apartment,
      postalCode,
    ]);
    return result.rows[0];
  },

  async updateAddress(addressId, { city, street, house, building, apartment, postalCode }) {
    const query = `
      UPDATE addresses
      SET city = $1, street = $2, house = $3, building = $4, apartment = $5, postal_code = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [
      city,
      street,
      house,
      building,
      apartment,
      postalCode,
      addressId,
    ]);
    return result.rows[0];
  },

  async getAddressesByUser(userId) {
    const query = `
      SELECT * FROM addresses
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },
};

module.exports = addressModel;