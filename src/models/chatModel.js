const pool = require('../config/db');

const chatModel = {
  async getMessages(userId, isAdmin = false) {
    let query;
    let params;

    if (isAdmin) {
      // Администратор видит все сообщения
      query = `
        SELECT cm.*, u1.email AS user_email, u2.email AS admin_email
        FROM chat_messages cm
        LEFT JOIN users u1 ON cm.user_id = u1.id
        LEFT JOIN users u2 ON cm.admin_id = u2.id
        ORDER BY cm.created_at
      `;
      params = [];
    } else {
      // Пользователь видит свои сообщения
      query = `
        SELECT cm.*, u1.email AS user_email, u2.email AS admin_email
        FROM chat_messages cm
        LEFT JOIN users u1 ON cm.user_id = u1.id
        LEFT JOIN users u2 ON cm.admin_id = u2.id
        WHERE cm.user_id = $1
        ORDER BY cm.created_at
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getUsersWithMessages() {
    // Возвращает список пользователей, у которых есть сообщения
    const query = `
      SELECT DISTINCT u.id, u.email
      FROM users u
      JOIN chat_messages cm ON u.id = cm.user_id
      WHERE u.role = 'user'
      ORDER BY u.email
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getMessagesByUser(adminId, userId) {
    // Сообщения конкретного пользователя для администратора
    const query = `
      SELECT cm.*, u1.email AS user_email, u2.email AS admin_email
      FROM chat_messages cm
      LEFT JOIN users u1 ON cm.user_id = u1.id
      LEFT JOIN users u2 ON cm.admin_id = u2.id
      WHERE cm.user_id = $1 AND cm.admin_id = $2
      ORDER BY cm.created_at
    `;
    const result = await pool.query(query, [userId, adminId]);
    return result.rows;
  },

  async createMessage(userId, message) {
    // Автоматический выбор администратора
    const adminQuery = `
      SELECT id FROM users 
      WHERE role = 'admin' 
      LIMIT 1
    `;
    const adminResult = await pool.query(adminQuery);

    if (adminResult.rows.length === 0) {
      throw new Error('Администратор не найден');
    }

    const adminId = adminResult.rows[0].id;

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