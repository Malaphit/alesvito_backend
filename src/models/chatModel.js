const pool = require('../config/db');

const chatModel = {
  async getMessages(userId) {
    const query = `
      SELECT cm.*, u1.email AS user_email, u2.email AS admin_email
      FROM chat_messages cm
      LEFT JOIN users u1 ON cm.user_id = u1.id
      LEFT JOIN users u2 ON cm.admin_id = u2.id
      WHERE cm.user_id = $1 OR cm.admin_id = $1
      ORDER BY cm.created_at
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async createMessage(userId, adminId, message) {
    const query = `
      INSERT INTO chat_messages (user_id, admin_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, adminId, message]);
    return result.rows[0];
  },

  async markAsRead(messageId) {
    const query = 'UPDATE chat_messages SET is_read = TRUE WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [messageId]);
    return result.rows[0];
  },
};

module.exports = chatModel;