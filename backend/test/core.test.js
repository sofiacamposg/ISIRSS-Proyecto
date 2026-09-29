import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { hashPassword, verifyPassword, scope } from '../src/security.js';
import { childSchema, measurementSchema, listOptions } from '../src/validation.js';
import { transaction } from '../src/db.js';
import { createApp } from '../src/app.js';
const measurement = { id_infante: '1', fecha_medicion: '2026-02-01', peso_kg: 12.345, talla_cm: 90.5, tipo_talla: 'talla_de_pie', tipo: 'periodica' };
test('passwords salted; correct password only', async () => {
  const a = await hashPassword('prueba segura'), b = await hashPassword('prueba segura');
  assert.notEqual(a, b); assert.equal(await verifyPassword('prueba segura', a), true); assert.equal(await verifyPassword('otra', a), false); assert.equal(await verifyPassword('otra', 'invalido'), false);
});
test('reject future/invalid dates, zero measures, precision loss and unknown fields', () => {
  assert.equal(measurementSchema.safeParse(measurement).success, true);
  for (const invalid of [{ fecha_medicion: '2099-01-01' }, { fecha_medicion: '2026-02-30' }, { peso_kg: 0 }, { peso_kg: 1.2345 }, { talla_cm: -10 }, { tipo: 'extraordinaria' }, { creado_por: '2' }, { perimetro_cefalico_cm: 0 }]) assert.equal(measurementSchema.safeParse({ ...measurement, ...invalid }).success, false);
  assert.equal(measurementSchema.safeParse({ ...measurement, tipo: 'extraordinaria', motivo_extraordinaria: 'Seguimiento' }).success, true);
});
test('reject child temporal inconsistency and forged privilege fields', () => {
  const child = { nombre: 'Prueba', fecha_nacimiento: '2023-01-01', fecha_ingreso: '2026-01-01', sexo_patron: 'no_especificado', id_ebdi: '1', tutor_nombre: 'Contacto', tutor_parentesco: 'tutor' };
  assert.equal(childSchema.safeParse(child).success, true);
  assert.equal(childSchema.safeParse({ ...child, fecha_ingreso: '2022-01-01' }).success, false);
  assert.equal(childSchema.safeParse({ ...child, creado_por: '99' }).success, false);
});
test('pagination and filters bound workload and reject malformed queries', () => {
  assert.throws(() => listOptions({ perPage: '1000' })); assert.throws(() => listOptions({ filter: 'null' })); assert.throws(() => listOptions({ filter: '{' })); assert.throws(() => listOptions({ filter: '{"rol":"administrador"}' }));
  assert.equal(listOptions({ page: '2', perPage: '25' }).offset, 25);
});
test('unknown roles deny, tutors require authorized associations, estancia cannot use region scope', () => {
  assert.equal(scope({ rol: 'desconocido' }).sql, '1=0');
  assert.match(scope({ rol: 'tutor', id_usuario: '5' }).sql, /acceso_autorizado=1/);
  assert.doesNotMatch(scope({ rol: 'estancia', id_usuario: '5' }).sql, /id_region/);
  assert.equal(scope({ rol: 'tutor', id_usuario: '5' }, { ebdiOnly: true }).sql, '1=0');
});
test('failed audit/write rolls back transaction and releases connection', async () => {
  const calls = [];
  const conn = { beginTransaction: async () => calls.push('begin'), commit: async () => calls.push('commit'), rollback: async () => calls.push('rollback'), release: () => calls.push('release') };
  await assert.rejects(transaction({ getConnection: async () => conn }, async () => { throw new Error('audit failed'); }));
  assert.deepEqual(calls, ['begin', 'rollback', 'release']);
});
test('HTTP blocks unauthenticated reads, cross-origin writes and malformed login', async () => {
  const pool = { execute: async () => { throw new Error('DB must not be touched'); } };
  const app = createApp(pool);
  await request(app).get('/api/infantes').expect(401);
  await request(app).post('/api/infantes').set('Origin', 'https://other.invalid').send({}).expect(403);
  await request(app).post('/api/auth/login').set('Origin', 'http://localhost:5173').send({ username: 'invalid' }).expect(400);
});
