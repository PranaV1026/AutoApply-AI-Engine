const { Pool } = require('pg');

let pool;

function getPool() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL environment variable');
  }

  pool = new Pool({ connectionString });
  return pool;
}

async function query(text, params = []) {
  const client = getPool();
  return client.query(text, params);
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  query,
  closePool
};
