require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  host: 'localhost',
  database: 'todolist-next-2'
});

module.exports = pool;