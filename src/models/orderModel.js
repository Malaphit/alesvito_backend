const pool = require('../config/db');

const orderModel = {
  async getAllOrders() {
    const query = `
      SELECT o.*, u.email AS user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async updateOrderStatus(orderId, status) {
    const query = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [status, orderId]);
    return result.rows[0];
  },

  async createOrder(userId, items, deliveryAddress, bonusPointsUsed) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userQuery = 'SELECT bonus_points FROM users WHERE id = $1';
      const userResult = await client.query(userQuery, [userId]);
      const user = userResult.rows[0];
      if (bonusPointsUsed > user.bonus_points) {
        throw new Error('Недостаточно бонусов');
      }

      let totalPrice = 0;
      for (const item of items) {
        const productQuery = 'SELECT price FROM products WHERE id = $1';
        const productResult = await client.query(productQuery, [item.productId]);
        if (!productResult.rows[0]) throw new Error(`Товар ${item.productId} не найден`);
        totalPrice += productResult.rows[0].price * item.quantity;
      }
      totalPrice = Math.max(0, totalPrice - bonusPointsUsed);

      const orderQuery = `
        INSERT INTO orders (user_id, total_price, delivery_address, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [userId, totalPrice, deliveryAddress, 'pending']);
      const order = orderResult.rows[0];

      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, size_id, quantity, price_at_time)
          VALUES ($1, $2, $3, $4, (SELECT price FROM products WHERE id = $2))
        `;
        await client.query(itemQuery, [order.id, item.productId, item.sizeId, item.quantity]);
      }

      if (bonusPointsUsed > 0) {
        await client.query(
          'UPDATE users SET bonus_points = bonus_points - $1 WHERE id = $2',
          [bonusPointsUsed, userId]
        );
        await client.query(
          'INSERT INTO payments (order_id, amount, bonus_points_used, status) VALUES ($1, $2, $3, $4)',
          [order.id, totalPrice, bonusPointsUsed, 'completed']
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
};

module.exports = orderModel;