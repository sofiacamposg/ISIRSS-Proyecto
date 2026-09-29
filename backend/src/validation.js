import { z } from 'zod';
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const idSchema = z.coerce.string().regex(/^[1-9]\d{0,17}$/, 'Identificador inválido');
const text = max => z.string().trim().min(1, 'Campo obligatorio').max(max);
const optionalText = max => z.preprocess(v => v === '' || v === undefined ? null : v, text(max).nullable());
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v && v <= today(), 'Fecha inválida o futura');
const decimal = (max, precision) => z.number().finite().positive().max(max).refine(v => Math.abs(v * 10 ** precision - Math.round(v * 10 ** precision)) < 1e-7, `Máximo ${precision} decimales`);
export const childSchema = z.object({
  nombre: text(100), apellido_paterno: optionalText(100), apellido_materno: optionalText(100),
  fecha_nacimiento: date, fecha_ingreso: date, sexo_patron: z.enum(['femenino', 'masculino', 'no_especificado']),
  id_ebdi: idSchema, restricciones_nutricionales: optionalText(4000),
  tutor_nombre: text(150), tutor_parentesco: text(50), tutor_telefono: optionalText(30),
  tutor_correo: z.preprocess(v => v === '' || v === undefined ? null : v, z.email().max(254).nullable()),
  estatura_madre_cm: decimal(999.9, 1).nullish(), estatura_padre_cm: decimal(999.9, 1).nullish(),
}).strict().refine(v => v.fecha_ingreso >= v.fecha_nacimiento, { message: 'El ingreso no puede ser anterior al nacimiento.', path: ['fecha_ingreso'] });
export const measurementSchema = z.object({
  id_infante: idSchema, fecha_medicion: date, peso_kg: decimal(999.999, 3), talla_cm: decimal(999.99, 2),
  perimetro_cefalico_cm: decimal(999.99, 2).nullish(),
  tipo_talla: z.enum(['longitud_acostado', 'talla_de_pie']), tipo: z.enum(['periodica', 'extraordinaria']),
  motivo_extraordinaria: optionalText(4000), observaciones: optionalText(4000),
  estado_nutricional_registrado: optionalText(100), motivo_correccion: optionalText(4000),
}).strict().refine(v => v.tipo !== 'extraordinaria' || v.motivo_extraordinaria, { path: ['motivo_extraordinaria'], message: 'Indica el motivo de la medición extraordinaria.' });
export function listOptions(query) {
  const parsed = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), perPage: z.coerce.number().int().min(1).max(100).default(25), sort: z.string().default('id'), order: z.enum(['ASC', 'DESC']).default('ASC'), filter: z.string().default('{}') }).parse(query);
  let filter;
  try { filter = JSON.parse(parsed.filter); } catch { throw new z.ZodError([{ code: 'custom', path: ['filter'], message: 'Filtro inválido' }]); }
  const valid = z.object({ q: z.string().max(100).optional(), id_infante: idSchema.optional(), id_ebdi: idSchema.optional(), ids: z.array(idSchema).max(100).optional() }).strict().parse(filter);
  return { ...parsed, filter: valid, offset: (parsed.page - 1) * parsed.perPage };
}
