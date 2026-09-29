import 'dotenv/config';
import mysql from 'mysql2/promise';
export const dbConfig = (admin = false) => ({
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  user: process.env[admin ? 'DB_ADMIN_USER' : 'DB_USER'],
  password: process.env[admin ? 'DB_ADMIN_PASSWORD' : 'DB_PASSWORD'],
  database: process.env.DB_NAME || 'issste_padron',
  dateStrings: true, decimalNumbers: true, supportBigNumbers: true, bigNumberStrings: true,
  timezone: 'Z', connectionLimit: 10,
});
export function createPool() { return mysql.createPool(dbConfig()); }
export async function transaction(pool, action) {
  const conn = await pool.getConnection();
  try { await conn.beginTransaction(); const result = await action(conn); await conn.commit(); return result; }
  catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
export async function audit(conn, user, action, entity, id = null, before = null, after = null, reason = null) {
  await conn.execute('INSERT INTO bitacora(id_usuario,accion,entidad,id_registro,valor_anterior,valor_nuevo,motivo) VALUES (?,?,?,?,?,?,?)',
    [user?.id_usuario ?? null, action, entity, id === null ? null : String(id), before === null ? null : JSON.stringify(before), after === null ? null : JSON.stringify(after), reason]);
}
export async function insert(conn, table, data) {
  // Table names and column keys are exclusively built in server code, never taken from request keys.
  const keys = Object.keys(data);
  const [result] = await conn.execute(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`, Object.values(data));
  return String(result.insertId);
}
