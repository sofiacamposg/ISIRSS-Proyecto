import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mysql from 'mysql2/promise';
import { createPool, dbConfig } from '../src/db.js';
import { createApp } from '../src/app.js';
// Only run against a disposable database freshly initialized and seeded by scripts.
test('MySQL: roles, ownership, validation, append-only correction, audit, revocation', { skip: process.env.RUN_DB_TESTS !== '1' }, async () => {
  assert.match(process.env.DB_NAME || '', /test/, 'Use a disposable DB_NAME containing test');
  const pool = createPool(), admin = await mysql.createConnection(dbConfig(true));
  try {
    const app = createApp(pool);
    const agents = {};
    for (const name of ['admin','estancia','regional','tutor']) {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').set('Origin', 'http://localhost:5173').send({ username: `${name}@demo.invalid`, password: process.env.SEED_PASSWORD }).expect(200);
      agents[name] = agent;
    }
    for (const [role, expected] of [['admin',3],['estancia',2],['regional',2],['tutor',1]]) {
      const result = await agents[role].get('/api/infantes').expect(200); assert.equal(result.body.total, expected);
    }
    for (const role of ['estancia','regional','tutor']) {
      await agents[role].get('/api/infantes/3').expect(404);
      await agents[role].get('/api/mediciones/3').expect(404);
      const result = await agents[role].get('/api/mediciones').query({ filter: JSON.stringify({ id_infante: '3' }) }).expect(200);
      assert.equal(result.body.total, 0);
    }
    const tutor = await agents.tutor.get('/api/mediciones/1').expect(200);
    assert.equal(tutor.body.data.observaciones, undefined); assert.equal(tutor.body.data.estado_nutricional_registrado, undefined);
    await agents.tutor.get('/api/ebdi').expect(403);
    for (const role of ['regional','tutor']) await agents[role].post('/api/mediciones').set('Origin','http://localhost:5173').send({}).expect(403);
    const child = { nombre: 'Prueba API', fecha_nacimiento: '2023-01-01', fecha_ingreso: '2026-01-01', sexo_patron: 'no_especificado', id_ebdi: '1', tutor_nombre: 'Contacto de prueba', tutor_parentesco: 'tutor' };
    await agents.estancia.post('/api/infantes').set('Origin','http://localhost:5173').send({ ...child, id_ebdi: '2' }).expect(403);
    const created = await agents.estancia.post('/api/infantes').set('Origin','http://localhost:5173').send(child).expect(201);
    assert.match(created.body.data.matricula, /^DEV-/);
    const measurement = { id_infante: created.body.data.id, fecha_medicion: '2026-02-01', peso_kg: 14, talla_cm: 95, tipo_talla: 'talla_de_pie', tipo: 'periodica' };
    const result = await agents.estancia.post('/api/mediciones').set('Origin','http://localhost:5173').send(measurement).expect(201);
    const id = result.body.data.id;
    await agents.estancia.put(`/api/mediciones/${id}`).set('Origin','http://localhost:5173').send({ ...measurement, motivo_correccion: 'Error de captura' }).expect(403);
    await agents.admin.put(`/api/mediciones/${id}`).set('Origin','http://localhost:5173').send(measurement).expect(400);
    await agents.admin.put(`/api/mediciones/${id}`).set('Origin','http://localhost:5173').send({ ...measurement, peso_kg: 14.2, motivo_correccion: 'Error de captura' }).expect(200);
    const current = await agents.admin.get(`/api/mediciones/${id}`).expect(200); assert.equal(current.body.data.numero_version, 2);
    const [versions] = await admin.execute('SELECT peso_kg FROM medicion_versiones WHERE id_medicion=? ORDER BY numero_version', [id]);
    assert.equal(versions.length, 2); assert.equal(versions[0].peso_kg, 14);
    const [events] = await admin.execute("SELECT COUNT(*) n FROM bitacora WHERE entidad='mediciones' AND accion='correccion' AND id_registro=?", [id]); assert.equal(Number(events[0].n), 1);
    await assert.rejects(pool.query('UPDATE medicion_versiones SET peso_kg=1 WHERE id_medicion=1'), e => e.code === 'ER_TABLEACCESS_DENIED_ERROR');
    await admin.query('UPDATE infante_tutor SET acceso_autorizado=0 WHERE id_infante=1');
    await agents.tutor.get('/api/infantes/1').expect(404);
    await admin.query("UPDATE usuarios SET estado='bloqueado' WHERE correo='estancia@demo.invalid'");
    await agents.estancia.get('/api/infantes').expect(401);
    await agents.admin.post('/api/auth/logout').set('Origin','http://localhost:5173').expect(200);
    await agents.admin.get('/api/infantes').expect(401);
  } finally { await pool.end(); await admin.end(); }
});
