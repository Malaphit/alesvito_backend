const pool = require('../config/db');

const chatModel = {
  async getMessages(userId, isAdmin = false) {
    let query;
    let params;

    if (isAdmin) {
      query = `
        SELECT cm.*, 
               u1.first_name AS user_first_name, u1.last_name AS user_last_name, u1.email AS user_email,
               u2.first_name AS admin_first_name, u2.last_name AS admin_last_name, u2.email AS admin_email
        FROM chat_messages cm
        LEFT JOIN users u1 ON cm.user_id = u1.id
        LEFT JOIN users u2 ON cm.admin_id = u2.id
        ORDER BY cm.created_at
      `;
      params = [];
    } else {
      query = `
        SELECT cm.*, 
               u1.first_name AS user_first_name, u1.last_name AS user_last_name, u1.email AS user_email,
               u2.first_name AS admin_first_name, u2.last_name AS admin_last_name, u2.email AS admin_email
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
    const query = `
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN chat_messages cm ON u.id = cm.user_id
      WHERE u.role = 'user'
      ORDER BY u.email
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async getMessagesByUser(adminId, userId) {
    const query = `
      SELECT cm.*, 
             u1.first_name AS user_first_name, u1.last_name AS user_last_name, u1.email AS user_email,
             u2.first_name AS admin_first_name, u2.last_name AS admin_last_name, u2.email AS admin_email
      FROM chat_messages cm
      LEFT JOIN users u1 ON cm.user_id = u1.id
      LEFT JOIN users u2 ON cm.admin_id = u2.id
      WHERE cm.user_id = $1 AND cm.admin_id = $2
      ORDER BY cm.created_at
    `;
    const result = await pool.query(query, [userId, adminId]);
    return result.rows;
  },

  async createMessage(senderId, message, isAdmin = false, targetUserId = null) {
    let userId, adminId, senderRole;

    if (isAdmin) {
      userId = targetUserId;
      adminId = senderId;
      senderRole = 'admin';
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [
        targetUserId,
        'user',
      ]);
      if (userCheck.rows.length === 0) {
        throw new Error('Пользователь не найден');
      }
    } else {
      userId = senderId;
      const adminQuery = `
        SELECT id FROM users 
        WHERE role = 'admin' 
        LIMIT 1
      `;
      const adminResult = await pool.query(adminQuery);
      if (adminResult.rows.length === 0) {
        throw new Error('Администратор не найден');
      }
      adminId = adminResult.rows[0].id;
      senderRole = 'user';
    }

    const query = `
      INSERT INTO chat_messages (user_id, admin_id, message, sender_role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, adminId, message, senderRole]);
    return result.rows[0];
  },

  async markAsRead(messageId) {
    const query = 'UPDATE chat_messages SET is_read = TRUE WHERE id = $1 AND sender_role = $2 RETURNING *';
    const result = await pool.query(query, [messageId, 'user']);
    return result.rows[0];
  },
};

module.exports = chatModel;