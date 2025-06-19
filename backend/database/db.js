const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conectado a PostgreSQL');
    release();
  }
});

module.exports = pool;