import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Helper: try to extract database info from DATABASE_URL or MYSQLCONNSTR_* like in sequelize.mjs
function parseDatabaseUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return {
      database: u.pathname ? u.pathname.replace(/^\//, "") : undefined,
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : undefined,
      user: u.username || undefined,
      password: u.password || undefined,
    };
  } catch (e) {
    return null;
  }
}

function parseMysqlConnStr(connStr) {
  const parts = connStr.split(";").map((p) => p.trim()).filter(Boolean);
  const obj = {};
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    if (!k) continue;
    obj[k.trim().toLowerCase()] = rest.join("=").trim();
  }
  return {
    database: obj.database || obj.db || undefined,
    host: obj["data source"] || obj.server || undefined,
    user: (obj["user id"] || obj.user || obj.uid) || undefined,
    password: obj.password || obj.pwd || undefined,
  };
}

// Resolve host/user/password/port normally from env, but resolve database name with precedence
const host = process.env.DB_REMOTE_HOST || process.env.DB_HOST || 'cmid3b-srv-db.mysql.database.azure.com';
const user = process.env.DB_USER || 'romrom';
const password = process.env.DB_PASSWORD || '';
let database = undefined;

// 1) Prefer DATABASE_NAME if explicitly provided (user requested this behavior)
if (process.env.DATABASE_NAME && process.env.DATABASE_NAME.trim()) {
  database = process.env.DATABASE_NAME.trim();
}

// 2) Fall back to DB_NAME env var if DATABASE_NAME not set
if (!database && process.env.DB_NAME && process.env.DB_NAME.trim()) {
  database = process.env.DB_NAME.trim();
}

// 3) Try DATABASE_URL
if (!database && process.env.DATABASE_URL) {
  const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
  if (parsed && parsed.database) database = parsed.database;
}

// 4) Try Azure-style MYSQLCONNSTR_*
if (!database) {
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('MYSQLCONNSTR_')) {
      const parsed = parseMysqlConnStr(process.env[k]);
      if (parsed && parsed.database) {
        database = parsed.database;
        break;
      }
    }
  }
}

// 5) As a last resort use a conservative default (keeps behavior similar to previous code)
if (!database) {
  database = process.env.DB_FALLBACK_NAME || 'db_romrom';
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
