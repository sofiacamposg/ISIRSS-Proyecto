# Crecimiento · Padrón infantil EBDI

Primera entrega de desarrollo: React + React Admin + JavaScript, API Node.js/Express y MySQL. No está lista para datos reales ni para despliegue institucional.

## Qué funciona

- Inicio/cierre de sesión con cuatro perfiles, cookie HttpOnly y sesión revocable en MySQL.
- Padrón paginado y búsqueda por nombre/matrícula; acceso filtrado en la API.
- Alta de infante con matrícula DEV automática, contacto de tutor y estaturas parentales opcionales.
- Expediente, consulta cronológica de mediciones, captura periódica/extraordinaria.
- Corrección por administrador mediante una nueva versión: no se modifica el original.
- IMC numérico sin categorías clínicas; edad en días al medir.
- Portal de tutores restringido a asociaciones autorizadas: identificación básica, medidas y avisos publicados. No recibe observaciones internas ni valoración profesional.
- Bitácora transaccional de lecturas/escrituras implementadas. Cuenta SQL sin UPDATE/DELETE sobre registros históricos.

**No implementado aún:** transferencias, edición del padrón, revisión mensual, gestión de usuarios/catálogos/asociaciones desde UI, seguimiento, emisión de avisos, alertas automáticas de 45 días, gráficas, reportes, fórmulas autorizadas, migración institucional y recuperación de contraseña. Los contactos y antecedentes se capturan, pero aún no tienen pantalla de edición/consulta específica. `permisos` y `rol_permiso` siguen como estructura futura; esta entrega usa una matriz fija de roles en servidor, no concede permisos desde el cliente.

## Ejecutar en WSL / terminal de VS Code

Requisitos: Node.js 22.12+ (probado con 24), npm y servidor **MySQL 8.4**. Workbench es el cliente, no sustituye al servidor. No se presupone compatibilidad con MariaDB.

```bash
npm ci
cp backend/.env.example backend/.env
```

Edita `backend/.env`: configura DB_ADMIN_USER/DB_ADMIN_PASSWORD para inicialización local, DB_USER/DB_PASSWORD para la cuenta de aplicación y SEED_PASSWORD con al menos 12 caracteres. Usa una **base nueva**. DB_USER también debe ser una cuenta nueva. No pegues contraseñas en Git ni las incluyas en comandos compartidos.

```bash
npm run db:init
npm run db:seed
npm run dev
```

Abre **http://localhost:5173** (usa exactamente este host; APP_ORIGIN debe coincidir). API: http://localhost:3001/api/health. El frontend conecta a `/api` mediante el proxy de Vite; nunca conecta directamente a MySQL.

Cuentas de prueba: `admin@demo.invalid`, `estancia@demo.invalid`, `regional@demo.invalid`, `tutor@demo.invalid`. Todas utilizan la contraseña que elegiste en SEED_PASSWORD. Son datos sintéticos; no representan geografía ni parámetros clínicos reales. El seed se cancela si ya hay cuentas o infantes. Tras inicializar puedes retirar las credenciales administrativas y SEED_PASSWORD del entorno usado para ejecutar la API.

`db:init` crea la base de la propuesta, añade sesiones y otorga permisos mínimos. Se detiene si la base ya existe; no es una migración incremental ni borra tablas. Si falla a mitad, revisa los objetos creados antes de repetir; no lo ejecutes sobre una base institucional. Para una base de propuesta ya creada, aplica `db/migrations/001_sesiones.sql` y configura permisos equivalentes a `backend/scripts/init-db.js` con el administrador de BD, o utiliza otro DB_NAME nuevo para probar.

No ejecutes el dump original contra una base en uso: incluye `DROP TABLE IF EXISTS padron`. El inicio de esta aplicación **no importa ni ejecuta ese dump**.

## Organización

- `frontend/src/main.jsx`: interfaces React Admin en español.
- `frontend/src/providers.js`: adaptadores de autenticación y REST.
- `backend/src/app.js`: rutas y operaciones con transacciones.
- `backend/src/security.js`: contraseñas, roles y alcance de los registros.
- `backend/src/validation.js`: validaciones técnicas de entrada.
- `db/`: originales conservados y migración aditiva de sesiones.
- `Documents/Revision-tecnica.md`: decisiones y pendientes de SRS/BD.
- `Documents/Mapeo-padron-original.md`: inventario de las 117 columnas del origen.

## Permisos de esta entrega

| Perfil | Consulta | Altas y mediciones | Correcciones |
|---|---|---|---|
| Administrador | Global | Sí | Sí, nueva versión |
| Estancia | EBDI asignadas | Solo su ámbito | No |
| Coordinador regional | Ámbitos asignados | No | No |
| Tutor | Infantes asociados y autorizados | No | No |

Las consultas de listas, IDs directos y relaciones aplican el mismo filtro de servidor. Bloquear la cuenta o quitar una asociación tiene efecto en la siguiente petición. Al trasladar un infante en una futura entrega debe acordarse la política histórica; el código actual consulta usando su EBDI actual.

## Contrato API

Listas: `GET /api/infantes?page=1&perPage=25&sort=nombre&order=ASC&filter={"q":"texto"}` devuelven `{data:[...],total:n}`. Recursos de lectura: infantes, mediciones, ebdi, avisos. `GET /api/<recurso>/<id>` devuelve `{data:{...}}`. Los IDs se entregan como cadenas. El filtro `id_infante` sirve para relaciones; `ids` para getMany (máximo 100).

Escrituras: `POST /api/infantes`, `POST /api/mediciones`, `PUT /api/mediciones/:id` (corrección completa con motivo). Solo se aceptan campos explícitos validados; rol, autor y matrícula se resuelven en servidor. No hay borrado de expedientes. Las peticiones mutantes requieren Origin igual a APP_ORIGIN además de sesión, excepto login que no requiere sesión. Errores: 400 validación, 401 sesión, 403 permiso, 404 registro inexistente/inaccesible, 409 conflicto.

## Verificar

```bash
npm test
npm run build
```

La suite de integración requiere una base desechable cuyo nombre incluya `test`, recién inicializada y con seed. Cambia DB_NAME/DB_USER a nombres nuevos en el entorno, ejecuta init y seed, luego:

```bash
RUN_DB_TESTS=1 npm test
```

La integración modifica el estado de cuentas/asociaciones de prueba. No ejecutarla en una base compartida con trabajo útil. GitHub Actions configura MySQL 8.4 desechable y ejecuta init, seed, pruebas y build. Sin RUN_DB_TESTS=1 se omite explícitamente la prueba de integración.

Antes del uso institucional faltan validación de permisos/campos del portal y parámetros clínicos, pruebas de aceptación/accesibilidad, HTTPS y proxy institucional, límites de acceso distribuidos, retención/limpieza de sesiones y bitácora, respaldos probados, recuperación de acceso y revisión de seguridad. `npm run build` genera el frontend pero no lo despliega. En producción servir frontend y `/api` bajo el mismo origen HTTPS con proxy; la API escucha en loopback y requiere APP_ORIGIN con HTTPS.
