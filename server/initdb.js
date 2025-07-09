import db from './db/index.js'; 

async function setup() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS combinations (
        id SERIAL PRIMARY KEY,
        combination TEXT[][] NOT NULL,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        result JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Tables created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to create tables', err);
  } finally {
    client.release();
  }
}

setup();
