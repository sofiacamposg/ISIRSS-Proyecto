import 'dotenv/config';
import mysql from 'mysql2/promise';
import { dbConfig, insert, audit } from '../src/db.js';
import { hashPassword } from '../src/security.js';
if (process.env.NODE_ENV === 'production') throw new Error('El seed es exclusivo de desarrollo.');
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 12) throw new Error('Define SEED_PASSWORD con al menos 12 caracteres.');
const conn = await mysql.createConnection(dbConfig(true));
try {
  await conn.beginTransaction();
  const [rows] = await conn.query('SELECT (SELECT COUNT(*) FROM usuarios)+(SELECT COUNT(*) FROM infantes) total');
  if (Number(rows[0].total)) throw new Error('Seed cancelado: la base ya tiene cuentas o infantes.');
  const [roles] = await conn.query('SELECT * FROM roles');
  const roleId = role => roles.find(r => r.nombre === role).id_rol;
  const region = await insert(conn, 'regiones', { nombre: 'Región DEMO A' });
  const regionB = await insert(conn, 'regiones', { nombre: 'Región DEMO B' });
  const state = await insert(conn, 'estados', { nombre: 'Estado DEMO A', id_region: region });
  const stateB = await insert(conn, 'estados', { nombre: 'Estado DEMO B', id_region: regionB });
  const ebdi = await insert(conn, 'ebdi', { clave: 'DEMO-01', nombre: 'Estancia Jardín de Prueba', id_estado: state });
  const ebdiB = await insert(conn, 'ebdi', { clave: 'DEMO-02', nombre: 'Estancia Bosque de Prueba', id_estado: stateB });
  const users = {};
  for (const [mail, role, nombre] of [['admin','administrador','Administración DEMO'],['estancia','estancia','Captura DEMO'],['regional','coordinador_regional','Coordinación DEMO'],['tutor','tutor','Familia DEMO']]) {
    users[mail] = await insert(conn, 'usuarios', { nombre, correo: `${mail}@demo.invalid`, password_hash: await hashPassword(password), id_rol: roleId(role) });
  }
  await insert(conn, 'usuario_ambito', { id_usuario: users.estancia, id_ebdi: ebdi });
  await insert(conn, 'usuario_ambito', { id_usuario: users.regional, id_region: region });
  for (let index = 1; index <= 3; index++) {
    const id = await insert(conn, 'infantes', { matricula: `DEMO-000${index}`, nombre: `Infante de prueba ${index}`, apellido_paterno: 'Ficticio', fecha_nacimiento: '2023-01-15', sexo_patron: 'no_especificado', fecha_ingreso: '2026-01-15', id_ebdi: index === 3 ? ebdiB : ebdi, creado_por: users.admin });
    const mid = await insert(conn, 'mediciones', { id_infante: id, id_ebdi_captura: index === 3 ? ebdiB : ebdi, creado_por: users.admin });
    await insert(conn, 'medicion_versiones', { id_medicion: mid, numero_version: 1, fecha_medicion: '2026-02-01', fecha_nacimiento_utilizada: '2023-01-15', sexo_patron_utilizado: 'no_especificado', peso_kg: 14, talla_cm: 95, tipo_talla: 'talla_de_pie', tipo: 'periodica', observaciones: 'Nota interna ficticia: no exponer al tutor.', registrado_por: users.admin });
    if (index === 1) {
      const tid = await insert(conn, 'tutores', { nombre: 'Contacto ficticio', id_usuario: users.tutor });
      await insert(conn, 'infante_tutor', { id_infante: id, id_tutor: tid, parentesco: 'tutor', acceso_autorizado: true, autorizado_por: users.admin, autorizado_en: '2026-01-15 00:00:00' });
      await insert(conn, 'avisos_tutores', { id_infante: id, mensaje: 'Este expediente contiene exclusivamente datos ficticios para pruebas.', publicado_por: users.admin });
    }
  }
  await audit(conn, { id_usuario: users.admin }, 'seed_desarrollo', 'sistema', null, null, { datos: 'sinteticos' });
  await conn.commit();
  console.log('Datos ficticios creados. Cuentas: admin, estancia, regional y tutor @demo.invalid. Contraseña: la definida en SEED_PASSWORD.');
} catch (error) { await conn.rollback(); throw error; }
finally { await conn.end(); }
