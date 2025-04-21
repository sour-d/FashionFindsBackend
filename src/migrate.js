const pool = require('./db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

// Load public key from environment
const publicKey = process.env.PUBLIC_KEY;

function encrypt(data) {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );
  return encrypted.toString('base64');
}

async function migrate() {
  try {
    // Drop existing tables
    await pool.query('DROP TABLE IF EXISTS products');
    await pool.query('DROP TABLE IF EXISTS users');

    // Create UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL
      )
    `);

    // Insert dummy product data
    await pool.query(`
      INSERT INTO products (id, name, description, price, stock)
      VALUES 
        ('1', 'Stylish T-Shirt', 'A comfortable and stylish t-shirt.', 25.99, 150),
        ('2', 'Classic Jeans', 'Durable denim jeans.', 49.99, 85),
        ('3', 'Running Shoes', 'Lightweight shoes for running.', 89.99, 50),
        ('4', 'Summer Dress', 'A light and airy summer dress.', 35.00, 120)
      ON CONFLICT (id) DO NOTHING
    `);

    // Create users table with TEXT types for encrypted fields
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT
      )
    `);

    // Encrypt sensitive fields
    const encryptedUsername = 'user';
    const encryptedEmail = encrypt('default@example.com');
    const hashedPassword = await bcrypt.hash('pw', 10);

    // Insert default user
    await pool.query(
      `
      INSERT INTO users (id, username, password, email)
      VALUES (uuid_generate_v4(), $1, $2, $3)
      ON CONFLICT (id) DO NOTHING
      `,
      [encryptedUsername, hashedPassword, encryptedEmail]
    );

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

module.exports = migrate;

if (require.main === module) {
  migrate();
}
