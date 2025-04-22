const pool = require('../config/db');

const orderModel = {
  async getAllOrders() {
    const query = `
      SELECT o.*, u.email AS user_email, a.city, a.street, a.house, a.building, a.apartment, a.postal_code
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getOrdersByUser(userId) {
    const query = `
      SELECT o.*, u.email AS user_email, a.city, a.street, a.house, a.building, a.apartment, a.postal_code
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async createOrder(userId, items, addressId, bonusPointsUsed) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query('SELECT bonus_points FROM users WHERE id = $1', [userId]);
      if (userResult.rows[0].bonus_points < bonusPointsUsed) {
        throw new Error('Недостаточно бонусов');
      }

      const orderQuery = `
        INSERT INTO orders (user_id, total_price, address_id, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING *
      `;
      const totalPrice = items.reduce((sum, item) => sum + item.price_at_time * item.quantity, 0);
      const orderResult = await client.query(orderQuery, [userId, totalPrice, addressId]);
      const order = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, size_id, quantity, price_at_time)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.size_id, item.quantity, item.price_at_time]
        );
      }

      if (bonusPointsUsed > 0) {
        await client.query(
          'UPDATE users SET bonus_points = bonus_points - $1 WHERE id = $2',
          [bonusPointsUsed, userId]
        );
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateOrderStatus(orderId, status) {
    const query = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, orderId]);
    return result.rows[0];
  },
};

module.exports = orderModel;