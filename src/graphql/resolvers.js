const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

// Load keys from env
const publicKey = process.env.PUBLIC_KEY.replace(/\\n/g, '\\n');
const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\\n');
const encryptForFrontend = process.env.ENCRYPT_FOR_FRONTEND === 'true';

// Utility: Encrypt using public key
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

// Utility: Decrypt using private key
function decrypt(data) {
  const buffer = Buffer.from(data, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );
  return decrypted.toString('utf8');
}

// Utility: Conditionally encrypt before sending to frontend
function maybeEncryptOutput(value) {
  return encryptForFrontend ? encrypt(value) : value;
}

// GraphQL Resolvers
const resolvers = {
  Query: {
    products: async () => {
      const { rows } = await pool.query('SELECT * FROM products');
      return rows;
    },

    product: async (parent, args) => {
      const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [args.id]);
      return rows[0];
    },

    users: async () => {
      const { rows } = await pool.query('SELECT * FROM users');
      return rows.map(user => ({
        ...user,
        username: maybeEncryptOutput(decrypt(user.username)),
        email: maybeEncryptOutput(decrypt(user.email)),
      }));
    },

    user: async (parent, args) => {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [args.id]);
      if (rows.length === 0) return null;
      const user = rows[0];
      return {
        ...user,
        username: maybeEncryptOutput(decrypt(user.username)),
        email: maybeEncryptOutput(decrypt(user.email)),
      };
    },

    validateUser: async (parent, { username, password }) => {
      console.log("validateUser: username", username);
      console.log("validateUser: password", password);
      try {
        const encryptedUsername = encrypt(username); // Frontend sends plain, you encrypt it
        console.log("validateUser: encryptedUsername", encryptedUsername);

        const { rows } = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          [encryptedUsername]
        );
        console.log('validateUser: Rows:', rows);

        if (rows.length === 0) {
          console.log("validateUser: User not found");
          return null;
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("validateUser: isPasswordValid", isPasswordValid);

        if (!isPasswordValid) {
          console.log("validateUser: Invalid password");
          return null;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
        console.log("validateUser: token", token);
        return token;
      } catch (error) {
        console.error('Error validating user:', error);
        return null;
      }
    },
    me: async (parent, args, context) => {
      // Check if user is authenticated
      const token = context.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;

        // Fetch user from database
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) return null;

        const user = rows[0];
        return {
          ...user,
          username: maybeEncryptOutput(decrypt(user.username)),
          email: maybeEncryptOutput(decrypt(user.email)),
        };
      } catch (error) {
        throw new Error('Invalid token');
      }
    }

  },

  Mutation: {
    createUser: async (parent, args) => {
      const { username, password, email } = args;
      const hashedPassword = await bcrypt.hash(password, 10);
      const encryptedUsername = encrypt(username);
      const encryptedEmail = encrypt(email);

      const { rows } = await pool.query(
        `INSERT INTO users (id, username, password, email)
         VALUES (uuid_generate_v4(), $1, $2, $3)
         RETURNING *`,
        [encryptedUsername, hashedPassword, encryptedEmail]
      );

      const newUser = rows[0];

      return {
        ...newUser,
        username: maybeEncryptOutput(decrypt(newUser.username)),
        email: maybeEncryptOutput(decrypt(newUser.email)),
      };
    },
  },
};

module.exports = resolvers;
