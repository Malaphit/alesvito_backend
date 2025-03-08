const pool = require('../config/db');

const productModel = {
  async getAllProducts() {
    const query = `
      SELECT p.id, p.name, p.price, p.image_urls, p.views_count, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const result = await pool.query(query);
    const products = result.rows;
  
    for (let product of products) {
      product.sizes = await this.getProductSizes(product.id);
    }
    return products;
  },

  async getProductSizes(productId) {
    const query = `
      SELECT s.id, s.size
      FROM product_sizes ps
      JOIN sizes s ON ps.size_id = s.id
      WHERE ps.product_id = $1
    `;
    const result = await pool.query(query, [productId]);
    return result.rows;
  },

  async createProduct(categoryId, name, description, price, imageUrls, sizeIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // Проверяем и преобразуем imageUrls в JSON
      if (!Array.isArray(imageUrls)) {
        throw new Error('imageUrls должен быть массивом');
      }
      const imageUrlsJson = JSON.stringify(imageUrls); // Преобразуем в строку JSON
      console.log('imageUrlsJson:', imageUrlsJson); // Логируем для отладки
  
      const productQuery = `
        INSERT INTO products (category_id, name, description, price, image_urls)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const productValues = [categoryId, name, description, price, imageUrlsJson];
      const productResult = await client.query(productQuery, productValues);
      const product = productResult.rows[0];
  
      if (sizeIds && sizeIds.length > 0) {
        const sizeQuery = `
          INSERT INTO product_sizes (product_id, size_id)
          VALUES ${sizeIds.map((_, i) => `($1, $${i + 2})`).join(', ')}
        `;
        await client.query(sizeQuery, [product.id, ...sizeIds]);
      }
  
      await client.query('COMMIT');
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Ошибка при создании товара:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateProduct(id, categoryId, name, description, price, imageUrls, sizeIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const productQuery = `
        UPDATE products
        SET category_id = $1, name = $2, description = $3, price = $4, image_urls = $5
        WHERE id = $6
        RETURNING *
      `;
      const productValues = [categoryId, name, description, price, imageUrls, id];
      const productResult = await client.query(productQuery, productValues);
      const product = productResult.rows[0];

      // Обновляем размеры
      await client.query('DELETE FROM product_sizes WHERE product_id = $1', [id]);
      if (sizeIds && sizeIds.length > 0) {
        const sizeQuery = `
          INSERT INTO product_sizes (product_id, size_id)
          VALUES ${sizeIds.map((_, i) => `($1, $${i + 2})`).join(', ')}
        `;
        await client.query(sizeQuery, [id, ...sizeIds]);
      }

      await client.query('COMMIT');
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async incrementViews(productId) {
    const query = 'UPDATE products SET views_count = views_count + 1 WHERE id = $1 RETURNING views_count';
    const result = await pool.query(query, [productId]);
    return result.rows[0].views_count;
  },

  async deleteProduct(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = productModel;