import pkg from "pg";
const { Pool } = pkg;

const db = new Pool({
  user: process.env.DB_NAME,
  host: process.env.DB_HOST,
  database: "combinations_db",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export default db;
