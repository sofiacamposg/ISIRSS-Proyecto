# Revisión técnica y primera entrega

Fecha: 28 de septiembre de 2026. Fuentes: SRS.md, README.md, Deliverable1.md, PDF institucional, padronmysql (Original).sql y padronmysql (Propuesta1).sql. El cronograma binario Project1.mpp no se ha interpretado; no se han validado sus fechas, dependencias ni asignaciones.

## Hallazgos de los documentos

| Tema | Evidencia | Tratamiento en esta entrega |
|---|---|---|
| Producto desde cero | El SRS dice ampliar; el PDF dice creación y menciona avances, pero el repo no entrega módulos ejecutables | Nueva base de aplicación; proponer corregir propósito, alcance y objetivo del SRS, confirmar reutilización con ISSSTE |
| Matrícula | PDF pide generación propia; origen tiene entero con valor 0 y sin UNIQUE; propuesta usa texto único | Generación DEV aleatoria de 28 caracteres; formato institucional pendiente; no sustituir matrículas de origen sin conciliación |
| Tutores | PDF y notas indican un individuo, RF32 permite uno o más | Backend soporta asociaciones explícitas; seed con un solo infante; confirmar cardinalidad final |
| Regionalización | Origen trae ur y ebdi, sin catálogos; PDF pide Norte/Sur/Este/Oeste | No inferir regiones de ur ni criterios clínicos geográficos; catálogos de seed ficticios |
| Tablas clínicas | PDF cita CDC; SRS requiere tablas/fórmulas autorizadas y versiones | Sin categorías automáticas ni curvas clínicas inventadas; IMC solo numérico |
| RF15 | Menciona peso de progenitores aunque RF06 solo pide estaturas | Corregir/validar requisito con personal clínico antes de programarlo |
| Coordinador | Permiso de modificación pendiente en SRS | Solo consulta |
| Periodicidad | 45 días sin definición completa de extraordinarias y primera captura | Captura de eventos habilitada; automatización de alertas pendiente, sin asignar reglas supuestas |
| Accesibilidad y RNF | Tiempos, carga, disponibilidad y nivel de accesibilidad por definir | Formularios etiquetados y diseño adaptable; no se afirma cumplimiento certificado |
| Historial | Propuesta exige versiones y bitácora, que el DDL no genera por sí mismo | Alta/corrección en transacción, bloqueo de filas y versiones append-only; acceso SQL restringido |

## Original frente a propuesta

El origen es un dump de estructura de **una tabla `padron`, 117 columnas, 72 mensuales**, sin INSERT de datos. Su servidor declarado es **MariaDB 10.4.32**; MySQL 8.0.45 corresponde a la herramienta exportadora. Contiene DROP TABLE, latin1 y matrícula/CURP sin unicidad. El AUTO_INCREMENT=199409 no demuestra cantidad de registros ni entrega datos personales.

No contiene usuarios, roles, regiones, catálogos completos, tutores, ni una tabla de eventos antropométricos. `RegPesoTalla` es int y no permite reconstruir peso/talla; no debe confundirse con datos de medición. `usuario` es texto histórico, no una cuenta verificable del nuevo sistema.

La propuesta normaliza eventos mensuales, estancias, ámbitos, contactos y versiones de medición. Es apta como base de desarrollo, no como migración ejecutable del legado. Los campos originales pendientes permanecen documentados en el inventario; no se descarta ni transforma ningún dato del origen. No se añade almacenamiento JSON con semántica inventada para ocultar huecos de requisitos.

## Ruta de migración pendiente

1. Obtener diccionario, catálogos, versión autorizada del gestor y reglas de los campos ambiguos.
2. Conservar copia inmutable del origen, permisos restringidos y huella del archivo. Nunca ejecutar DROP del dump sobre una base activa.
3. Preparar staging aislado conservando todas las columnas y la codificación de origen; inventario disponible en Mapeo-padron-original.md.
4. Perfilar duplicados/ceros de matrícula, CURP vacíos, fechas cero, valores inválidos, huérfanos y conflictos activo/baja. El dump actual no tiene filas, por lo que estos son riesgos por comprobar, no anomalías observadas.
5. Aprobar transformaciones de catálogos y códigos mensuales; registrar rechazos para conciliación. No inferir fnac/freg, genero ni movimientos sin su diccionario.
6. Migrar con trazabilidad id_infante_origen y conservar matrículas anteriores; validar conteos, totales por EBDI y muestras con ISSSTE.

## Alcance implementado

| Bloque | Estado |
|---|---|
| A09-A10 estructura/entorno | Workspaces npm, frontend/API, init/seed y CI |
| RF01-02 | Alta y búsqueda, contacto tutor, matrícula DEV; sin alta de cuenta tutor |
| RF06 | Captura inicial de estaturas opcionales; UI posterior pendiente |
| RF08-14 | Captura/historial, edad en días, IMC numérico; validación técnica, no rangos clínicos aprobados |
| RF32-35 | Lectura de asociaciones ya autorizadas; no UI administrativa de vínculos |
| RF37-38 | Ámbitos y auditoría aplicados a operaciones entregadas |
| RF39 | Administrador inserta nueva versión y motivo; versiones anteriores en DB, sin pantalla de auditoría aún |
| RF03-05, RF07, RF15-31, RF36, RF40 | Pendientes total o parcialmente; no presentarlos como entregados |

Los límites numéricos reflejan precisión/capacidad SQL, **no rangos clínicamente válidos**. Catálogo de sexo provisional (`femenino`, `masculino`, `no_especificado`), pendiente de acuerdo antes de migrar o calcular indicadores. Perímetro cefálico y apellidos opcionales siguen la propuesta, sujetos a confirmación.

## Arquitectura y fuentes técnicas

React Admin se conecta a un dataProvider REST y authProvider. La API Express es la autoridad para permisos, ámbitos, validación y transacciones; MySQL conserva estado. Sesiones aleatorias de 256 bits, hash en DB, cookie HttpOnly/SameSite, expiración de 8 horas, comprobación de cuenta activa por petición, Origin obligatorio en escrituras. Contraseñas con scrypt/sal individual. No se almacenan tokens ni contraseñas en localStorage/bitácora.

- React Admin: https://marmelab.com/react-admin/DataFetchingGuide.html
- Express: https://expressjs.com/en/guide/error-handling/

Decisiones de infraestructura aún abiertas: un origen HTTPS, servicio de identidad institucional si aplica, rotación/retención, monitoreo, recuperación y backups. El limitador de login de esta entrega es local al proceso; un despliegue distribuido requiere almacenamiento compartido y configuración confiable del proxy.

MySQL 8.4 requiere SELECT más LOCK TABLES (o UPDATE/DELETE) para SELECT ... FOR UPDATE. El inicializador concede LOCK TABLES sobre la base para bloquear durante capturas/correcciones sin habilitar actualización o borrado de históricos. Fuente: https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html
