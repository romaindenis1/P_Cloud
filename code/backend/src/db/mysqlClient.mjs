import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const host = process.env.DB_REMOTE_HOST || process.env.DB_HOST || 'cmid3b-srv-db.mysql.database.azure.com';
const user = process.env.DB_USER || 'romrom';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || process.env.DATABASE_NAME || 'db_romrom';

if (!database) {
  throw new Error(
    'No database name provided for mysql client. Set DB_NAME (or DATABASE_NAME) environment variable or include the database in DATABASE_URL / MYSQLCONNSTR_.'
  );
}
const port = parseInt(process.env.DB_REMOTE_PORT || process.env.DB_PORT || '3306', 10);

// Option: read CA from base64 env or from file path
let ssl = undefined;
if (process.env.MYSQL_SSL_CA_PATH) {
  try {
    ssl = { ca: fs.readFileSync(process.env.MYSQL_SSL_CA_PATH) };
  } catch (e) {
    console.warn('Could not read MYSQL_SSL_CA_PATH file:', e.message || e);
  }
}
if (!ssl && process.env.MYSQL_SSL_CA) {
  try {
    ssl = { ca: Buffer.from(process.env.MYSQL_SSL_CA, 'base64') };
  } catch (e) {
    console.warn('Could not parse MYSQL_SSL_CA:', e.message || e);
  }
}

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
  waitForConnections: true,
  connectionLimit: 10,
  ...(ssl ? { ssl } : {}),
});

export default pool;
