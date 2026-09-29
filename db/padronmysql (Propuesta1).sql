-- ISSSTE: modelo propuesto v1, basado en SRS.md y padronmysql.sql.
-- Destino: MySQL >= 8.0.16 (CHECK aplicado). No validado en MariaDB.
-- EJECUTAR UNA VEZ en desarrollo. Crea una base NUEVA; no altera la original.
-- Si la base ya existe, detenerse y revisar: no continuar ignorando errores.
-- No es una migracion de datos ni una implementacion completa del backend.
-- Sin datos reales, cuentas por defecto, formulas clinicas ni rangos inventados.
-- Referencia tecnica: https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html

CREATE DATABASE issste_padron CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE issste_padron;

-- GEOGRAFIA (RF28-31): region se obtiene a traves del estado, sin duplicarla.
-- NOMBRE DE LA TABLA: regiones
-- Cómo funciona:
-- Guarda las regiones autorizadas por el ISSSTE. Cada fila representa una región; los estados se
-- relacionan con ella mediante id_region.
CREATE TABLE regiones (
 id_region INT PRIMARY KEY AUTO_INCREMENT,
 nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: estados
-- Cómo funciona:
-- Guarda los estados y la región a la que pertenece cada uno. Un estado pertenece a una región y
-- puede tener varias EBDI.
CREATE TABLE estados (
 id_estado INT PRIMARY KEY AUTO_INCREMENT,
 nombre VARCHAR(100) NOT NULL UNIQUE,
 id_region INT NOT NULL,
 FOREIGN KEY (id_region) REFERENCES regiones(id_region)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: ebdi
-- Cómo funciona:
-- Guarda las estancias infantiles, su clave, nombre y estado. Su región se obtiene consultando el
-- estado relacionado. activa permite indicar si la estancia sigue operando.
CREATE TABLE ebdi (
 id_ebdi INT PRIMARY KEY AUTO_INCREMENT,
 clave VARCHAR(20) NOT NULL UNIQUE,
 nombre VARCHAR(150) NOT NULL,
 id_estado INT NOT NULL,
 activa BOOLEAN NOT NULL DEFAULT TRUE,
 FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
) ENGINE=InnoDB;

-- ACCESO (RF32-38): el backend debe aplicar permisos Y ambito en cada solicitud.
-- NOMBRE DE LA TABLA: roles
-- Cómo funciona:
-- Define los perfiles de usuario: administrador, estancia, coordinador regional y tutor. Los
-- permisos de cada perfil se asignan en rol_permiso.
CREATE TABLE roles (
 id_rol INT PRIMARY KEY AUTO_INCREMENT,
 nombre VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;
INSERT INTO roles(nombre) VALUES ('administrador'),('estancia'),('coordinador_regional'),('tutor');
-- NOMBRE DE LA TABLA: permisos
-- Cómo funciona:
-- Es el catálogo de acciones que puede autorizar el sistema, por ejemplo consultar infantes o
-- registrar mediciones. Cada acción tiene un código único; el catálogo aún debe completarse.
CREATE TABLE permisos (
 id_permiso INT PRIMARY KEY AUTO_INCREMENT,
 codigo VARCHAR(100) NOT NULL UNIQUE,
 descripcion VARCHAR(255) NOT NULL
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: rol_permiso
-- Cómo funciona:
-- Relaciona roles con permisos. Cada fila concede un permiso a un rol; un rol puede tener varios
-- permisos y un permiso puede pertenecer a varios roles. La clave compuesta impide repetir la
-- misma asignación.
CREATE TABLE rol_permiso (
 id_rol INT NOT NULL,
 id_permiso INT NOT NULL,
 PRIMARY KEY(id_rol,id_permiso),
 FOREIGN KEY(id_rol) REFERENCES roles(id_rol),
 FOREIGN KEY(id_permiso) REFERENCES permisos(id_permiso)
) ENGINE=InnoDB;
-- Propuesta: un rol por cuenta; catalogo de permisos pendiente de acordar.
-- NOMBRE DE LA TABLA: usuarios
-- Cómo funciona:
-- Guarda las cuentas que inician sesión, con correo único, hash de contraseña, rol y estado.
-- password_hash almacena el resultado del algoritmo de protección de contraseñas, nunca la
-- contraseña original. En este modelo cada cuenta tiene un rol.
CREATE TABLE usuarios (
 id_usuario BIGINT PRIMARY KEY AUTO_INCREMENT,
 nombre VARCHAR(150) NOT NULL,
 correo VARCHAR(254) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 id_rol INT NOT NULL,
 estado ENUM('activo','bloqueado','baja') NOT NULL DEFAULT 'activo',
 creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: usuario_ambito
-- Cómo funciona:
-- Indica sobre qué región, estado o EBDI puede operar un usuario. Cada fila señala exactamente uno
-- de esos ámbitos; un usuario puede tener varias filas. El backend debe combinar este alcance con
-- los permisos de su rol para autorizar cada operación.
CREATE TABLE usuario_ambito (
 id_ambito BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_usuario BIGINT NOT NULL,
 id_region INT NULL,
 id_estado INT NULL,
 id_ebdi INT NULL,
 CHECK ((id_region IS NOT NULL)+(id_estado IS NOT NULL)+(id_ebdi IS NOT NULL)=1),
 UNIQUE(id_usuario,id_region),
 UNIQUE(id_usuario,id_estado),
 UNIQUE(id_usuario,id_ebdi),
 FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario),
 FOREIGN KEY(id_region) REFERENCES regiones(id_region),
 FOREIGN KEY(id_estado) REFERENCES estados(id_estado),
 FOREIGN KEY(id_ebdi) REFERENCES ebdi(id_ebdi)
) ENGINE=InnoDB;
-- Administrador: acceso global segun rol. Tutor: exclusivamente asociaciones.
-- Estancia: solo ambito EBDI; coordinador: region (solo consulta provisional).
-- Esas correspondencias deben validarse en backend; no las impone esta tabla.

-- PADRON (RF01-06). Matricula es identificador textual, NO contrasena.
-- NOMBRE DE LA TABLA: infantes
-- Cómo funciona:
-- Es el padrón principal: una fila por infante, con matrícula única, datos personales y EBDI
-- actual. id_infante relaciona al niño con mediciones, tutores y seguimientos; id_infante_origen
-- permite identificar su registro en el sistema anterior.
CREATE TABLE infantes (
 id_infante BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante_origen INT NULL UNIQUE,
 matricula VARCHAR(30) NOT NULL UNIQUE,
 nombre VARCHAR(100) NOT NULL,
 apellido_paterno VARCHAR(100) NULL,
 apellido_materno VARCHAR(100) NULL,
 curp VARCHAR(18) NULL UNIQUE,
 fecha_nacimiento DATE NOT NULL,
 sexo_patron VARCHAR(20) NOT NULL COMMENT 'Catalogo institucional pendiente; no inferir desde genero',
 fecha_ingreso DATE NOT NULL,
 id_ebdi INT NOT NULL,
 activo BOOLEAN NOT NULL DEFAULT TRUE,
 restricciones_nutricionales TEXT NULL,
 creado_por BIGINT NOT NULL,
 creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(fecha_ingreso >= fecha_nacimiento),
 FOREIGN KEY(id_ebdi) REFERENCES ebdi(id_ebdi),
 FOREIGN KEY(creado_por) REFERENCES usuarios(id_usuario),
 INDEX ix_infantes_ebdi_activo(id_ebdi,activo),
 INDEX ix_infantes_nombre(apellido_paterno,apellido_materno,nombre)
) ENGINE=InnoDB;
-- Tutor y progenitor biologico no son equivalentes. Una cuenta puede faltar.
-- NOMBRE DE LA TABLA: tutores
-- Cómo funciona:
-- Guarda los datos de contacto de padres, madres o tutores. id_usuario es opcional: una persona
-- puede estar registrada como contacto sin tener cuenta de acceso. Los infantes asociados se
-- indican en infante_tutor.
CREATE TABLE tutores (
 id_tutor BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_usuario BIGINT NULL UNIQUE,
 nombre VARCHAR(150) NOT NULL,
 telefono VARCHAR(30) NULL,
 correo VARCHAR(254) NULL,
 FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: infante_tutor
-- Cómo funciona:
-- Relaciona infantes con tutores y guarda el parentesco. Permite varios tutores por niño y varios
-- niños por tutor. acceso_autorizado indica si se autorizó consultar ese expediente, junto con
-- quién y cuándo lo autorizó; el backend debe comprobar esta asociación.
CREATE TABLE infante_tutor (
 id_infante BIGINT NOT NULL,
 id_tutor BIGINT NOT NULL,
 parentesco VARCHAR(50) NOT NULL,
 acceso_autorizado BOOLEAN NOT NULL DEFAULT FALSE,
 autorizado_por BIGINT NULL,
 autorizado_en DATETIME NULL,
 PRIMARY KEY(id_infante,id_tutor),
 CHECK(acceso_autorizado=FALSE OR (autorizado_por IS NOT NULL AND autorizado_en IS NOT NULL)),
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(id_tutor) REFERENCES tutores(id_tutor),
 FOREIGN KEY(autorizado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: antecedentes_parentales
-- Cómo funciona:
-- Guarda las estaturas de la madre y del padre de un infante en centímetros con un decimal, además
-- del usuario y fecha de captura. Una corrección debe agregarse como una nueva fila para conservar
-- los datos anteriores. No presupone que el tutor sea el progenitor biológico.
CREATE TABLE antecedentes_parentales (
 id_antecedente BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante BIGINT NOT NULL,
 estatura_madre_cm DECIMAL(4,1) NULL,
 estatura_padre_cm DECIMAL(4,1) NULL,
 registrado_por BIGINT NOT NULL,
 registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(estatura_madre_cm IS NULL OR estatura_madre_cm>0),
 CHECK(estatura_padre_cm IS NULL OR estatura_padre_cm>0),
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(registrado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- Antecedentes se agregan por version; no sustituir historia previa.
-- NOMBRE DE LA TABLA: movimientos_padron
-- Cómo funciona:
-- Conserva los eventos administrativos de cada infante: alta, transferencia, baja o reactivación.
-- Una transferencia registra EBDI de origen y destino. El backend debe guardar el movimiento y
-- actualizar la EBDI actual del infante en una misma transacción.
CREATE TABLE movimientos_padron (
 id_movimiento BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante BIGINT NOT NULL,
 tipo ENUM('alta','transferencia','baja','reactivacion','otro') NOT NULL,
 fecha DATE NOT NULL,
 id_ebdi_origen INT NULL,
 id_ebdi_destino INT NULL,
 motivo TEXT NOT NULL,
 registrado_por BIGINT NOT NULL,
 CHECK(tipo<>'transferencia' OR (id_ebdi_origen IS NOT NULL AND id_ebdi_destino IS NOT NULL AND id_ebdi_origen<>id_ebdi_destino)),
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(id_ebdi_origen) REFERENCES ebdi(id_ebdi),
 FOREIGN KEY(id_ebdi_destino) REFERENCES ebdi(id_ebdi),
 FOREIGN KEY(registrado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- RF05: evidencia de revision mensual de una estancia.
-- NOMBRE DE LA TABLA: revisiones_padron
-- Cómo funciona:
-- Registra que una EBDI revisó su padrón en determinado mes, quién lo revisó y sus observaciones.
-- Solo permite una revisión por EBDI y periodo; el periodo se representa con el primer día del
-- mes.
CREATE TABLE revisiones_padron (
 id_revision BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_ebdi INT NOT NULL,
 periodo DATE NOT NULL COMMENT 'Primer dia del mes',
 revisado_por BIGINT NOT NULL,
 revisado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 observaciones TEXT NULL,
 UNIQUE(id_ebdi,periodo),
 CHECK(DAYOFMONTH(periodo)=1),
 FOREIGN KEY(id_ebdi) REFERENCES ebdi(id_ebdi),
 FOREIGN KEY(revisado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- Sustituto propuesto de columnas inscIni...; significado de codigo pendiente.
-- NOMBRE DE LA TABLA: inscripciones_mensuales
-- Cómo funciona:
-- Guarda una fila por infante y mes con su EBDI y código institucional. Sustituye las columnas
-- mensuales del archivo original, de modo que un nuevo mes se agrega como fila. El significado de
-- los códigos debe confirmarse antes de migrar los datos.
CREATE TABLE inscripciones_mensuales (
 id_infante BIGINT NOT NULL,
 periodo DATE NOT NULL,
 id_ebdi INT NOT NULL,
 codigo_institucional VARCHAR(30) NOT NULL,
 PRIMARY KEY(id_infante,periodo),
 CHECK(DAYOFMONTH(periodo)=1),
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(id_ebdi) REFERENCES ebdi(id_ebdi)
) ENGINE=InnoDB;

-- MEDICIONES (RF08-14,39). Evento estable + versiones inmutables.
-- NOMBRE DE LA TABLA: mediciones
-- Cómo funciona:
-- Identifica cada evento de medición y lo relaciona con el infante, la EBDI de captura y el
-- usuario que lo creó. El peso, la talla y los demás valores se guardan en medicion_versiones. Una
-- nueva visita genera otra medición; una corrección genera otra versión de la misma medición.
CREATE TABLE mediciones (
 id_medicion BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante BIGINT NOT NULL,
 id_ebdi_captura INT NOT NULL,
 creado_por BIGINT NOT NULL,
 creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(id_ebdi_captura) REFERENCES ebdi(id_ebdi),
 FOREIGN KEY(creado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: medicion_versiones
-- Cómo funciona:
-- Guarda los valores de cada versión de una medición: fecha, peso, talla, perímetro cefálico y
-- observaciones. Conserva la fecha de nacimiento y el sexo usados, y calcula edad_dias a partir de
-- esas fechas. La primera captura usa versión 1; una corrección debe insertar la siguiente versión
-- con su motivo, sin borrar la anterior. El backend debe controlar esa secuencia.
CREATE TABLE medicion_versiones (
 id_version BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_medicion BIGINT NOT NULL,
 numero_version INT NOT NULL,
 fecha_medicion DATE NOT NULL,
 fecha_nacimiento_utilizada DATE NOT NULL,
 sexo_patron_utilizado VARCHAR(20) NOT NULL,
 edad_dias INT GENERATED ALWAYS AS (DATEDIFF(fecha_medicion,fecha_nacimiento_utilizada)) STORED,
 peso_kg DECIMAL(6,3) NOT NULL,
 talla_cm DECIMAL(5,2) NOT NULL,
 tipo_talla ENUM('longitud_acostado','talla_de_pie') NOT NULL,
 perimetro_cefalico_cm DECIMAL(5,2) NULL,
 tipo ENUM('periodica','extraordinaria') NOT NULL,
 motivo_extraordinaria TEXT NULL,
 observaciones TEXT NULL,
 estado_nutricional_registrado VARCHAR(100) NULL COMMENT 'Captura profesional; no diagnostico automatico',
 motivo_correccion TEXT NULL,
 registrado_por BIGINT NOT NULL,
 registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(id_medicion,numero_version),
 CHECK(numero_version>=1),
 CHECK(fecha_medicion>=fecha_nacimiento_utilizada),
 CHECK(peso_kg>0 AND talla_cm>0),
 CHECK(perimetro_cefalico_cm IS NULL OR perimetro_cefalico_cm>0),
 CHECK(tipo<>'extraordinaria' OR motivo_extraordinaria IS NOT NULL),
 CHECK(numero_version=1 OR motivo_correccion IS NOT NULL),
 FOREIGN KEY(id_medicion) REFERENCES mediciones(id_medicion),
 FOREIGN KEY(registrado_por) REFERENCES usuarios(id_usuario),
 INDEX ix_medicion_fecha(fecha_medicion)
) ENGINE=InnoDB;
-- IMC, clasificaciones y talla diana se guardan como evaluaciones versionadas.
-- No se impone UNIQUE(infante,fecha): se permiten eventos adicionales ese dia.
-- NOMBRE DE LA VISTA: mediciones_vigentes
-- Cómo funciona:
-- Es una consulta guardada que muestra solo la versión con el número más alto de cada
-- medición, junto con su infante y EBDI de captura. No crea otra tabla ni duplica datos.
CREATE VIEW mediciones_vigentes AS
 SELECT m.id_infante,m.id_ebdi_captura,v.*
 FROM mediciones m JOIN medicion_versiones v ON v.id_medicion=m.id_medicion
 WHERE NOT EXISTS (SELECT 1 FROM medicion_versiones posterior
   WHERE posterior.id_medicion=v.id_medicion AND posterior.numero_version>v.numero_version);

-- REFERENCIAS Y EVALUACIONES (RF07,14-20). Sin formulas ni tablas de ejemplo.
-- NOMBRE DE LA TABLA: referencias_clinicas
-- Cómo funciona:
-- Guarda la fuente, versión y contenido de las tablas o fórmulas de referencia para cada
-- indicador. Distingue borradores, referencias autorizadas y retiradas. El backend debe usar solo
-- referencias autorizadas y crear una nueva versión cuando cambie su contenido; aquí no se
-- incluyen fórmulas clínicas.
CREATE TABLE referencias_clinicas (
 id_referencia BIGINT PRIMARY KEY AUTO_INCREMENT,
 nombre VARCHAR(150) NOT NULL,
 version VARCHAR(50) NOT NULL,
 fuente TEXT NOT NULL,
 indicador VARCHAR(50) NOT NULL,
 contenido JSON NOT NULL COMMENT 'Especificacion/tablas; estructura a definir con personal medico',
 sha256 CHAR(64) NOT NULL COMMENT 'Hash del contenido canonico, calculado por backend',
 estado ENUM('borrador','autorizada','retirada') NOT NULL DEFAULT 'borrador',
 autorizado_por_institucion VARCHAR(150) NULL,
 autorizado_en DATETIME NULL,
 UNIQUE(nombre,version,indicador),
 CHECK(estado<>'autorizada' OR (autorizado_por_institucion IS NOT NULL AND autorizado_en IS NOT NULL))
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: referencia_region
-- Cómo funciona:
-- Asocia una referencia clínica con una región y un intervalo de vigencia. Una referencia puede
-- utilizarse en varias regiones. El backend debe comprobar qué referencia corresponde a la fecha y
-- al indicador evaluado; la aplicación regional está pendiente de validación institucional.
CREATE TABLE referencia_region (
 id_referencia BIGINT NOT NULL,
 id_region INT NOT NULL,
 vigente_desde DATE NOT NULL,
 vigente_hasta DATE NULL,
 PRIMARY KEY(id_referencia,id_region,vigente_desde),
 CHECK(vigente_hasta IS NULL OR vigente_hasta>=vigente_desde),
 FOREIGN KEY(id_referencia) REFERENCES referencias_clinicas(id_referencia),
 FOREIGN KEY(id_region) REFERENCES regiones(id_region)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: evaluaciones
-- Cómo funciona:
-- Guarda el resultado de aplicar una referencia clínica a una versión concreta de una medición.
-- Conserva valor, unidad, categoría, detalles del cálculo y, cuando corresponde, antecedentes
-- parentales y región utilizada. Una medición puede tener varias evaluaciones; guardar una fila no
-- ejecuta por sí mismo ningún cálculo.
CREATE TABLE evaluaciones (
 id_evaluacion BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_version_medicion BIGINT NOT NULL,
 id_referencia BIGINT NOT NULL,
 id_antecedente BIGINT NULL,
 id_region_aplicada INT NULL,
 valor DECIMAL(14,6) NULL,
 unidad VARCHAR(30) NULL,
 categoria VARCHAR(100) NULL,
 detalle JSON NOT NULL COMMENT 'Entradas y resultados, version del algoritmo y criterios utilizados',
 evaluado_por BIGINT NOT NULL,
 evaluado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(id_version_medicion) REFERENCES medicion_versiones(id_version),
 FOREIGN KEY(id_referencia) REFERENCES referencias_clinicas(id_referencia),
 FOREIGN KEY(id_antecedente) REFERENCES antecedentes_parentales(id_antecedente),
 FOREIGN KEY(id_region_aplicada) REFERENCES regiones(id_region),
 FOREIGN KEY(evaluado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- HISTORIA Y SEGUIMIENTO (RF21-27). Historia clinica detallada aun pendiente.
-- NOMBRE DE LA TABLA: condiciones_salud
-- Cómo funciona:
-- Registra condiciones de salud capturadas por un usuario autorizado para un infante, junto con la
-- fecha y descripción. Un infante puede tener varias condiciones registradas. Estas pueden
-- vincularse con casos de seguimiento; no son diagnósticos generados automáticamente.
CREATE TABLE condiciones_salud (
 id_condicion BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante BIGINT NOT NULL,
 descripcion TEXT NOT NULL,
 fecha_registro DATE NOT NULL,
 registrado_por BIGINT NOT NULL,
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(registrado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: seguimientos
-- Cómo funciona:
-- Representa cada caso de seguimiento de un infante, con motivo, estado y fechas de apertura y
-- cierre. Puede asociarse con una condición de salud. Un infante puede tener varios casos; se
-- considera sin seguimiento activo cuando no tiene casos abiertos.
CREATE TABLE seguimientos (
 id_seguimiento BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante BIGINT NOT NULL,
 id_condicion BIGINT NULL,
 motivo TEXT NOT NULL,
 estado ENUM('requiere_seguimiento','en_seguimiento','concluido') NOT NULL,
 fecha_apertura DATE NOT NULL,
 fecha_cierre DATE NULL,
 creado_por BIGINT NOT NULL,
 CHECK((estado='concluido' AND fecha_cierre IS NOT NULL) OR (estado<>'concluido' AND fecha_cierre IS NULL)),
 CHECK(fecha_cierre IS NULL OR fecha_cierre>=fecha_apertura),
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(id_condicion) REFERENCES condiciones_salud(id_condicion),
 FOREIGN KEY(creado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- Sin seguimiento = sin casos abiertos. No duplicar un booleano en infantes.
-- NOMBRE DE LA TABLA: acciones_seguimiento
-- Cómo funciona:
-- Guarda las actuaciones y observaciones realizadas dentro de un caso de seguimiento. Cada fila
-- identifica la fecha, el responsable y el usuario que capturó la información. El responsable
-- puede ser alguien externo sin cuenta; un caso puede contener muchas acciones.
CREATE TABLE acciones_seguimiento (
 id_accion BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_seguimiento BIGINT NOT NULL,
 fecha DATETIME NOT NULL,
 observaciones TEXT NULL,
 acciones_realizadas TEXT NOT NULL,
 responsable_nombre VARCHAR(150) NOT NULL,
 responsable_usuario BIGINT NULL COMMENT 'Puede ser profesional externo; confirmar con ISSSTE',
 registrado_por BIGINT NOT NULL,
 FOREIGN KEY(id_seguimiento) REFERENCES seguimientos(id_seguimiento),
 FOREIGN KEY(responsable_usuario) REFERENCES usuarios(id_usuario),
 FOREIGN KEY(registrado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: alertas
-- Cómo funciona:
-- Guarda avisos internos por indicadores o mediciones pendientes y su estado de atención. Las
-- alertas por indicador se vinculan con una evaluación. El backend o una tarea programada debe
-- generarlas y evitar duplicados; esta tabla no detecta automáticamente el paso de 45 días.
CREATE TABLE alertas (
 id_alerta BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante BIGINT NOT NULL,
 id_evaluacion BIGINT NULL,
 tipo ENUM('indicador','medicion_pendiente') NOT NULL,
 mensaje TEXT NOT NULL,
 estado ENUM('pendiente','atendida','descartada') NOT NULL DEFAULT 'pendiente',
 creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atendida_por BIGINT NULL,
 atendida_en DATETIME NULL,
 CHECK(tipo<>'indicador' OR id_evaluacion IS NOT NULL),
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(id_evaluacion) REFERENCES evaluaciones(id_evaluacion),
 FOREIGN KEY(atendida_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;
-- NOMBRE DE LA TABLA: avisos_tutores
-- Cómo funciona:
-- Guarda mensajes publicados para los tutores de un infante, con autor y fecha. El portal debe
-- mostrarlos únicamente a las cuentas de tutores autorizados para ese niño mediante infante_tutor.
CREATE TABLE avisos_tutores (
 id_aviso BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_infante BIGINT NOT NULL,
 mensaje TEXT NOT NULL,
 publicado_por BIGINT NOT NULL,
 publicado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(id_infante) REFERENCES infantes(id_infante),
 FOREIGN KEY(publicado_por) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- AUDITORIA (RF38, RNF05). La tabla sola NO registra acciones automaticamente.
-- NOMBRE DE LA TABLA: bitacora
-- Cómo funciona:
-- Conserva quién realizó una acción, cuándo, sobre qué registro y, cuando corresponde, los valores
-- anteriores y nuevos. El backend debe insertar los eventos y evitar modificaciones o borrados de
-- este historial. No se llena automáticamente y no debe contener contraseñas, sus hashes ni
-- tokens.
CREATE TABLE bitacora (
 id_evento BIGINT PRIMARY KEY AUTO_INCREMENT,
 id_usuario BIGINT NULL COMMENT 'NULL solo para eventos de sistema o acceso no autenticado',
 fecha_hora DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 accion VARCHAR(100) NOT NULL,
 entidad VARCHAR(100) NOT NULL,
 id_registro VARCHAR(100) NULL,
 valor_anterior JSON NULL,
 valor_nuevo JSON NULL,
 motivo TEXT NULL,
 FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario),
 INDEX ix_bitacora_registro(entidad,id_registro),
 INDEX ix_bitacora_fecha(fecha_hora)
) ENGINE=InnoDB;

-- REGLAS DE IMPLEMENTACION OBLIGATORIAS (no resueltas solo por el esquema):
-- 1. Cada escritura y su bitacora en UNA transaccion. Nunca guardar passwords,
--    hashes de passwords ni tokens en bitacora. Registrar tambien consultas.
-- 2. Cuenta de aplicacion sin UPDATE/DELETE sobre medicion_versiones,
--    antecedentes_parentales, evaluaciones y bitacora. Correccion: INSERT.
--    Asignar numero_version con bloqueo de fila de mediciones en transaccion.
--    Referencias autorizadas inmutables: nuevos contenidos => nueva version.
-- 3. Verificar mismo infante al asociar antecedentes/evaluacion/condicion/alerta;
--    verificar ambito, rol, identidad del actor y referencias autorizadas.
-- 4. Transferencia: registrar movimiento y actualizar id_ebdi atomicamente.
--    Medicion conserva EBDI de captura. Definir acceso historico tras traslado.
-- 5. Validar fechas no futuras, cadenas no vacias, codigos autorizados y rangos
--    clinicos por edad/sexo. CHECK >0 es solo validacion tecnica minima.
-- 6. Alertas >45 dias: tarea programada idempotente; consultar versiones vigentes.
--    Confirmar si extraordinarias reinician plazo y que fecha usar sin mediciones.
-- 7. Graficas/reportes se consultan; no requieren tablas duplicadas. Portal tutor
--    expone exclusivamente campos autorizados, nunca todo el expediente.
-- 8. Respaldo, restauracion, HTTPS y autenticacion se implementan fuera del DDL.
-- 9. Propuesta nullable de perimetro cefalico y apellidos: confirmar obligatoriedad.
-- 10. Talla diana se evalua con una medicion y antecedentes versionados en v1;
--     confirmar si se requiere evaluarla independientemente de una medicion.

-- MAPEO Y MIGRACION PENDIENTE (no desechar columnas del archivo institucional):
-- id_infante -> infantes.id_infante_origen; matricula -> texto UNIQUE.
-- nombre/paterno/materno -> nombre/apellido_paterno/apellido_materno.
-- fnac -> fecha_nacimiento; freg -> fecha_ingreso SOLO si ISSSTE lo confirma.
-- ebdi -> catalogo ebdi.clave (resolver FK); genero -> sexo_patron con mapeo aprobado.
-- curp -> NULL si vacio; revisar duplicados antes de aplicar UNIQUE.
-- inscIni... -> inscripciones_mensuales SOLO tras confirmar significado/codigos.
-- ur, estrato, id_benef_infante, estatus_servicio, discapacidad/grupoDisc,
-- diferencias dif_*, idAnt/idPos, movimientos, inscripcionInicial, usuario,
-- RegPesoTalla y otros campos: conservar en origen y pedir diccionario completo.
-- No inferir que ur es region ni que RegPesoTalla contiene una medicion.
-- Antes de migrar: revisar matriculas 0/duplicadas, fechas cero, codificacion latin1,
-- catalogos faltantes y semantica de bajas/activo. No existe INSERT en el dump dado.
-- RF15 menciona peso parental no solicitado en RF06: pendiente de correccion del SRS.
-- Parametros por geografia y formulas: requieren aprobacion clinica; no programar
-- criterios a partir de supuestos. JSON clinico es extension provisional, no motor.
-- Cobertura: RF01-40 tienen soporte estructural o reglas arriba; accesibilidad,
-- rendimiento, disponibilidad y permisos requieren implementacion y pruebas.
