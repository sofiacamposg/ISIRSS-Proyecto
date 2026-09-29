import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { randomBytes, randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { audit, insert, transaction } from './db.js';
import { digest, hashPassword, verifyPassword, fail, requireRole, scope, childJoin, accessibleChild } from './security.js';
import { childSchema, measurementSchema, listOptions, idSchema } from './validation.js';

const writers = ['administrador', 'estancia'];
export function createApp(pool, { origin = 'http://localhost:5173', secure = false } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet(), express.json({ limit: '32kb' }), cookieParser());
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    // Same-origin deployment, dev proxy; Origin is also required for login to prevent login CSRF.
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') !== origin) return res.status(403).json({ message: 'Origen no permitido.' });
    next();
  });
  app.get('/api/health', async (req, res) => { await pool.query('SELECT 1'); res.json({ status: 'ok' }); });
  const cookieOptions = { httpOnly: true, secure, sameSite: 'strict', path: '/api', maxAge: 8 * 60 * 60 * 1000 };
  const dummyHash = hashPassword(randomBytes(32).toString('hex'));
  app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Demasiados intentos. Intenta más tarde.' } }), async (req, res) => {
    const input = z.object({ username: z.email().max(254), password: z.string().min(1).max(256) }).strict().parse(req.body);
    const [users] = await pool.execute('SELECT u.*,r.nombre rol FROM usuarios u JOIN roles r ON r.id_rol=u.id_rol WHERE u.correo=?', [input.username]);
    const user = users[0];
    const valid = await verifyPassword(input.password, user?.password_hash || await dummyHash);
    if (!valid || user?.estado !== 'activo') {
      await audit(pool, null, 'login_fallido', 'usuarios');
      fail(401, 'Correo o contraseña incorrectos.');
    }
    const token = randomBytes(32).toString('hex');
    await transaction(pool, async conn => {
      await conn.execute('INSERT INTO sesiones(token_hash,id_usuario,expira_en) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 8 HOUR))', [digest(token), user.id_usuario]);
      await audit(conn, user, 'login', 'usuarios', user.id_usuario);
    });
    res.cookie('isirss_session', token, cookieOptions).json({ id: String(user.id_usuario), fullName: user.nombre, role: user.rol });
  });
  app.use('/api', async (req, res, next) => {
    const token = req.cookies.isirss_session;
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) fail(401, 'Inicia sesión para continuar.');
    const [users] = await pool.execute("SELECT u.id_usuario,u.nombre,r.nombre rol FROM sesiones se JOIN usuarios u ON u.id_usuario=se.id_usuario JOIN roles r ON r.id_rol=u.id_rol WHERE se.token_hash=? AND se.expira_en>UTC_TIMESTAMP() AND u.estado='activo'", [digest(token)]);
    if (!users.length) fail(401, 'La sesión terminó. Inicia sesión nuevamente.');
    req.user = users[0]; next();
  });
  app.get('/api/auth/me', (req, res) => res.json({ id: String(req.user.id_usuario), fullName: req.user.nombre, role: req.user.rol }));
  app.post('/api/auth/logout', async (req, res) => {
    await transaction(pool, async conn => {
      await conn.execute('DELETE FROM sesiones WHERE token_hash=?', [digest(req.cookies.isirss_session)]);
      await audit(conn, req.user, 'logout', 'usuarios', req.user.id_usuario);
    });
    res.clearCookie('isirss_session', { ...cookieOptions, maxAge: undefined }).json({ ok: true });
  });

  // All list and getOne queries share the same scope and projection: IDs cannot bypass permissions.
  function resource(user, name) {
    const tutor = user.rol === 'tutor';
    const access = scope(user, { ebdiOnly: name === 'ebdi' });
    const childFields = 'i.id_infante id,i.matricula,i.nombre,i.apellido_paterno,i.apellido_materno,i.fecha_nacimiento';
    const configs = {
      infantes: { fields: tutor ? childFields : `${childFields},i.fecha_ingreso,i.sexo_patron,i.id_ebdi,i.activo,i.restricciones_nutricionales,e.nombre ebdi`, from: childJoin, id: 'i.id_infante', sort: { id: 'i.id_infante', nombre: 'i.nombre', matricula: 'i.matricula' }, q: "CONCAT_WS(' ',i.matricula,i.nombre,i.apellido_paterno,i.apellido_materno)" },
      mediciones: { fields: `m.id_medicion id,m.id_infante,m.numero_version,m.fecha_medicion,m.edad_dias,m.peso_kg,m.talla_cm,m.tipo_talla,m.perimetro_cefalico_cm,ROUND(m.peso_kg/POW(m.talla_cm/100,2),2) imc${tutor ? '' : ',m.tipo,m.motivo_extraordinaria,m.observaciones,m.estado_nutricional_registrado,m.motivo_correccion'}`, from: `${childJoin} JOIN mediciones_vigentes m ON m.id_infante=i.id_infante`, id: 'm.id_medicion', sort: { id: 'm.id_medicion', fecha_medicion: 'm.fecha_medicion' } },
      ebdi: { fields: 'e.id_ebdi id,e.nombre,e.clave,s.nombre estado', from: 'FROM ebdi e JOIN estados s ON s.id_estado=e.id_estado', id: 'e.id_ebdi', sort: { id: 'e.id_ebdi', nombre: 'e.nombre' }, q: 'e.nombre', extra: ' AND e.activa=1' },
      avisos: { fields: 'a.id_aviso id,a.id_infante,a.mensaje,a.publicado_en', from: `${childJoin} JOIN avisos_tutores a ON a.id_infante=i.id_infante`, id: 'a.id_aviso', sort: { id: 'a.id_aviso', publicado_en: 'a.publicado_en' } },
    };
    if (!Object.hasOwn(configs, name)) fail(404, 'Recurso no disponible.');
    if (tutor && name === 'ebdi') fail(403, 'Recurso no disponible para este perfil.');
    return { ...configs[name], access };
  }
  app.get('/api/:resource', async (req, res) => {
    const c = resource(req.user, req.params.resource), opts = listOptions(req.query);
    if (!Object.hasOwn(c.sort, opts.sort)) fail(400, 'Orden no permitido.');
    let where = `WHERE ${c.access.sql}${c.extra || ''}`;
    const args = [...c.access.values];
    if (opts.filter.q) { if (!c.q) fail(400, 'Búsqueda no disponible.'); where += ` AND ${c.q} LIKE ?`; args.push(`%${opts.filter.q}%`); }
    if (opts.filter.id_infante) { if (req.params.resource === 'ebdi') fail(400, 'Filtro no permitido.'); where += ' AND i.id_infante=?'; args.push(opts.filter.id_infante); }
    if (opts.filter.id_ebdi) { if (req.user.rol === 'tutor') fail(400, 'Filtro no permitido.'); where += ' AND e.id_ebdi=?'; args.push(opts.filter.id_ebdi); }
    if (opts.filter.ids) { where += opts.filter.ids.length ? ` AND ${c.id} IN (${opts.filter.ids.map(() => '?').join(',')})` : ' AND 1=0'; args.push(...opts.filter.ids); }
    const result = await transaction(pool, async conn => {
      const [count] = await conn.execute(`SELECT COUNT(*) total ${c.from} ${where}`, args);
      const [data] = await conn.execute(`SELECT ${c.fields} ${c.from} ${where} ORDER BY ${c.sort[opts.sort]} ${opts.order},${c.id} ${opts.order} LIMIT ${opts.perPage} OFFSET ${opts.offset}`, args);
      await audit(conn, req.user, 'consulta_lista', req.params.resource, null, null, { ids: data.map(row => String(row.id)) });
      return { data: data.map(row => ({ ...row, id: String(row.id) })), total: Number(count[0].total) };
    });
    res.json(result);
  });
  app.get('/api/:resource/:id', async (req, res) => {
    const c = resource(req.user, req.params.resource), id = idSchema.parse(req.params.id);
    const data = await transaction(pool, async conn => {
      const [rows] = await conn.execute(`SELECT ${c.fields} ${c.from} WHERE ${c.access.sql}${c.extra || ''} AND ${c.id}=?`, [...c.access.values, id]);
      if (!rows.length) fail(404, 'Registro no encontrado.');
      await audit(conn, req.user, 'consulta', req.params.resource, id);
      return { ...rows[0], id: String(rows[0].id) };
    });
    res.json({ data });
  });
  app.post('/api/infantes', async (req, res) => {
    requireRole(req.user, writers);
    const input = childSchema.parse(req.body);
    const data = await transaction(pool, async conn => {
      const access = scope(req.user, { ebdiOnly: true });
      const [estancias] = await conn.execute(`SELECT e.id_ebdi FROM ebdi e JOIN estados s ON s.id_estado=e.id_estado WHERE e.id_ebdi=? AND e.activa=1 AND ${access.sql}`, [input.id_ebdi, ...access.values]);
      if (!estancias.length) fail(403, 'EBDI fuera de tu ámbito o inactiva.');
      const { tutor_nombre, tutor_parentesco, tutor_telefono, tutor_correo, estatura_madre_cm, estatura_padre_cm, ...child } = input;
      const record = { ...child, matricula: `DEV-${randomUUID().replaceAll('-', '').slice(0, 24)}`, creado_por: req.user.id_usuario };
      const id = await insert(conn, 'infantes', record);
      const tutorId = await insert(conn, 'tutores', { nombre: tutor_nombre, telefono: tutor_telefono, correo: tutor_correo });
      await insert(conn, 'infante_tutor', { id_infante: id, id_tutor: tutorId, parentesco: tutor_parentesco });
      await audit(conn, req.user, 'alta', 'tutores', tutorId, null, { nombre: tutor_nombre, telefono: tutor_telefono, correo: tutor_correo });
      await audit(conn, req.user, 'asociacion_contacto', 'infante_tutor', id, null, { id_tutor: tutorId, parentesco: tutor_parentesco, acceso_autorizado: false });
      if (estatura_madre_cm != null || estatura_padre_cm != null) {
        const parental = { id_infante: id, estatura_madre_cm: estatura_madre_cm ?? null, estatura_padre_cm: estatura_padre_cm ?? null, registrado_por: req.user.id_usuario };
        const aid = await insert(conn, 'antecedentes_parentales', parental);
        await audit(conn, req.user, 'alta', 'antecedentes_parentales', aid, null, parental);
      }
      const movement = { id_infante: id, tipo: 'alta', fecha: input.fecha_ingreso, id_ebdi_destino: input.id_ebdi, motivo: 'Registro inicial', registrado_por: req.user.id_usuario };
      const mid = await insert(conn, 'movimientos_padron', movement);
      await audit(conn, req.user, 'alta', 'movimientos_padron', mid, null, movement);
      await audit(conn, req.user, 'alta', 'infantes', id, null, record);
      return { ...record, id };
    });
    res.status(201).json({ data });
  });
  async function writeMeasurement(req, res, correction) {
    requireRole(req.user, correction ? ['administrador'] : writers);
    const input = measurementSchema.parse(req.body);
    if (correction && !input.motivo_correccion) fail(400, 'La corrección necesita un motivo.');
    const data = await transaction(pool, async conn => {
      const child = await accessibleChild(conn, req.user, input.id_infante, true);
      if (!child.activo) fail(409, 'El infante está inactivo.');
      if (input.fecha_medicion < child.fecha_nacimiento) fail(400, 'La medición es anterior al nacimiento.');
      let id, version = 1, previous = null;
      if (correction) {
        id = idSchema.parse(req.params.id);
        const [events] = await conn.execute('SELECT id_medicion FROM mediciones WHERE id_medicion=? AND id_infante=? FOR UPDATE', [id, input.id_infante]);
        if (!events.length) fail(404, 'Medición no encontrada.');
        const [rows] = await conn.execute('SELECT * FROM medicion_versiones WHERE id_medicion=? ORDER BY numero_version DESC LIMIT 1', [id]);
        previous = rows[0]; version = previous.numero_version + 1;
      } else {
        id = await insert(conn, 'mediciones', { id_infante: input.id_infante, id_ebdi_captura: child.id_ebdi, creado_por: req.user.id_usuario });
      }
      const { id_infante, ...values } = input;
      const record = { ...values, perimetro_cefalico_cm: values.perimetro_cefalico_cm ?? null, motivo_correccion: correction ? values.motivo_correccion : null, id_medicion: id, numero_version: version, fecha_nacimiento_utilizada: child.fecha_nacimiento, sexo_patron_utilizado: child.sexo_patron, registrado_por: req.user.id_usuario };
      await insert(conn, 'medicion_versiones', record);
      await audit(conn, req.user, correction ? 'correccion' : 'alta', 'mediciones', id, previous, record, record.motivo_correccion);
      return { ...record, id, id_infante };
    });
    res.status(correction ? 200 : 201).json({ data });
  }
  app.post('/api/mediciones', (req, res) => writeMeasurement(req, res, false));
  app.put('/api/mediciones/:id', (req, res) => writeMeasurement(req, res, true));
  app.use('/api', (req, res) => res.status(404).json({ message: 'Operación no disponible en esta entrega.' }));
  app.use((error, req, res, next) => {
    if (error instanceof ZodError) return res.status(400).json({ message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') });
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya existe un registro con ese identificador.' });
    const status = error.status >= 400 && error.status < 500 ? error.status : 500;
    // Never log bodies, hashes, tokens or raw SQL errors containing clinical data.
    if (status === 500) console.error('API error:', error.code || error.name);
    res.status(status).json({ message: status === 500 ? 'No fue posible completar la operación.' : error.message });
  });
  return app;
}
