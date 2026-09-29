import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/db.js';
const config = dbConfig(true);
const name = config.database;
if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error('DB_NAME inválido');
if (!/^[a-zA-Z0-9_]+$/.test(process.env.DB_USER || '') || !process.env.DB_PASSWORD) throw new Error('Configura DB_USER y DB_PASSWORD para crear la cuenta de aplicación.');
const conn = await mysql.createConnection({ ...config, database: undefined, multipleStatements: true });
try {
  // Fails if DB already exists; never drops or overwrites a database.
  const ddl = (await readFile(new URL('../../db/padronmysql (Propuesta1).sql', import.meta.url), 'utf8')).replaceAll('issste_padron', name);
  await conn.query(ddl);
  await conn.query(await readFile(new URL('../../db/migrations/001_sesiones.sql', import.meta.url), 'utf8'));
  const account = `${conn.escape(process.env.DB_USER)}@'%'`;
  await conn.query(`CREATE USER ${account} IDENTIFIED BY ${conn.escape(process.env.DB_PASSWORD)}`);
  const tables = ['regiones','estados','ebdi','roles','usuarios','usuario_ambito','infantes','tutores','infante_tutor','mediciones','medicion_versiones','mediciones_vigentes','avisos_tutores','sesiones'];
  for (const table of tables) await conn.query(`GRANT SELECT ON \`${name}\`.${table} TO ${account}`);
  for (const table of ['infantes','tutores','infante_tutor','antecedentes_parentales','movimientos_padron','mediciones','medicion_versiones','bitacora','sesiones']) await conn.query(`GRANT INSERT ON \`${name}\`.${table} TO ${account}`);
  await conn.query(`GRANT DELETE ON \`${name}\`.sesiones TO ${account}`);
  console.log('Esquema inicial, sesiones y usuario de aplicación creados.');
} finally { await conn.end(); }
