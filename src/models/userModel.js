const pool = require('../config/db');
const bcrypt = require('bcrypt');

const userModel = {
  async createUser(email, password, referralCode = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const generatedReferralCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    //Bonuce
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userQuery = `
        INSERT INTO users (email, password_hash, referral_code)
        VALUES ($1, $2, $3)
        RETURNING id, email, referral_code, created_at
      `;
      const userValues = [email, hashedPassword, generatedReferralCode];
      const userResult = await client.query(userQuery, userValues);
      const newUser = userResult.rows[0];

      if (referralCode) {
        const inviterQuery = 'SELECT id FROM users WHERE referral_code = $1';
        const inviterResult = await client.query(inviterQuery, [referralCode]);
        const inviter = inviterResult.rows[0];

        if (inviter) {
          const referralQuery = `
            INSERT INTO referrals (inviter_id, invited_id)
            VALUES ($1, $2)
          `;
          await client.query(referralQuery, [inviter.id, newUser.id]);

          await client.query(
            'UPDATE users SET bonus_points = bonus_points + 1000 WHERE id = $1',
            [inviter.id]
          );
          await client.query(
            'UPDATE users SET bonus_points = bonus_points + 1000 WHERE id = $1',
            [newUser.id]
          );
        }
      }

      await client.query('COMMIT');
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    const user = result.rows[0] || null;
    console.log('User fetched:', user); // Для отладки
    return user;
  },

  async getUserById(userId) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  },

  async updateResetToken(userId, token) {
    const query = 'UPDATE users SET reset_token = $1 WHERE id = $2';
    await pool.query(query, [token, userId]);
  },

  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password_hash = $1 WHERE id = $2';
    await pool.query(query, [hashedPassword, userId]);
  },

  async findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async getUserProfile(userId) {
    const query = `
      SELECT id, email, first_name, last_name, phone, referral_code, bonus_points
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },
};

module.exports = userModel;