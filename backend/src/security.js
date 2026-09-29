import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const digest = token => createHash('sha256').update(token).digest('hex');
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [algorithm, salt, hex] = (encoded || '').split(':');
  if (algorithm !== 'scrypt' || !salt || !/^[0-9a-f]{128}$/.test(hex || '')) return false;
  const key = await scrypt(password, salt, 64);
  return timingSafeEqual(key, Buffer.from(hex, 'hex'));
}
export function fail(status, message) { throw Object.assign(new Error(message), { status }); }
export const requireRole = (user, roles) => { if (!roles.includes(user.rol)) fail(403, 'No tienes permiso para esta operación.'); };
// Callers always use i/e/s aliases. EXISTS avoids duplicates from multiple scopes.
export function scope(user, { ebdiOnly = false } = {}) {
  if (user.rol === 'administrador') return { sql: '1=1', values: [] };
  if (user.rol === 'estancia') return { sql: 'EXISTS (SELECT 1 FROM usuario_ambito a WHERE a.id_usuario=? AND a.id_ebdi=e.id_ebdi)', values: [user.id_usuario] };
  if (user.rol === 'coordinador_regional') return { sql: 'EXISTS (SELECT 1 FROM usuario_ambito a WHERE a.id_usuario=? AND (a.id_region=s.id_region OR a.id_estado=s.id_estado OR a.id_ebdi=e.id_ebdi))', values: [user.id_usuario] };
  if (user.rol === 'tutor' && !ebdiOnly) return { sql: 'EXISTS (SELECT 1 FROM infante_tutor it JOIN tutores t ON t.id_tutor=it.id_tutor WHERE it.id_infante=i.id_infante AND it.acceso_autorizado=1 AND t.id_usuario=?)', values: [user.id_usuario] };
  return { sql: '1=0', values: [] };
}
export const childJoin = 'FROM infantes i JOIN ebdi e ON e.id_ebdi=i.id_ebdi JOIN estados s ON s.id_estado=e.id_estado';
export async function accessibleChild(conn, user, id, lock = false) {
  const access = scope(user);
  const [rows] = await conn.execute(`SELECT i.* ${childJoin} WHERE i.id_infante=? AND ${access.sql}${lock ? ' FOR UPDATE' : ''}`, [id, ...access.values]);
  if (!rows.length) fail(404, 'Expediente no encontrado.');
  return rows[0];
}
