//FUNCIONES DEL BACKEND Y API

//Definición de módulos
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require("dotenv").config();
const fs=require("fs");
const https=require("https");

//Crea el servidor de express
const app = express();
const PORT = process.env.PORT || 3000; //Puerto en el que va a escuchar

app.use(cors());

//Para formato de datos
const bodyParser=require("body-parser")

//Para hasheo y autenticación
const argon2=require("argon2");
const jwt=require("jsonwebtoken");
app.use(bodyParser.json());
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MiB en KiB
    timeCost: 3,       // 3 iteraciones
    parallelism: 1     // 1 hilo
};

//Pool para la conexión con mysql
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

//clave para firmar los tokens
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Falta configurar la variable de entorno JWT_SECRET.");
}

//-----------------------------------------------------------------------------------------------------------------------------------------
//FUNCIÓNES DE LOGS PARA BITÁCORA EN LA DB

async function registrarBitacora(req, {accion, entidad, id_registro = null, valor_anterior = null, valor_nuevo = null, motivo = null}) {
    try {
        //Obtener el usuario autenticado, si existe.
        //Obtiene el ID del usuario de forma segura. Si no hay sesión o falta el ID, asigna null.
        const idUsuario = req?.usuario?.id_usuario ?? null;

        await pool.execute(
            `INSERT INTO bitacora (
                id_usuario,
                accion,
                entidad,
                id_registro,
                valor_anterior,
                valor_nuevo,
                motivo
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                idUsuario,
                accion,
                entidad,
                id_registro === null ? null : String(id_registro),
                valor_anterior == null
                    ? null
                    : JSON.stringify(valor_anterior),
                valor_nuevo == null
                    ? null
                    : JSON.stringify(valor_nuevo),
                motivo
            ]
        );

        return true;
    } catch (error) {
        //Un error en la bitácora no debe ocultar el resultado de la operación original.
        console.error("Error al registrar en bitácora:", error);
        return false;
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------------
//FUNCIONES PARA RECURSO DE TUTORES

//Cada endpoint revisa que el usuario esté Autenticado, que la acción esté Autorizada y genera Logs de la acción.
app.get("/tutores", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia"), async (req, res) => {
    try {
        //Para ordenamiento de datos y paginación que solicite Rect-Admin
        let sortBy = req.query._sort || "id_tutor";
        const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
        const inicio = Math.max(0, Number(req.query._start) || 0);
        const fin = Number(req.query._end) || inicio + 10;
        const limite = Math.max(0, fin - inicio);

        const columnas = [
            "id",
            "id_tutor",
            "nombre_tutor",
            "telefono",
            "correo",
            "id_usuario"
        ];

        // Evitar que el nombre de la columna de ordenamiento
        // provenga de un valor no permitido.
        if (!columnas.includes(sortBy)) {
            sortBy = "id_tutor";
        }
        // Leer los filtros enviados por React-Admin.
        let filtro = {};
        if (req.query.filter) {
            filtro = typeof req.query.filter === "string"
                ? JSON.parse(req.query.filter)
                : req.query.filter;
        }
        const nombre = filtro.nombre_tutor ?? req.query["filter[nombre_tutor]"] ?? req.query.nombre_tutor;
        const telefono = filtro.telefono ?? req.query["filter[telefono]"] ?? req.query.telefono;
        const correo = filtro.correo ?? req.query["filter[correo]"] ?? req.query.correo;
        const condiciones = [];
        const parametros = [];
        if (nombre && String(nombre).trim() !== "") {
            condiciones.push("nombre LIKE ?");
            parametros.push(`%${String(nombre).trim()}%`);
        }
        if (telefono && String(telefono).trim() !== "") {
            condiciones.push("telefono LIKE ?");
            parametros.push(`%${String(telefono).trim()}%`);
        }
        if (correo && String(correo).trim() !== "") {
            condiciones.push("correo LIKE ?");
            parametros.push(`%${String(correo).trim()}%`);
        }
        const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
        const [data] = await pool.execute(
            `SELECT
                id_tutor AS id,
                id_tutor,
                nombre AS nombre_tutor,
                telefono,
                correo,
                id_usuario
             FROM tutores
             ${where}
             ORDER BY \`${sortBy === "nombre_tutor" ? "nombre" : sortBy}\` ${sortOrder}
             LIMIT ? OFFSET ?`,
            [...parametros, limite, inicio]
        );

        //Regresa cosas de paginación para React-Admin
        const [total] = await pool.execute( `SELECT COUNT(*) AS total FROM tutores ${where}`, parametros);
        res.set("Access-Control-Expose-Headers", "X-Total-Count");
        res.set("X-Total-Count", String(total[0].total));

        //Logs de la acción concretada
        await registrarBitacora(req, {accion: "READ_EXITOSO", entidad: "tutores", motivo: "Consulta de lista de tutores"});

        res.json(data);
    } catch (error) {
        //También se genera el log si falló la acción
        await registrarBitacora(req, {accion: "READ_FALLIDO", entidad: "tutores",motivo: error.message});

        console.error("Error al consultar tutores:", error);
        res.status(500).json({
            error: "Error al consultar tutores"
        });
    }
});

app.post("/tutores", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        const { nombre, telefono, correo } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: "El nombre del tutor es obligatorio"
            });
        }

        const [resultado] = await pool.execute(
            `INSERT INTO tutores (nombre, telefono, correo)
             VALUES (?, ?, ?)`,
            [
                nombre.trim(),
                telefono?.trim() || null,
                correo?.trim() || null
            ]
        );

        const [rows] = await pool.execute(
            `SELECT
                id_tutor AS id,
                id_tutor,
                nombre as nombre_tutor,
                telefono,
                correo,
                id_usuario
             FROM tutores
             WHERE id_tutor = ?`,
            [resultado.insertId]
        );

        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "tutores", id_registro: resultado.insertId, valor_nuevo: rows[0] });

        res.status(201).json(rows[0]);
    } catch (error) {
        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "tutores", valor_nuevo: req.body, motivo: error.message });
        console.error("Error al crear tutor:", error);
        res.status(500).json({ error: "Error al registrar tutor" });
    }
});

async function getOneTutor(collection, id, req, res) {
    let [data] = await pool.execute(
        `SELECT
            id_tutor AS id,
            id_tutor,
            nombre as nombre_tutor,
            telefono,
            correo,
            id_usuario
        FROM tutores

        WHERE id_tutor = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: collection, id_registro: id, motivo: "Tutor no encontrado" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: collection, id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/tutores/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia"), async (req, res) => {
    try {
        await getOneTutor("tutores", Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "tutores", id_registro: req.params.id, motivo: error.message });
        res.sendStatus(500);
        throw error;
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListInfantes(collection, req, res) {
    // Obtener infantes específicos para ReferenceField / getMany
    if (req.query.id) {
        const ids = Array.isArray(req.query.id) ? req.query.id : [req.query.id];
        const placeholders = ids.map(() => "?").join(",");
        const [data] = await pool.execute(
            `SELECT
                i.id_infante AS id,
                i.matricula,
                CONCAT_WS(' ',
                    i.nombre,
                    i.apellido_paterno,
                    i.apellido_materno
                ) AS nombre_completo
             FROM infantes i
             WHERE i.id_infante IN (${placeholders})`,
            ids
        );
        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: collection, motivo: "Consulta de infantes" });
        return res.json(data);
    }
    // Paginación
    const inicio = Math.max(0, Number(req.query._start) || 0);
    const fin = Number(req.query._end) || 10;
    const limite = Math.max(1, Math.min(fin - inicio, 100));
    // Ordenamiento permitido
    const columnasPermitidas = {
        id: "i.id_infante",
        id_infante: "i.id_infante",
        matricula: "i.matricula",
        nombre_completo: "nombre_completo",
        fecha_nacimiento: "i.fecha_nacimiento",
        sexo_patron: "i.sexo_patron",
        id_ebdi: "i.id_ebdi",
        fecha_ingreso: "i.fecha_ingreso",
        activo: "i.activo"
    };
    const sortSolicitado = String(req.query._sort || "id_infante");
    const sortBy = columnasPermitidas[sortSolicitado] || "i.id_infante";
    const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
    // Construir filtros
    const condiciones = [];
    const parametros = [];
    const matricula = String(req.query.matricula || "").trim();
    const nombre = String(req.query.nombre_completo || "").trim();
    const sexo = String(req.query.sexo_patron || "").trim();
    const idEbdi = req.query.id_ebdi;
    const activo = req.query.activo;
    const estado = String(req.query.estado || "").trim();
    const nombreEbdi = String(req.query.nombre_ebdi || "").trim();
    if (matricula) {
        condiciones.push("i.matricula LIKE ?");
        parametros.push(`%${matricula}%`);
    }
    if (nombre) {
        condiciones.push(`
            CONCAT_WS(' ',
                i.nombre,
                i.apellido_paterno,
                i.apellido_materno
            ) LIKE ?
        `);
        parametros.push(`%${nombre}%`);
    }
    if (sexo) {
        if (!["Femenino", "Masculino"].includes(sexo)) {
            return res.status(400).json({
                mensaje: "El sexo seleccionado no es válido."
            });
        }
        condiciones.push("i.sexo_patron = ?");
        parametros.push(sexo);
    }
    if (idEbdi !== undefined && idEbdi !== "" && Number.isInteger(Number(idEbdi)) && Number(idEbdi) > 0) {
        condiciones.push("i.id_ebdi = ?");
        parametros.push(Number(idEbdi));
    }
    if (nombreEbdi) {
        condiciones.push("e.nombre_ebdi LIKE ?");
        parametros.push(`%${nombreEbdi}%`);
    }
    if (activo !== undefined && activo !== "") {
        let valorActivo;
        if (activo === true || activo === "true" || activo === "1") {
            valorActivo = 1;
        } else if (
            activo === false ||
            activo === "false" ||
            activo === "0"
        ) {
            valorActivo = 0;
        } else {
            return res.status(400).json({
                mensaje: "El estado del expediente no es válido."
            });
        }
        condiciones.push("i.activo = ?");
        parametros.push(valorActivo);
    }
    // Filtrar por el estado del seguimiento más reciente
    if (estado) {
        condiciones.push(`
            (
                SELECT s.estado
                FROM seguimientos s
                WHERE s.id_infante = i.id_infante
                ORDER BY s.id_seguimiento DESC
                LIMIT 1
            ) = ?
        `);
        parametros.push(estado);
    }
    const whereSQL = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    // Consultar infantes, conservando los datos originales
    const [data] = await pool.execute(
        `SELECT
            i.id_infante AS id,
            i.matricula,
            CONCAT_WS(' ',
                i.nombre,
                i.apellido_paterno,
                i.apellido_materno
            ) AS nombre_completo,
            i.fecha_nacimiento,
            i.sexo_patron,
            i.id_ebdi,
            e.nombre AS nombre_ebdi,
            i.fecha_ingreso,
            i.activo,
            i.restricciones_nutricionales,
            mv.fecha_medicion,
            mv.edad_dias,
            mv.peso_kg,
            mv.talla_cm,
            mv.perimetro_cefalico_cm AS perimetro_cefalico,
            mv.observaciones,
            (
                SELECT t.nombre
                FROM infante_tutor it2
                INNER JOIN tutores t
                    ON it2.id_tutor = t.id_tutor
                WHERE it2.id_infante = i.id_infante
                ORDER BY it2.id_tutor ASC
                LIMIT 1
            ) AS nombre_tutor,
            (
                SELECT s.estado
                FROM seguimientos s
                WHERE s.id_infante = i.id_infante
                ORDER BY s.id_seguimiento DESC
                LIMIT 1
            ) AS estado
        FROM infantes i
        LEFT JOIN ebdi e
        ON i.id_ebdi = e.id_ebdi
        LEFT JOIN mediciones_vigentes mv
            ON i.id_infante = mv.id_infante
            AND mv.id_medicion = (
                SELECT m2.id_medicion
                FROM mediciones_vigentes m2
                WHERE m2.id_infante = i.id_infante
                ORDER BY m2.fecha_medicion DESC, m2.id_medicion DESC
                LIMIT 1
            )
        ${whereSQL}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?`,
        [...parametros, limite, inicio]
    );
    // Contar solamente los infantes que coinciden con los filtros
    const [total] = await pool.execute(`SELECT COUNT(*) AS total FROM infantes i ${whereSQL}`, parametros);
    // Enviar total para la paginación de React-Admin
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: collection, motivo: "Consulta de infantes" });
    return res.json(data);
}

app.get("/infantes", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {

        if ("target" in req.query) {
            await getManyReference("infantes", req, res);
        } else if ("id_infante" in req.query) {
            await getMany("infantes", req, res);
        } else {
            await getListInfantes("infantes", req, res);
        }

    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "infantes", motivo: error.message });
        console.error("Error en GET /infantes:", error);
        res.status(500).json({ error: error.message });
    }
});

async function createInfante(req, res) {
    const {
        matricula,
        nombre,
        apellido_paterno,
        apellido_materno,
        curp,
        fecha_nacimiento,
        sexo_patron,
        fecha_ingreso,
        id_ebdi,
        activo,
        restricciones_nutricionales,
        id_tutor,
        parentesco
    } = req.body;

    const creado_por = req.usuario.id_usuario;

    if (!creado_por) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    if (
        !matricula ||
        !nombre ||
        !fecha_nacimiento ||
        !sexo_patron ||
        !fecha_ingreso ||
        !id_ebdi ||
        !id_tutor ||
        !parentesco
    ) {
        return res.status(400).json({
            error: "Faltan datos obligatorios"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Comprobar que el tutor ya esté registrado.
        const [tutores] = await connection.execute(
            `SELECT id_tutor
             FROM tutores
             WHERE id_tutor = ?`,
            [id_tutor]
        );

        if (tutores.length === 0) {
            await connection.rollback();

            return res.status(400).json({
                error: "El tutor seleccionado no existe"
            });
        }

        // Crear el infante.
        const [resultado] = await connection.execute(
            `INSERT INTO infantes (
                matricula,
                nombre,
                apellido_paterno,
                apellido_materno,
                curp,
                fecha_nacimiento,
                sexo_patron,
                fecha_ingreso,
                id_ebdi,
                activo,
                restricciones_nutricionales,
                creado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                matricula,
                nombre,
                apellido_paterno || null,
                apellido_materno || null,
                curp || null,
                fecha_nacimiento,
                sexo_patron,
                fecha_ingreso,
                id_ebdi,
                activo ?? true,
                restricciones_nutricionales || null,
                creado_por
            ]
        );

        const id_infante = resultado.insertId;

        // Relacionar el infante con el tutor existente.
        await connection.execute(
            `INSERT INTO infante_tutor (
                id_infante,
                id_tutor,
                parentesco
            ) VALUES (?, ?, ?)`,
            [id_infante, id_tutor, parentesco]
        );

        // Recuperar el infante creado.
        await connection.commit();

        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "infantes", id_registro: id_infante, valor_nuevo: { matricula, nombre, apellido_paterno, apellido_materno, curp, fecha_nacimiento, sexo_patron, fecha_ingreso, id_ebdi, activo: activo ?? true, restricciones_nutricionales, id_tutor, parentesco } });

        return res.status(201).json({
            id: id_infante,
            id_infante: id_infante,
            matricula,
            nombre,
            apellido_paterno,
            apellido_materno,
            curp,
            fecha_nacimiento,
            sexo_patron,
            fecha_ingreso,
            id_ebdi,
            activo: activo ?? true,
            restricciones_nutricionales
        });

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

app.post("/infantes", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await createInfante(req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "infantes", valor_nuevo: req.body, motivo: error.message });

        console.error("Error al crear infante:", error);

        if (res.headersSent) return;

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "La matrícula, CURP o relación ya existe"
            });
        }

        return res.status(500).json({
            error: "Error al registrar el infante"
        });
    }
});

async function getOneInfante(collection, id, req, res) {
    let [data] = await pool.execute(
        `SELECT
            i.id_infante AS id,
            i.matricula,
            i.nombre,
            i.apellido_paterno,
            i.apellido_materno,
            CONCAT_WS(' ',
                i.nombre,
                i.apellido_paterno,
                i.apellido_materno
            ) AS nombre_completo,
            i.fecha_nacimiento,
            i.sexo_patron,
            i.id_ebdi,
            e.nombre AS nombre_ebdi,
            i.fecha_ingreso,
            i.activo,
            i.restricciones_nutricionales,

            mv.fecha_medicion,
            mv.edad_dias,
            mv.peso_kg,
            mv.talla_cm,
            mv.perimetro_cefalico_cm AS perimetro_cefalico,
            mv.observaciones,

            it.id_tutor,
            it.parentesco,
            t.nombre AS nombre_tutor,

            s.estado

        FROM infantes i
        LEFT JOIN ebdi e
            ON i.id_ebdi = e.id_ebdi

        LEFT JOIN mediciones_vigentes mv
            ON i.id_infante = mv.id_infante
            AND mv.id_medicion = (
                SELECT m2.id_medicion
                FROM mediciones_vigentes m2
                WHERE m2.id_infante = i.id_infante
                ORDER BY m2.fecha_medicion DESC, m2.id_medicion DESC
                LIMIT 1
            )

        LEFT JOIN infante_tutor it
            ON i.id_infante = it.id_infante

        LEFT JOIN tutores t
            ON it.id_tutor = t.id_tutor

        LEFT JOIN seguimientos s
            ON i.id_infante = s.id_infante

        WHERE i.id_infante = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "infantes", id_registro: id, motivo: "Infante no encontrado" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "infantes", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/infantes/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        await getOneInfante("infantes", Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "infantes", id_registro: req.params.id, motivo: error.message });
        res.sendStatus(500);
        throw error;
    }
});

function convertirFecha(fecha) {
    if (!fecha) return null;

    return String(fecha).substring(0, 10);
}

async function updateInfante(req, res) {
    const id = Number(req.params.id);

    const {
        matricula,
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        sexo_patron,
        id_ebdi,
        fecha_ingreso,
        restricciones_nutricionales,
        id_tutor,
        nombre_tutor,
        parentesco
    } = req.body;

    // Validar el ID de la URL
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "El ID del infante no es válido."
        });
    }

    // Aceptar booleanos y sus representaciones habituales
    const activoRecibido = req.body.activo;
    let activo;

    if (
        activoRecibido === true ||
        activoRecibido === 1 ||
        activoRecibido === "1" ||
        activoRecibido === "true"
    ) {
        activo = true;
    } else if (
        activoRecibido === false ||
        activoRecibido === 0 ||
        activoRecibido === "0" ||
        activoRecibido === "false"
    ) {
        activo = false;
    } else {
        return res.status(400).json({
            error: "El campo activo debe ser verdadero o falso.",
            recibido: activoRecibido
        });
    }

    if (!matricula?.trim() || !nombre?.trim()) {
        return res.status(400).json({
            error: "La matrícula y el nombre son obligatorios."
        });
    }

    let conexion;

    try {
        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        // Comprobar que la matrícula no pertenezca a OTRO infante
        const [duplicados] = await conexion.execute(
            `SELECT id_infante
             FROM infantes
             WHERE matricula = ? AND id_infante <> ?
             LIMIT 1`,
            [matricula.trim(), id]
        );

        if (duplicados.length > 0) {
            await conexion.rollback();

            return res.status(400).json({
                error: "Esta matrícula ya pertenece a otro infante."
            });
        }

        // Actualizar los datos del infante
        const [resultado] = await conexion.execute(
            `UPDATE infantes
             SET matricula = ?,
                 nombre = ?,
                 apellido_paterno = ?,
                 apellido_materno = ?,
                 fecha_nacimiento = ?,
                 sexo_patron = ?,
                 id_ebdi = ?,
                 fecha_ingreso = ?,
                 activo = ?,
                 restricciones_nutricionales = ?
             WHERE id_infante = ?`,
            [
                matricula.trim(),
                nombre.trim(),
                apellido_paterno?.trim() || null,
                apellido_materno?.trim() || null,
                convertirFecha(fecha_nacimiento),
                sexo_patron,
                id_ebdi,
                convertirFecha(fecha_ingreso),
                activo,
                restricciones_nutricionales?.trim() || null,
                id
            ]
        );

        // Si no cambió ninguna fila, comprobar si el infante existe
        if (resultado.affectedRows === 0) {
            const [existe] = await conexion.execute(
                `SELECT id_infante
                 FROM infantes
                 WHERE id_infante = ?`,
                [id]
            );

            if (existe.length === 0) {
                await conexion.rollback();

                return res.status(404).json({
                    error: "No se encontró el infante."
                });
            }
        }

        // Actualizar el tutor, si se recibió uno
                // Validar que se haya seleccionado un tutor y un parentesco
        const tutorSeleccionado = Number(id_tutor);

        if (
            !Number.isInteger(tutorSeleccionado) ||
            tutorSeleccionado <= 0 ||
            !parentesco?.trim()
        ) {
            await conexion.rollback();

            return res.status(400).json({
                error: "Debes seleccionar un tutor y especificar el parentesco.",
                recibido: { id_tutor, parentesco }
            });
        }

        // Comprobar que el tutor exista en la tabla tutores
        const [tutorExiste] = await conexion.execute(
            `SELECT id_tutor
            FROM tutores
            WHERE id_tutor = ?`,
            [tutorSeleccionado]
        );

        if (tutorExiste.length === 0) {
            await conexion.rollback();

            return res.status(400).json({
                error: "El tutor seleccionado no está registrado.",
                id_tutor_recibido: id_tutor
            });
        }

        // Buscar si este tutor ya está relacionado con el infante
        const [relacionExistente] = await conexion.execute(
            `SELECT id_tutor
            FROM infante_tutor
            WHERE id_infante = ? AND id_tutor = ?
            FOR UPDATE`,
            [id, tutorSeleccionado]
        );

        if (relacionExistente.length > 0) {
            // La relación ya existe: actualizar el parentesco
            await conexion.execute(
                `UPDATE infante_tutor
                SET parentesco = ?
                WHERE id_infante = ? AND id_tutor = ?`,
                [parentesco.trim(), id, tutorSeleccionado]
            );
        } else {
            // La relación no existe: registrar el tutor seleccionado
            await conexion.execute(
                `INSERT INTO infante_tutor
                    (id_infante, id_tutor, parentesco)
                VALUES (?, ?, ?)`,
                [id, tutorSeleccionado, parentesco.trim()]
            );
        }

        await conexion.commit();

        // Devolver los campos con los mismos nombres que usa el formulario
        const [datos] = await pool.execute(
            `SELECT
                id_infante AS id,
                matricula,
                nombre,
                apellido_paterno,
                apellido_materno,
                fecha_nacimiento,
                sexo_patron,
                id_ebdi,
                fecha_ingreso,
                activo,
                restricciones_nutricionales
             FROM infantes
             WHERE id_infante = ?`,
            [id]
        );

        await registrarBitacora(req, { accion: "UPDATE_EXITOSO", entidad: "infantes", id_registro: id, valor_anterior: null, valor_nuevo: datos[0] });
        return res.json(datos[0]);

    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error("Error al cancelar la transacción:", errorRollback);
            }
        }
        await registrarBitacora(req, { accion: "UPDATE_FALLIDO", entidad: "infantes", id_registro: id, valor_nuevo: req.body, motivo: error.message });

        // Mostrar la causa real en la terminal de Express
        console.error("Error al actualizar infante:", {
            code: error.code,
            message: error.message,
            sqlMessage: error.sqlMessage
        });

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                error: "Uno de los valores únicos ya pertenece a otro registro."
            });
        }

        if (
            error.code === "ER_NO_REFERENCED_ROW_2" ||
            error.code === "ER_CHECK_CONSTRAINT_VIOLATED"
        ) {
            return res.status(400).json({
                error: "Los datos no cumplen las reglas de la base de datos.",
                detalle: error.sqlMessage
            });
        }

        return res.status(500).json({
            error: "Ocurrió un error al actualizar el infante.",
            detalle: error.message
        });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
}

app.put("/infantes/:id", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await updateInfante(req, res);
    } catch (error) {
        console.error("Error en PUT /infantes/:id:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Error interno al actualizar el infante."
            });
        }
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListRegiones(collection, req, res) {
    // Si React Admin solicita regiones por ID,
    // devolver únicamente las regiones solicitadas.
    if (req.query.id) {
        const ids = Array.isArray(req.query.id)
            ? req.query.id
            : [req.query.id];

        const placeholders = ids.map(() => "?").join(",");

        const [data] = await pool.execute(
            `SELECT
                r.id_region AS id,
                r.nombre AS nombre_region
             FROM regiones r
             WHERE r.id_region IN (${placeholders})`,
            ids
        );

        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "regiones", motivo: "Consulta de regiones por ID" });
        return res.json(data);
    }

    let sortBy = req.query._sort || "id_region";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = fin - inicio;

    // Validar la columna por la que se ordenará
    if (true) {
        sortBy = "id_region";
    }

    // Consultar registros
    let [data] = await pool.execute(
        `SELECT
            r.id_region AS id,
            r.nombre AS nombre_region

        FROM regiones r
        ORDER BY \`${sortBy}\` ${sortOrder}
        LIMIT ? OFFSET ?`,
        [limite, inicio]
        
    );
    
    // Consultar total de registros
    let [total] = await pool.execute(
        `SELECT COUNT(*) AS total FROM regiones`
    );

    // Enviar total para la paginación de React Admin
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "regiones", motivo: "Consulta de lista de regiones" });
    res.json(data);
}

app.get("/regiones", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {

        if ("target" in req.query) {
            await getManyReference("regiones", req, res);
        } else if ("id_region" in req.query) {
            await getMany("regiones", req, res);
        } else {
            await getListRegiones("regiones", req, res);
        }

    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "regiones", motivo: error.message });
        console.error("Error en GET /regiones:", error);
        res.status(500).json({ error: error.message });
    }
});

async function getOneRegion(collection, id, req, res) {
    let [data] = await pool.execute(
        `SELECT
            r.id_region AS id,
            r.nombre AS nombre_region

        FROM regiones r WHERE id_region = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "regiones", id_registro: id, motivo: "Región no encontrada" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "regiones", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/regiones/:id", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        await getOneRegion("regiones", Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "regiones", id_registro: req.params.id, motivo: error.message });
        res.sendStatus(500);
        throw error;
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListEstados(collection, req, res) {
    let sortBy = req.query._sort || "id_estado";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = fin - inicio;

    // Consultar registros
    let [data] = await pool.execute(
        `SELECT
            e.id_estado AS id,
            e.nombre AS nombre_estado,
            e.id_region

        FROM estados e
        ORDER BY \`${sortBy}\` ${sortOrder}
        LIMIT ? OFFSET ?`,
        [limite, inicio]
    );
    
    // Consultar total de registros
    let [total] = await pool.execute(
        `SELECT COUNT(*) AS total FROM estados`
    );

    // Enviar total para la paginación de React Admin
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "estados", motivo: "Consulta de lista de estados" });
    res.json(data);
}

app.get("/estados", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional"), async (req, res) => {
    try {

        if ("target" in req.query) {
            await getManyReference("estados", req, res);
        } else if ("id_estado" in req.query) {
            await getMany("estados", req, res);
        } else {
            await getListEstados("estados", req, res);
        }

    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "estados", motivo: error.message });
        console.error("Error en GET /estados:", error);
        res.status(500).json({ error: error.message });
    }
});

async function getOneEstado(collection, id, req, res) {
    let [data] = await pool.execute(
        `SELECT
            e.id_estado AS id,
            e.nombre AS nombre_estado,
            e.id_region

        FROM estados e WHERE id_estado = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "estados", id_registro: id, motivo: "Estado no encontrado" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "estados", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/estados/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional"), async (req, res) => {
    try {
        await getOneEstado("estados", Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "estados", id_registro: req.params.id, motivo: error.message });
        res.sendStatus(500);
        throw error;
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListEbdi(collection, req, res) {

    //Obtener EBDI específicos para ReferenceField / getMany
    if (req.query.id) {
        const ids = Array.isArray(req.query.id)
            ? req.query.id
            : [req.query.id];

        const placeholders = ids.map(() => "?").join(",");

        const [data] = await pool.execute(
            `SELECT
                e.id_ebdi AS id,
                e.nombre AS nombre_ebdi,
                e.id_estado,
                e.clave,
                e.activa AS activo,
                es.nombre AS nombre_estado
             FROM ebdi e
             LEFT JOIN estados es
                ON e.id_estado = es.id_estado
             WHERE e.id_ebdi IN (${placeholders})`,
            ids
        );

        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "ebdi", motivo: "Consulta de EBDI por ID" });
        return res.json(data);
    }

    let sortBy = req.query._sort || "id_ebdi";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = fin - inicio;

    // Validar la columna por la que se ordenará
    if (true) {
        sortBy = "id_ebdi";
    }

    // Consultar registros
    let [data] = await pool.execute(
        `SELECT
            e.id_ebdi AS id,
            e.nombre AS nombre_ebdi,
            e.id_estado,
            e.clave,
            e.activa AS activo,
            es.nombre AS nombre_estado

        FROM ebdi e

        LEFT JOIN estados es
            ON e.id_estado = es.id_estado
        ORDER BY \`${sortBy}\` ${sortOrder}
        LIMIT ? OFFSET ?`,
        [limite, inicio]
    );
    
    // Consultar total de registros
    let [total] = await pool.execute(
        `SELECT COUNT(*) AS total FROM ebdi`
    );

    // Enviar total para la paginación de React Admin
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "ebdi", motivo: "Consulta de lista de EBDI" });
    res.json(data);
}

app.get("/ebdis", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional"), async (req, res) => {
    try {

        if ("target" in req.query) {
            await getManyReference("ebdi", req, res);
        } else if ("id_ebdi" in req.query) {
            await getMany("ebdi", req, res);
        } else {
            await getListEbdi("ebdi", req, res);
        }

    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "ebdi", motivo: error.message });
        console.error("Error en GET /ebdis:", error);
        res.status(500).json({ error: error.message });
    }
});

async function getOneEbdi(collection, id, req, res) {
    let [data] = await pool.execute(
        `SELECT
            e.id_ebdi AS id,
            e.nombre AS nombre_ebdi,
            e.id_estado,
            e.clave,
            e.activa AS activo,
            es.nombre AS nombre_estado

        FROM ebdi e

        LEFT JOIN estados es
            ON e.id_estado = es.id_estado

        WHERE e.id_ebdi = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "ebdi", id_registro: id, motivo: "EBDI no encontrada" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "ebdi", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/ebdis/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional"), async (req, res) => {
    try {
        await getOneEbdi("ebdis", Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "ebdi", id_registro: req.params.id, motivo: error.message });
        res.sendStatus(500);
        throw error;
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListMediciones(collection, req, res) {
    // Ordenamiento y paginación
    const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
    const inicio = Math.max(0, Number(req.query._start) || 0);
    const finSolicitado = Number(req.query._end);
    const fin = Number.isFinite(finSolicitado) && finSolicitado > inicio ? finSolicitado : inicio + 10;
    const limite = fin - inicio;
    // Obtener filtros enviados por React-Admin
    let filtro = {};
    if (req.query.filter) {
        filtro = typeof req.query.filter === "string" ? JSON.parse(req.query.filter) : req.query.filter;
    }
    const idInfante = filtro.id_infante ?? req.query["filter[id_infante]"] ?? req.query.id_infante;
    const fechaMedicion = filtro.fecha_medicion ?? req.query["filter[fecha_medicion]"] ?? req.query.fecha_medicion;
    const tipo = filtro.tipo ?? req.query["filter[tipo]"] ?? req.query.tipo;
    const idEbdiCaptura = filtro.id_ebdi_captura ?? req.query["filter[id_ebdi_captura]"] ?? req.query.id_ebdi_captura;
    // Construir filtros SQL
    const condiciones = [];
    const parametros = [];
    if (idInfante !== undefined && idInfante !== "" && Number.isInteger(Number(idInfante)) && Number(idInfante) > 0) {
        condiciones.push("m.id_infante = ?");
        parametros.push(Number(idInfante));
    }
    if (typeof fechaMedicion === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaMedicion)) {
        condiciones.push(
            "m.fecha_medicion >= ? AND m.fecha_medicion < DATE_ADD(?, INTERVAL 1 DAY)"
        );
        parametros.push(fechaMedicion, fechaMedicion);
    }
    if (tipo && ["periodica", "extraordinaria"].includes(String(tipo))) {
        condiciones.push("m.tipo = ?");
        parametros.push(String(tipo));
    }
    if (idEbdiCaptura !== undefined && idEbdiCaptura !== "" && Number.isInteger(Number(idEbdiCaptura)) && Number(idEbdiCaptura) > 0) {
        condiciones.push("m.id_ebdi_captura = ?");
        parametros.push(Number(idEbdiCaptura));
    }
    // Mantener únicamente la medición más reciente de cada infante
    const condicionUltimaMedicion = `
        m.id_medicion = (
            SELECT m2.id_medicion
            FROM mediciones_vigentes m2
            WHERE m2.id_infante = m.id_infante
            ORDER BY m2.fecha_medicion DESC, m2.id_medicion DESC
            LIMIT 1
        )
    `;
    const where = `WHERE ${condicionUltimaMedicion} ${condiciones.length > 0 ? "AND " + condiciones.join(" AND ") : ""}`;
    // Consultar mediciones filtradas
    const [data] = await pool.execute(
        `SELECT
            m.id_medicion AS id,
            m.id_medicion,
            m.id_infante,
            m.fecha_medicion,
            m.peso_kg,
            m.talla_cm,
            m.perimetro_cefalico_cm,
            m.observaciones
         FROM mediciones_vigentes m
         ${where}
         ORDER BY m.id_medicion ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...parametros, limite, inicio]
    );
    // Contar las mediciones que cumplen los filtros
    const [total] = await pool.execute(`SELECT COUNT(*) AS total FROM mediciones_vigentes m ${where}`, parametros);
    // Enviar total para la paginación de React-Admin
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "mediciones", motivo: "Consulta de lista de mediciones" });
    res.json(data);
}

//Funcion especifica para mediciones en la pantalla de show /infantes
async function getMedicionesPorInfante(req, res) {
    const idInfante = Number(req.query.id);
    if (!Number.isInteger(idInfante) || idInfante <= 0) {
        return res.status(400).json({
            error: "El ID del infante no es válido."
        });
    }
    const inicio = Math.max(0, Number(req.query._start) || 0);
    const finSolicitado = Number(req.query._end);
    const fin = Number.isFinite(finSolicitado) && finSolicitado > inicio ? finSolicitado : inicio + 10;
    const limite = fin - inicio;
    const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
    const [data] = await pool.execute(
        `SELECT
            m.id_medicion AS id,
            m.id_medicion,
            m.id_infante,
            m.fecha_medicion,
            m.peso_kg,
            m.talla_cm,
            m.perimetro_cefalico_cm,
            m.observaciones
         FROM mediciones_vigentes m
         WHERE m.id_infante = ?
         ORDER BY m.fecha_medicion ${sortOrder}, m.id_medicion ${sortOrder}
         LIMIT ? OFFSET ?`,
        [idInfante, limite, inicio]
    );
    const [total] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM mediciones_vigentes
         WHERE id_infante = ?`,
        [idInfante]
    );
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "mediciones", id_registro: idInfante, motivo: "Consulta de mediciones por infante" });
    return res.json(data);
}

app.get("/mediciones", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        if (req.query.target === "id_infante") {
            return await getMedicionesPorInfante(req, res);
        }

        if ("target" in req.query) {
            return await getManyReference("mediciones", req, res);
        }

        if ("id" in req.query) {
            return await getMany("mediciones", req, res);
        }

        // No modificar: otras pantallas usan esta consulta.
        return await getListMediciones("mediciones", req, res);

    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "mediciones", motivo: error.message });
        console.error("Error en GET /mediciones:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                error: "Error al consultar las mediciones."
            });
        }
    }
});

async function createMedicion(req, res) {
    const {
        id_infante,
        id_ebdi_captura,
        fecha_medicion,
        peso_kg,
        talla_cm,
        tipo_talla,
        perimetro_cefalico_cm,
        tipo,
        motivo_extraordinaria,
        observaciones,
        estado_nutricional_registrado
    } = req.body;

    const creado_por = req.usuario.id_usuario;

    if (!creado_por) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    if (
        !id_infante ||
        !id_ebdi_captura ||
        !fecha_medicion ||
        peso_kg == null ||
        talla_cm == null ||
        !tipo_talla ||
        !tipo
    ) {
        return res.status(400).json({
            error: "Faltan datos obligatorios"
        });
    }

    if (
        !["longitud_acostado", "talla_de_pie"].includes(tipo_talla) ||
        !["periodica", "extraordinaria"].includes(tipo)
    ) {
        return res.status(400).json({
            error: "Tipo de talla o medición inválido"
        });
    }

    if (tipo === "extraordinaria" &&
        !motivo_extraordinaria?.trim()) {
        return res.status(400).json({
            error: "Debes indicar el motivo de la medición extraordinaria"
        });
    }

    if (
        Number(peso_kg) <= 0 ||
        Number(talla_cm) <= 0 ||
        (perimetro_cefalico_cm != null &&
            perimetro_cefalico_cm !== "" &&
            Number(perimetro_cefalico_cm) <= 0)
    ) {
        return res.status(400).json({
            error: "El peso, la talla y el perímetro deben ser positivos"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Obtener los datos del infante que se conservarán en la versión.
        const [infantes] = await connection.execute(
            `SELECT fecha_nacimiento, sexo_patron
             FROM infantes
             WHERE id_infante = ?`,
            [id_infante]
        );

        if (infantes.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                error: "El infante seleccionado no existe"
            });
        }

        const infante = infantes[0];

        // Crear el registro principal de la medición.
        const [resultado] = await connection.execute(
            `INSERT INTO mediciones (
                id_infante,
                id_ebdi_captura,
                creado_por
            ) VALUES (?, ?, ?)`,
            [id_infante, id_ebdi_captura, creado_por]
        );

        const id_medicion = resultado.insertId;

        // Registrar la primera versión.
        const [version] = await connection.execute(
            `INSERT INTO medicion_versiones (
                id_medicion,
                numero_version,
                fecha_medicion,
                fecha_nacimiento_utilizada,
                sexo_patron_utilizado,
                peso_kg,
                talla_cm,
                tipo_talla,
                perimetro_cefalico_cm,
                tipo,
                motivo_extraordinaria,
                observaciones,
                estado_nutricional_registrado,
                registrado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_medicion,
                1,
                fecha_medicion,
                infante.fecha_nacimiento,
                infante.sexo_patron,
                peso_kg,
                talla_cm,
                tipo_talla,
                perimetro_cefalico_cm || null,
                tipo,
                tipo === "extraordinaria"
                    ? motivo_extraordinaria.trim()
                    : null,
                observaciones || null,
                estado_nutricional_registrado || null,
                creado_por
            ]
        );

        await connection.commit();
        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "mediciones", id_registro: id_medicion, valor_nuevo: { id_infante, id_ebdi_captura, fecha_medicion, peso_kg, talla_cm, tipo_talla, perimetro_cefalico_cm, tipo, motivo_extraordinaria, observaciones, estado_nutricional_registrado, numero_version: 1 } });

        // React Admin necesita que la respuesta incluya "id".
        return res.status(201).json({
            id: id_medicion,
            id_medicion,
            id_version: version.insertId,
            id_infante,
            id_ebdi_captura,
            numero_version: 1,
            fecha_medicion,
            peso_kg,
            talla_cm,
            tipo_talla,
            perimetro_cefalico_cm: perimetro_cefalico_cm || null,
            tipo,
            motivo_extraordinaria:
                tipo === "extraordinaria"
                    ? motivo_extraordinaria.trim()
                    : null,
            observaciones: observaciones || null,
            estado_nutricional_registrado:
                estado_nutricional_registrado || null
        });

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

app.post("/mediciones", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await createMedicion(req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "mediciones", valor_nuevo: req.body, motivo: error.message });
        console.error("Error al crear medición:", error);

        if (res.headersSent) return;

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                error: "El infante, EBDI o usuario indicado no existe"
            });
        }

        if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
            return res.status(400).json({
                error: "Los datos no cumplen las restricciones de la medición"
            });
        }

        return res.status(500).json({
            error: "Error al registrar la medición"
        });
    }
});

async function getOneMedicion(collection, id, req, res) {
    let [data] = await pool.execute(
        `SELECT
            m.id_medicion AS id,
            m.id_medicion,
            m.id_infante,
            m.id_ebdi_captura,
            m.id_version,
            m.numero_version,
            m.fecha_medicion,
            m.fecha_nacimiento_utilizada,
            m.sexo_patron_utilizado,
            m.edad_dias,
            m.peso_kg,
            m.talla_cm,
            m.tipo_talla,
            m.perimetro_cefalico_cm,
            m.tipo,
            m.motivo_extraordinaria,
            m.observaciones,
            m.estado_nutricional_registrado,
            m.motivo_correccion
        FROM mediciones_vigentes m
        WHERE m.id_medicion = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "mediciones", id_registro: id, motivo: "Medición no encontrada" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "mediciones", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/mediciones/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        await getOneMedicion("mediciones", Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "mediciones", id_registro: req.params.id, motivo: error.message });
        res.sendStatus(500);
        throw error;
    }
});

async function updateMedicion(req, res) {
    const id_medicion = Number(req.params.id);
    const creado_por = req.usuario.id_usuario;

    if (!creado_por) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    const {
        fecha_medicion,
        peso_kg,
        talla_cm,
        tipo_talla,
        perimetro_cefalico_cm,
        tipo,
        motivo_extraordinaria,
        observaciones,
        motivo_correccion
    } = req.body;

    //Validaciones iniciales
    if (!Number.isInteger(id_medicion) || id_medicion <= 0) {
        return res.status(400).json({
            error: "El ID de la medición no es válido"
        });
    }

    if (
        typeof motivo_correccion !== "string" ||
        !motivo_correccion.trim()
    ) {
        return res.status(400).json({
            error: "Debes indicar el motivo de la corrección"
        });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        //Verificar que exista la medición y bloquearla durante la corrección
        const [mediciones] = await connection.execute(
            `SELECT id_medicion
             FROM mediciones
             WHERE id_medicion = ?
             FOR UPDATE`,
            [id_medicion]
        );

        if (mediciones.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                error: "No se encontró la medición"
            });
        }

        //Obtener la última versión registrada
        const [versiones] = await connection.execute(
            `SELECT *
             FROM medicion_versiones
             WHERE id_medicion = ?
             ORDER BY numero_version DESC
             LIMIT 1
             FOR UPDATE`,
            [id_medicion]
        );

        if (versiones.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                error: "No se encontró una versión de la medición"
            });
        }

        const actual = versiones[0];

        //Conservar los valores actuales cuando no se envíe un campo
        const nuevaFecha =
            fecha_medicion ?? actual.fecha_medicion;

        const nuevoPeso =
            peso_kg === undefined ? Number(actual.peso_kg) : Number(peso_kg);

        const nuevaTalla =
            talla_cm === undefined ? Number(actual.talla_cm) : Number(talla_cm);

        const nuevoTipoTalla =
            tipo_talla ?? actual.tipo_talla;

        const nuevoPerimetro =
            perimetro_cefalico_cm === undefined
                ? actual.perimetro_cefalico_cm
                : (
                    perimetro_cefalico_cm === "" ||
                    perimetro_cefalico_cm === null
                        ? null
                        : Number(perimetro_cefalico_cm)
                );

        const nuevoTipo =
            tipo ?? actual.tipo;

        const nuevoMotivoExtraordinaria =
            motivo_extraordinaria === undefined
                ? actual.motivo_extraordinaria
                : (
                    typeof motivo_extraordinaria === "string" &&
                    motivo_extraordinaria.trim()
                        ? motivo_extraordinaria.trim()
                        : null
                );

        const nuevasObservaciones =
            observaciones === undefined
                ? actual.observaciones
                : (observaciones || null);

        //Validar fecha, peso y talla
        if (
            !nuevaFecha ||
            Number.isNaN(Date.parse(nuevaFecha)) ||
            !Number.isFinite(nuevoPeso) ||
            nuevoPeso <= 0 ||
            !Number.isFinite(nuevaTalla) ||
            nuevaTalla <= 0
        ) {
            await connection.rollback();

            return res.status(400).json({
                error: "La fecha, el peso o la talla no son válidos"
            });
        }

        //Validar los tipos seleccionados
        if (
            !["longitud_acostado", "talla_de_pie"].includes(nuevoTipoTalla) ||
            !["periodica", "extraordinaria"].includes(nuevoTipo)
        ) {
            await connection.rollback();

            return res.status(400).json({
                error: "El tipo de talla o de medición no es válido"
            });
        }

        //Validar el perímetro cefálico, si se proporcionó
        if (
            nuevoPerimetro !== null &&
            (!Number.isFinite(nuevoPerimetro) || nuevoPerimetro <= 0)
        ) {
            await connection.rollback();

            return res.status(400).json({
                error: "El perímetro cefálico debe ser mayor que cero"
            });
        }

        //Validar el motivo de la medición extraordinaria
        if (
            nuevoTipo === "extraordinaria" &&
            (
                typeof nuevoMotivoExtraordinaria !== "string" ||
                !nuevoMotivoExtraordinaria.trim()
            )
        ) {
            await connection.rollback();

            return res.status(400).json({
                error: "Debes indicar el motivo de la medición extraordinaria"
            });
        }

        //Comprobar que la fecha no sea anterior al nacimiento utilizado
        const fechaNacimiento = actual.fecha_nacimiento_utilizada;

        if (new Date(nuevaFecha) < new Date(fechaNacimiento)) {
            await connection.rollback();

            return res.status(400).json({
                error: "La fecha de medición no puede ser anterior al nacimiento"
            });
        }

        //Crear una nueva versión sin sobrescribir la anterior
        const nuevoNumeroVersion = actual.numero_version + 1;

        const [resultado] = await connection.execute(
            `INSERT INTO medicion_versiones (
                id_medicion,
                numero_version,
                fecha_medicion,
                fecha_nacimiento_utilizada,
                sexo_patron_utilizado,
                peso_kg,
                talla_cm,
                tipo_talla,
                perimetro_cefalico_cm,
                tipo,
                motivo_extraordinaria,
                observaciones,
                estado_nutricional_registrado,
                motivo_correccion,
                registrado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_medicion,
                nuevoNumeroVersion,
                convertirFecha(nuevaFecha),
                actual.fecha_nacimiento_utilizada,
                actual.sexo_patron_utilizado,
                nuevoPeso,
                nuevaTalla,
                nuevoTipoTalla,
                nuevoPerimetro,
                nuevoTipo,
                nuevoTipo === "extraordinaria"
                    ? nuevoMotivoExtraordinaria.trim()
                    : null,
                nuevasObservaciones,
                actual.estado_nutricional_registrado,
                motivo_correccion.trim(),
                creado_por
            ]
        );

        //Confirmar la transacción
        await connection.commit();
        await registrarBitacora(req, { accion: "UPDATE_EXITOSO", entidad: "mediciones", id_registro: id_medicion, valor_anterior: actual, valor_nuevo: { id_medicion, numero_version: nuevoNumeroVersion, fecha_medicion: nuevaFecha, peso_kg: nuevoPeso, talla_cm: nuevaTalla, tipo_talla: nuevoTipoTalla, perimetro_cefalico_cm: nuevoPerimetro, tipo: nuevoTipo, motivo_extraordinaria: nuevoMotivoExtraordinaria, observaciones: nuevasObservaciones, motivo_correccion: motivo_correccion.trim() }, motivo: motivo_correccion.trim() });

        //Responder con los datos de la nueva versión
        res.json({
            id: id_medicion,
            id_medicion,
            id_version: resultado.insertId,
            numero_version: nuevoNumeroVersion,
            fecha_medicion: nuevaFecha,
            peso_kg: nuevoPeso,
            talla_cm: nuevaTalla,
            tipo_talla: nuevoTipoTalla,
            perimetro_cefalico_cm: nuevoPerimetro,
            tipo: nuevoTipo,
            motivo_extraordinaria:
                nuevoTipo === "extraordinaria"
                    ? nuevoMotivoExtraordinaria.trim()
                    : null,
            observaciones: nuevasObservaciones,
            motivo_correccion: motivo_correccion.trim()
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        await registrarBitacora(req, { accion: "UPDATE_FALLIDO", entidad: "mediciones", id_registro: id_medicion, valor_nuevo: req.body, motivo: error.message });
        console.error("Error al corregir medición:", error);

        res.status(500).json({
            error: "Ocurrió un error al corregir la medición"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

app.put("/mediciones/:id", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await updateMedicion(req, res);
    } catch (error) {
        console.error("Error al corregir medición:", error);

        if (res.headersSent) return;

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                error: "El usuario responsable no existe"
            });
        }

        if (
            error.code === "ER_CHECK_CONSTRAINT_VIOLATED" ||
            error.code === "ER_DUP_ENTRY" ||
            error.code === "ER_DATA_TOO_LONG"
        ) {
            return res.status(400).json({
                error: "Los datos de la corrección no cumplen las restricciones"
            });
        }

        return res.status(500).json({
            error: "Error al corregir la medición"
        });
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListSeguimientos(collection, req, res) {
    // Obtener seguimientos específicos para ReferenceField / getMany
    if (req.query.id) {
        const ids = Array.isArray(req.query.id) ? req.query.id : [req.query.id];
        const placeholders = ids.map(() => "?").join(",");
        const [data] = await pool.execute(
            `SELECT
                s.id_seguimiento AS id,
                s.id_seguimiento,
                s.id_infante,
                s.id_condicion,
                s.fecha_apertura,
                s.motivo,
                s.estado,
                s.fecha_cierre
             FROM seguimientos s
             WHERE s.id_seguimiento IN (${placeholders})`,
            ids
        );
        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "seguimientos", motivo: "Consulta de seguimientos por ID" });
        return res.json(data);
    }
    // Paginación
    const inicio = Math.max(0, Number(req.query._start) || 0);
    const finSolicitado = Number(req.query._end);
    const fin = Number.isFinite(finSolicitado) && finSolicitado > inicio ? finSolicitado : inicio + 10;
    const limite = fin - inicio;
    // Ordenamiento seguro
    const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
    // Obtener filtros enviados por React-Admin
    let filtro = {};
    if (req.query.filter) {
        filtro = typeof req.query.filter === "string" ? JSON.parse(req.query.filter) : req.query.filter;
    }
    // Compatibilidad con diferentes formas de enviar filtros
    const idInfante = filtro.id_infante ?? req.query["filter[id_infante]"] ?? req.query.id_infante;
    const fechaApertura = filtro.fecha_apertura ?? req.query["filter[fecha_apertura]"] ?? req.query.fecha_apertura;
    const motivo = filtro.motivo ?? req.query["filter[motivo]"] ?? req.query.motivo;
    const estado = filtro.estado ?? req.query["filter[estado]"] ?? req.query.estado;
    // Construcción de condiciones SQL
    const condiciones = [];
    const parametros = [];
    if (idInfante !== undefined && idInfante !== "" && Number.isInteger(Number(idInfante)) && Number(idInfante) > 0) {
        condiciones.push("s.id_infante = ?");
        parametros.push(Number(idInfante));
    }
    if (fechaApertura) {
        condiciones.push("DATE(s.fecha_apertura) = ?");
        parametros.push(fechaApertura);
    }
    if (motivo && String(motivo).trim() !== "") {
        condiciones.push("s.motivo LIKE ?");
        parametros.push(`%${String(motivo).trim()}%`);
    }
    if (estado && String(estado).trim() !== "") {
        condiciones.push("s.estado = ?");
        parametros.push(String(estado).trim());
    }
    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";
    // Consultar seguimientos con filtros y paginación
    const [data] = await pool.execute(
        `SELECT
            s.id_seguimiento AS id,
            s.id_seguimiento,
            s.id_infante,
            s.id_condicion,
            s.fecha_apertura,
            s.motivo,
            s.estado,
            s.fecha_cierre
         FROM seguimientos s
         ${where}
         ORDER BY s.id_seguimiento ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...parametros, limite, inicio]
    );
    // Contar solamente los registros que cumplen los filtros
    const [total] = await pool.execute(`SELECT COUNT(*) AS total FROM seguimientos s ${where}`, parametros);
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "seguimientos", motivo: "Consulta de lista de seguimientos" });
    res.json(data);
}

app.get("/seguimientos", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {

        if ("target" in req.query) {
            await getManyReference("seguimientos", req, res);
        } else if ("id_seguimiento" in req.query) {
            await getMany("seguimientos", req, res);
        } else {
            await getListSeguimientos("seguimientos", req, res);
        }

    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "seguimientos", motivo: error.message });
        console.error("Error en GET /seguimientos:", error);
        res.status(500).json({ error: error.message });
    }
});

async function createSeguimiento(req, res) {
    const {
        id_infante,
        id_condicion,
        fecha_apertura,
        motivo,
        estado
    } = req.body;

    const creado_por = req.usuario.id_usuario;

    if (!creado_por) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    const estadosValidos = [
        "requiere_seguimiento",
        "en_seguimiento"
    ];

    if (
        !id_infante ||
        !fecha_apertura ||
        !motivo?.trim() ||
        !estadosValidos.includes(estado)
    ) {
        return res.status(400).json({
            error: "Completa los campos obligatorios con valores válidos."
        });
    }

    const fechaTexto = String(fecha_apertura).slice(0, 10);

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(fechaTexto) ||
        Number.isNaN(Date.parse(`${fechaTexto}T00:00:00Z`))
    ) {
        return res.status(400).json({
            error: "La fecha de apertura no es válida."
        });
    }

    const condicionId =
        id_condicion === undefined ||
        id_condicion === null ||
        id_condicion === ""
            ? null
            : Number(id_condicion);

    if (
        condicionId !== null &&
        (!Number.isInteger(condicionId) || condicionId <= 0)
    ) {
        return res.status(400).json({
            error: "La condición de salud no es válida."
        });
    }

    let conexion;

    try {
        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        // Verificar que exista el infante.
        const [infantes] = await conexion.execute(
            `SELECT id_infante
             FROM infantes
             WHERE id_infante = ?`,
            [id_infante]
        );

        if (infantes.length === 0) {
            await conexion.rollback();

            return res.status(400).json({
                error: "El infante indicado no existe."
            });
        }

        // Si se seleccionó una condición, verificar que pertenezca
        // al mismo infante.
        if (condicionId !== null) {
            const [condiciones] = await conexion.execute(
                `SELECT id_condicion
                 FROM condiciones_salud
                 WHERE id_condicion = ?
                   AND id_infante = ?`,
                [condicionId, id_infante]
            );

            if (condiciones.length === 0) {
                await conexion.rollback();

                return res.status(400).json({
                    error: "La condición no existe o no pertenece al infante seleccionado."
                });
            }
        }

        // Crear únicamente el seguimiento.
        const [resultado] = await conexion.execute(
            `INSERT INTO seguimientos (
                id_infante,
                id_condicion,
                motivo,
                estado,
                fecha_apertura,
                fecha_cierre,
                creado_por
            ) VALUES (?, ?, ?, ?, ?, NULL, ?)`,
            [
                id_infante,
                condicionId,
                motivo.trim(),
                estado,
                fechaTexto,
                creado_por
            ]
        );

        await conexion.commit();
        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "seguimientos", id_registro: resultado.insertId, valor_nuevo: { id_infante: Number(id_infante), id_condicion: condicionId, fecha_apertura: fechaTexto, motivo: motivo.trim(), estado, fecha_cierre: null } });

        return res.status(201).json({
            id: resultado.insertId,
            id_seguimiento: resultado.insertId,
            id_infante: Number(id_infante),
            id_condicion: condicionId,
            fecha_apertura: fechaTexto,
            motivo: motivo.trim(),
            estado,
            fecha_cierre: null
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "seguimientos", valor_nuevo: req.body, motivo: error.message });
        console.error("Error al crear seguimiento:", error);

        if (
            error.code === "ER_NO_REFERENCED_ROW_2" ||
            error.code === "ER_NO_REFERENCED_ROW"
        ) {
            return res.status(400).json({
                error: "El infante, la condición o el usuario indicado no existe."
            });
        }

        return res.status(500).json({
            error: "Ocurrió un error al registrar el seguimiento."
        });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
}

app.post("/seguimientos", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await createSeguimiento(req, res);
    } catch (error) {
        console.error("Error en POST /seguimientos:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Error interno al procesar la solicitud."
            });
        }
    }
});

async function getOneSeguimiento(collection, id, req, res) {
    const [data] = await pool.execute(
        `SELECT
            s.id_seguimiento AS id,
            s.id_seguimiento,
            s.id_infante,
            s.id_condicion,
            s.fecha_apertura,
            s.motivo,
            s.estado,
            s.fecha_cierre
         FROM seguimientos s
         WHERE s.id_seguimiento = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "seguimientos", id_registro: id, motivo: "Seguimiento no encontrado" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "seguimientos", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/seguimientos/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        await getOneSeguimiento("seguimientos", Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "seguimientos", id_registro: req.params.id, motivo: error.message });
        res.sendStatus(500);
        throw error;
    }
});

async function updateSeguimiento(req, res) {
    const idSeguimiento = Number(req.params.id);
    const usuarioId = req.usuario.id_usuario;

    if (!usuarioId) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    const {
        id_infante,
        id_condicion,
        fecha_apertura,
        motivo,
        estado,
        fecha_cierre
    } = req.body;

    const estadosValidos = [
        "requiere_seguimiento",
        "en_seguimiento",
        "concluido"
    ];

    if (!Number.isInteger(idSeguimiento) || idSeguimiento <= 0) {
        return res.status(400).json({
            error: "El ID del seguimiento no es válido."
        });
    }

    if (
        !id_infante ||
        !fecha_apertura ||
        !motivo?.trim() ||
        !estadosValidos.includes(estado)
    ) {
        return res.status(400).json({
            error: "Completa los campos obligatorios con valores válidos."
        });
    }

    const fechaAperturaTexto = String(fecha_apertura).slice(0, 10);

    const fechaConvertida = convertirFecha(fechaAperturaTexto);

    if (
        !fechaConvertida ||
        Number.isNaN(Date.parse(`${fechaConvertida}T00:00:00Z`))
    ) {
        return res.status(400).json({
            error: "La fecha de apertura no es válida."
        });
    }

    const condicionEnviada =
        id_condicion !== undefined;

    const condicionId = !condicionEnviada ||
        id_condicion === null ||
        id_condicion === ""
            ? null
            : Number(id_condicion);

    if (
        condicionId !== null &&
        (!Number.isInteger(condicionId) || condicionId <= 0)
    ) {
        return res.status(400).json({
            error: "La condición de salud no es válida."
        });
    }

    let conexion;

    try {
        conexion = await pool.getConnection();
        await conexion.beginTransaction();

        //Buscar el seguimiento y bloquearlo durante la actualización.
        const [seguimientos] = await conexion.execute(
            `SELECT *
             FROM seguimientos
             WHERE id_seguimiento = ?
             FOR UPDATE`,
            [idSeguimiento]
        );

        if (seguimientos.length === 0) {
            await conexion.rollback();

            return res.status(404).json({
                error: "No se encontró el seguimiento."
            });
        }

        const actual = seguimientos[0];

        //Si el formulario no envía id_condicion, conservar la actual.
        const nuevaCondicionId = condicionEnviada
            ? condicionId
            : actual.id_condicion;

        //Verificar que exista el infante.
        const [infantes] = await conexion.execute(
            `SELECT id_infante
             FROM infantes
             WHERE id_infante = ?`,
            [id_infante]
        );

        if (infantes.length === 0) {
            await conexion.rollback();

            return res.status(400).json({
                error: "El infante indicado no existe."
            });
        }

        //Verificar que la condición pertenezca al infante seleccionado.
        if (nuevaCondicionId !== null) {
            const [condiciones] = await conexion.execute(
                `SELECT id_condicion
                 FROM condiciones_salud
                 WHERE id_condicion = ?
                   AND id_infante = ?`,
                [nuevaCondicionId, id_infante]
            );

            if (condiciones.length === 0) {
                await conexion.rollback();

                return res.status(400).json({
                    error: "La condición no existe o no pertenece al infante seleccionado."
                });
            }
        }

        //Determinar la fecha de cierre.
        let nuevaFechaCierre = null;

        if (estado === "concluido") {
            if (fecha_cierre) {
                nuevaFechaCierre = String(fecha_cierre).slice(0, 10);
            } else if (actual.estado === "concluido" && actual.fecha_cierre) {
                nuevaFechaCierre = String(actual.fecha_cierre).slice(0, 10);
            } else {
                const [fechaActual] = await conexion.execute(
                    "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS hoy"
                );

                nuevaFechaCierre = fechaActual[0].hoy;
            }

            const fechaCierreTexto = convertirFecha(nuevaFechaCierre);

            if (
                !fechaCierreTexto ||
                fechaCierreTexto < fechaAperturaTexto
            ) {
                await conexion.rollback();

                return res.status(400).json({
                    error: "La fecha de cierre debe ser válida y no anterior a la fecha de apertura."
                });
            }
        }

        //Actualizar exclusivamente la tabla seguimientos.
        await conexion.execute(
            `UPDATE seguimientos
             SET id_infante = ?,
                 id_condicion = ?,
                 fecha_apertura = ?,
                 motivo = ?,
                 estado = ?,
                 fecha_cierre = ?
             WHERE id_seguimiento = ?`,
            [
                id_infante,
                nuevaCondicionId,
                fechaAperturaTexto,
                motivo.trim(),
                estado,
                nuevaFechaCierre,
                idSeguimiento
            ]
        );

        await conexion.commit();
        await registrarBitacora(req, { accion: "UPDATE_EXITOSO", entidad: "seguimientos", id_registro: idSeguimiento, valor_anterior: actual, valor_nuevo: { id_infante: Number(id_infante), id_condicion: nuevaCondicionId, fecha_apertura: fechaAperturaTexto, motivo: motivo.trim(), estado, fecha_cierre: nuevaFechaCierre } });

        return res.json({
            id: idSeguimiento,
            id_seguimiento: idSeguimiento,
            id_infante: Number(id_infante),
            id_condicion: nuevaCondicionId,
            fecha_apertura: fechaAperturaTexto,
            motivo: motivo.trim(),
            estado,
            fecha_cierre: nuevaFechaCierre
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        await registrarBitacora(req, { accion: "UPDATE_FALLIDO", entidad: "seguimientos", id_registro: idSeguimiento, valor_nuevo: req.body, motivo: error.message });
        console.error("Error al actualizar seguimiento:", error);

        if (
            error.code === "ER_NO_REFERENCED_ROW_2" ||
            error.code === "ER_NO_REFERENCED_ROW"
        ) {
            return res.status(400).json({
                error: "El infante, la condición o el usuario indicado no existe."
            });
        }

        return res.status(500).json({
            error: "Ocurrió un error al actualizar el seguimiento."
        });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
}

app.put("/seguimientos/:id", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await updateSeguimiento(req, res);
    } catch (error) {
        console.error("Error en PUT /seguimientos:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Error interno al actualizar el seguimiento."
            });
        }
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListCondiciones(req, res) {
    const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
    const inicio = Math.max(0, Number(req.query._start) || 0);
    const finSolicitado = Number(req.query._end);
    const fin = Number.isFinite(finSolicitado) && finSolicitado > inicio ? finSolicitado : inicio + 10;
    const limite = fin - inicio;
    // Permite consultar las condiciones de un infante.
    if ("target" in req.query) {
        if (req.query.target !== "id_infante") {
            return res.status(400).json({
                error: "El filtro solicitado no es válido."
            });
        }
    }
    // Obtener los filtros enviados por React-Admin.
    let filtro = {};
    if (req.query.filter) {
        filtro = typeof req.query.filter === "string"
            ? JSON.parse(req.query.filter)
            : req.query.filter;
    }
    const idInfante = filtro.id_infante ?? req.query["filter[id_infante]"] ?? req.query.id_infante;
    const fechaRegistro = filtro.fecha_registro ?? req.query["filter[fecha_registro]"] ?? req.query.fecha_registro;
    const descripcion = filtro.descripcion ?? req.query["filter[descripcion]"] ?? req.query.descripcion;
    // Construir las condiciones SQL.
    const condiciones = [];
    const parametros = [];
    if (idInfante !== undefined && idInfante !== "" && Number.isInteger(Number(idInfante)) && Number(idInfante) > 0) {
        condiciones.push("c.id_infante = ?");
        parametros.push(Number(idInfante));
    }
    if (typeof fechaRegistro === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaRegistro)) {
        condiciones.push("c.fecha_registro >= ? AND c.fecha_registro < DATE_ADD(?, INTERVAL 1 DAY)");
        parametros.push(fechaRegistro, fechaRegistro);
    }
    if (descripcion !== undefined && String(descripcion).trim() !== "") {
        condiciones.push("c.descripcion LIKE ?");
        parametros.push(`%${String(descripcion).trim()}%`);
    }
    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";
    // Consultar condiciones aplicando los filtros y la paginación.
    const [data] = await pool.execute(
        `SELECT
            c.id_condicion AS id,
            c.id_condicion,
            c.id_infante,
            DATE_FORMAT(c.fecha_registro, '%Y-%m-%d') AS fecha_registro,
            c.descripcion,
            c.registrado_por
         FROM condiciones_salud c
         ${where}
         ORDER BY c.id_condicion ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...parametros, limite, inicio]
    );
    // Contar únicamente los registros que cumplen los filtros.
    const [total] = await pool.execute(`SELECT COUNT(*) AS total FROM condiciones_salud c ${where}`, parametros);
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "condiciones_salud", motivo: "Consulta de lista de condiciones de salud" });
    res.json(data);
}

app.get("/condiciones", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        if ("target" in req.query) {
            await getListCondiciones(req, res);
        } else if ("id_condicion" in req.query) {
            await getMany(req, res);
        } else {
            await getListCondiciones(req, res);
        }
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "condiciones_salud", motivo: error.message });
        console.error("Error en GET /condiciones:", error);
        res.status(500).json({
            error: "Error al consultar las condiciones de salud."
        });
    }
});

async function getOneCondicion(id, req, res) {
    const [data] = await pool.execute(
        `SELECT
            id_condicion AS id,
            id_condicion,
            id_infante,
            DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha_registro,
            descripcion,
            registrado_por
         FROM condiciones_salud
         WHERE id_condicion = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "condiciones_salud", id_registro: id, motivo: "Condición de salud no encontrada" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "condiciones_salud", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/condiciones/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        await getOneCondicion(Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "condiciones_salud", id_registro: req.params.id, motivo: error.message });
        console.error("Error en GET /condiciones/:id:", error);
        res.status(500).json({
            error: "Error al consultar la condición."
        });
    }
});

async function createCondicion(req, res) {
    const { id_infante, fecha_registro, descripcion } = req.body;
    const usuarioId = req.usuario.id_usuario;

    if (!usuarioId) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    const infanteId = Number(id_infante);
    const fechaTexto = convertirFecha(fecha_registro);

    if (
        !Number.isInteger(infanteId) ||
        infanteId <= 0 ||
        !fechaTexto ||
        !descripcion?.trim()
    ) {
        return res.status(400).json({
            error: "Completa los campos obligatorios."
        });
    }

    try {
        const [infantes] = await pool.execute(
            `SELECT id_infante
             FROM infantes
             WHERE id_infante = ?`,
            [infanteId]
        );

        if (infantes.length === 0) {
            return res.status(400).json({
                error: "El infante indicado no existe."
            });
        }

        const [resultado] = await pool.execute(
            `INSERT INTO condiciones_salud (
                id_infante,
                descripcion,
                fecha_registro,
                registrado_por
            ) VALUES (?, ?, ?, ?)`,
            [
                infanteId,
                descripcion.trim(),
                fechaTexto,
                usuarioId
            ]
        );

        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "condiciones_salud", id_registro: resultado.insertId, valor_nuevo: { id_infante: infanteId, descripcion: descripcion.trim(), fecha_registro: fechaTexto, registrado_por: usuarioId } });
        return res.status(201).json({
            id: resultado.insertId,
            id_condicion: resultado.insertId,
            id_infante: infanteId,
            descripcion: descripcion.trim(),
            fecha_registro: fechaTexto,
            registrado_por: usuarioId
        });
    } catch (error) {
        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "condiciones_salud", valor_nuevo: req.body, motivo: error.message });
        console.error("Error al crear condición:", error);

        if (
            error.code === "ER_NO_REFERENCED_ROW_2" ||
            error.code === "ER_NO_REFERENCED_ROW"
        ) {
            return res.status(400).json({
                error: "El infante o el usuario indicado no existe."
            });
        }

        return res.status(500).json({
            error: "Ocurrió un error al registrar la condición."
        });
    }
}

app.post("/condiciones", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await createCondicion(req, res);
    } catch (error) {
        console.error("Error en POST /condiciones:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Error al registrar la condición."
            });
        }
    }
});

async function updateCondicion(req, res) {
    const idCondicion = Number(req.params.id);
    const { fecha_registro, descripcion } = req.body;
    const fechaTexto = convertirFecha(fecha_registro);

    if (
        !Number.isInteger(idCondicion) ||
        idCondicion <= 0 ||
        !fechaTexto ||
        !descripcion?.trim()
    ) {
        return res.status(400).json({
            error: "Completa los campos obligatorios con valores válidos."
        });
    }

    try {
        const [actuales] = await pool.execute(
            `SELECT id_condicion, id_infante, fecha_registro, descripcion, registrado_por
            FROM condiciones_salud
            WHERE id_condicion = ?`,
            [idCondicion]
        );

        if (actuales.length === 0) {
            return res.status(404).json({
                error: "No se encontró la condición de salud."
            });
        }

        await pool.execute(
            `UPDATE condiciones_salud
             SET descripcion = ?,
                 fecha_registro = ?
             WHERE id_condicion = ?`,
            [descripcion.trim(), fechaTexto, idCondicion]
        );

        const [data] = await pool.execute(
            `SELECT
                id_condicion AS id,
                id_condicion,
                id_infante,
                DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha_registro,
                descripcion,
                registrado_por
             FROM condiciones_salud
             WHERE id_condicion = ?`,
            [idCondicion]
        );

        await registrarBitacora(req, { accion: "UPDATE_EXITOSO", entidad: "condiciones_salud", id_registro: idCondicion, valor_anterior: actuales[0], valor_nuevo: data[0] });
        return res.json(data[0]);
    } catch (error) {
        await registrarBitacora(req, { accion: "UPDATE_FALLIDO", entidad: "condiciones_salud", id_registro: idCondicion, valor_nuevo: req.body, motivo: error.message });
        console.error("Error al actualizar condición:", error);

        return res.status(500).json({
            error: "Ocurrió un error al actualizar la condición."
        });
    }
}

app.put("/condiciones/:id", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await updateCondicion(req, res);
    } catch (error) {
        console.error("Error en PUT /condiciones:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Error al actualizar la condición."
            });
        }
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListAccionesSeguimiento(req, res) {
    const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
    const inicio = Number(req.query._start) || 0;
    const fin = Number(req.query._end) || inicio + 10;
    const limite = Math.max(0, fin - inicio);
    let filtro = {};
    if (req.query.filter) {
        filtro = typeof req.query.filter === "string"
            ? JSON.parse(req.query.filter)
            : req.query.filter;
    }
    // Compatibilidad con filtros enviados como parámetros individuales.
    const idInfante = filtro.id_infante ?? req.query["filter[id_infante]"] ?? req.query.id_infante;
    const idSeguimiento = filtro.id_seguimiento ?? req.query["filter[id_seguimiento]"] ?? req.query.id_seguimiento;
    const fecha = filtro.fecha ?? req.query["filter[fecha]"] ?? req.query.fecha;
    const responsableNombre = filtro.responsable_nombre ?? req.query["filter[responsable_nombre]"] ?? req.query.responsable_nombre;
    const condiciones = [];
    const parametros = [];
    if (idInfante !== undefined && idInfante !== null && idInfante !== "" && Number.isInteger(Number(idInfante)) && Number(idInfante) > 0) {
        condiciones.push("s.id_infante = ?");
        parametros.push(Number(idInfante));
    }
    if (idSeguimiento !== undefined && idSeguimiento !== null && idSeguimiento !== "" && Number.isInteger(Number(idSeguimiento)) && Number(idSeguimiento) > 0) {
        condiciones.push("a.id_seguimiento = ?");
        parametros.push(Number(idSeguimiento));
    }
    if (fecha) {
        condiciones.push("DATE(a.fecha) = ?");
        parametros.push(String(fecha).slice(0, 10));
    }
    if (responsableNombre !== undefined && responsableNombre !== null && String(responsableNombre).trim() !== "") {
        condiciones.push("a.responsable_nombre LIKE ?");
        parametros.push(`%${String(responsableNombre).trim()}%`);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    const [data] = await pool.execute(
        `SELECT
            a.id_accion AS id,
            a.id_accion,
            a.id_seguimiento,
            s.id_infante,
            CONCAT_WS(
                ' ',
                i.nombre,
                i.apellido_paterno,
                i.apellido_materno
            ) AS nombre_completo,
            DATE_FORMAT(a.fecha, '%Y-%m-%dT%H:%i') AS fecha,
            a.observaciones,
            a.acciones_realizadas,
            a.responsable_nombre,
            a.responsable_usuario,
            a.registrado_por
         FROM acciones_seguimiento a
         INNER JOIN seguimientos s
            ON a.id_seguimiento = s.id_seguimiento
         INNER JOIN infantes i
            ON s.id_infante = i.id_infante
         ${where}
         ORDER BY a.id_accion ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...parametros, limite, inicio]
    );
    const [total] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM acciones_seguimiento a
         INNER JOIN seguimientos s
            ON a.id_seguimiento = s.id_seguimiento
         INNER JOIN infantes i
            ON s.id_infante = i.id_infante
         ${where}`,
        parametros
    );

    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "acciones_seguimiento", motivo: "Consulta de lista de acciones de seguimiento" });
    res.json(data);
}

app.get("/acciones_seguimiento", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        if ("id" in req.query) {
            await getMany(req, res);
        } else {
            await getListAccionesSeguimiento(req, res);
        }
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "acciones_seguimiento", motivo: error.message });
        console.error("Error en GET /acciones_seguimiento:", error);
        res.status(500).json({
            error: "Error al consultar las acciones."
        });
    }
});

async function getOneAccionSeguimiento(id, req, res) {
    const [data] = await pool.execute(
        `SELECT
            a.id_accion AS id,
            a.id_accion,
            a.id_seguimiento,
            s.id_infante,
            CONCAT_WS(' ', i.nombre, i.apellido_paterno, i.apellido_materno) AS nombre_completo,
            DATE_FORMAT(a.fecha, '%Y-%m-%dT%H:%i') AS fecha,
            a.observaciones,
            a.acciones_realizadas,
            a.responsable_nombre,
            a.responsable_usuario,
            a.registrado_por
         FROM acciones_seguimiento a
         INNER JOIN seguimientos s ON a.id_seguimiento = s.id_seguimiento
         INNER JOIN infantes i ON s.id_infante = i.id_infante
         WHERE a.id_accion = ?`,
        [id]
    );

    if (data.length === 0) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "acciones_seguimiento", id_registro: id, motivo: "Acción de seguimiento no encontrada" });
        return res.sendStatus(404);
    }

    await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "acciones_seguimiento", id_registro: id, valor_nuevo: data[0] });
    res.json(data[0]);
}

app.get("/acciones_seguimiento/:id", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia", "tutor"), async (req, res) => {
    try {
        await getOneAccionSeguimiento(Number(req.params.id), req, res);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "acciones_seguimiento", id_registro: req.params.id, motivo: error.message });
        console.error("Error al consultar la acción:", error);
        res.status(500).json({
            error: "Error al consultar la acción."
        });
    }
});

async function createAccionSeguimiento(req, res) {
    const {
        id_infante,
        id_seguimiento,
        fecha,
        observaciones,
        acciones_realizadas,
        responsable_nombre,
        responsable_usuario
    } = req.body;

    const usuarioId = req.usuario.id_usuario;

    if (!usuarioId) {
        return res.status(401).json({
            error: "Usuario no autenticado"
        });
    }

    const infanteId = Number(id_infante);
    const seguimientoId = Number(id_seguimiento);
    const fechaTexto = fecha
        ? String(fecha).replace("T", " ").slice(0, 19)
        : "";

    const responsableUsuarioId =
        responsable_usuario === undefined ||
        responsable_usuario === null ||
        responsable_usuario === ""
            ? null
            : Number(responsable_usuario);

    if (
        !Number.isInteger(infanteId) ||
        infanteId <= 0 ||
        !Number.isInteger(seguimientoId) ||
        seguimientoId <= 0 ||
        !fechaTexto ||
        !acciones_realizadas?.trim() ||
        !responsable_nombre?.trim()
    ) {
        return res.status(400).json({
            error: "Completa los campos obligatorios."
        });
    }

    if (
        responsableUsuarioId !== null &&
        (!Number.isInteger(responsableUsuarioId) ||
            responsableUsuarioId <= 0)
    ) {
        return res.status(400).json({
            error: "El usuario responsable no es válido."
        });
    }

    try {
        const [seguimientos] = await pool.execute(
            `SELECT id_seguimiento
             FROM seguimientos
             WHERE id_seguimiento = ?
             AND id_infante = ?`,
            [seguimientoId, infanteId]
        );

        if (seguimientos.length === 0) {
            return res.status(400).json({
                error: "El seguimiento no existe o no pertenece al infante seleccionado."
            });
        }

        const [resultado] = await pool.execute(
            `INSERT INTO acciones_seguimiento (
                id_seguimiento,
                fecha,
                observaciones,
                acciones_realizadas,
                responsable_nombre,
                responsable_usuario,
                registrado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                seguimientoId,
                fechaTexto,
                observaciones?.trim() || null,
                acciones_realizadas.trim(),
                responsable_nombre.trim(),
                responsableUsuarioId,
                usuarioId
            ]
        );

        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "acciones_seguimiento", id_registro: resultado.insertId, valor_nuevo: { id_infante: infanteId, id_seguimiento: seguimientoId, fecha: fechaTexto, observaciones: observaciones?.trim() || null, acciones_realizadas: acciones_realizadas.trim(), responsable_nombre: responsable_nombre.trim(), responsable_usuario: responsableUsuarioId, registrado_por: usuarioId } });
        return res.status(201).json({
            id: resultado.insertId,
            id_accion: resultado.insertId,
            id_infante: infanteId,
            id_seguimiento: seguimientoId,
            fecha: fechaTexto.replace(" ", "T").slice(0, 16),
            observaciones: observaciones?.trim() || null,
            acciones_realizadas: acciones_realizadas.trim(),
            responsable_nombre: responsable_nombre.trim(),
            responsable_usuario: responsableUsuarioId,
            registrado_por: usuarioId
        });
    } catch (error) {
        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "acciones_seguimiento", valor_nuevo: req.body, motivo: error.message });
        console.error("Error al crear acción de seguimiento:", error);

        if (
            error.code === "ER_NO_REFERENCED_ROW_2" ||
            error.code === "ER_NO_REFERENCED_ROW"
        ) {
            return res.status(400).json({
                error: "El seguimiento o alguno de los usuarios indicados no existe."
            });
        }

        return res.status(500).json({
            error: "Ocurrió un error al registrar la acción."
        });
    }
}

app.post("/acciones_seguimiento", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await createAccionSeguimiento(req, res);
    } catch (error) {
        console.error("Error en POST /acciones_seguimiento:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Error al registrar la acción."
            });
        }
    }
});

async function updateAccionSeguimiento(req, res) {
    const idAccion = Number(req.params.id);

    const {
        id_infante,
        id_seguimiento,
        fecha,
        observaciones,
        acciones_realizadas,
        responsable_nombre,
        responsable_usuario
    } = req.body;

    const infanteId = Number(id_infante);
    const seguimientoId = Number(id_seguimiento);
    const fechaTexto = fecha
        ? String(fecha).replace("T", " ").slice(0, 19)
        : "";

    const responsableUsuarioId =
        responsable_usuario === undefined ||
        responsable_usuario === null ||
        responsable_usuario === ""
            ? null
            : Number(responsable_usuario);

    if (
        !Number.isInteger(idAccion) ||
        idAccion <= 0 ||
        !Number.isInteger(infanteId) ||
        infanteId <= 0 ||
        !Number.isInteger(seguimientoId) ||
        seguimientoId <= 0 ||
        !fechaTexto ||
        !acciones_realizadas?.trim() ||
        !responsable_nombre?.trim()
    ) {
        return res.status(400).json({
            error: "Completa los campos obligatorios."
        });
    }

    if (
        responsableUsuarioId !== null &&
        (!Number.isInteger(responsableUsuarioId) ||
            responsableUsuarioId <= 0)
    ) {
        return res.status(400).json({
            error: "El usuario responsable no es válido."
        });
    }

    try {
        const [actuales] = await pool.execute(
            `SELECT * FROM acciones_seguimiento WHERE id_accion = ?`,
            [idAccion]
        );

        if (actuales.length === 0) {
            return res.status(404).json({
                error: "No se encontró la acción."
            });
        }

        const [seguimientos] = await pool.execute(
            `SELECT id_seguimiento
             FROM seguimientos
             WHERE id_seguimiento = ?
             AND id_infante = ?`,
            [seguimientoId, infanteId]
        );

        if (seguimientos.length === 0) {
            return res.status(400).json({
                error: "El seguimiento no existe o no pertenece al infante seleccionado."
            });
        }

        await pool.execute(
            `UPDATE acciones_seguimiento
             SET id_seguimiento = ?,
                 fecha = ?,
                 observaciones = ?,
                 acciones_realizadas = ?,
                 responsable_nombre = ?,
                 responsable_usuario = ?
             WHERE id_accion = ?`,
            [
                seguimientoId,
                fechaTexto,
                observaciones?.trim() || null,
                acciones_realizadas.trim(),
                responsable_nombre.trim(),
                responsableUsuarioId,
                idAccion
            ]
        );

        const [data] = await pool.execute(
            `SELECT
                a.id_accion AS id,
                a.id_accion,
                a.id_seguimiento,
                s.id_infante,
                CONCAT_WS(' ', i.nombre, i.apellido_paterno, i.apellido_materno) AS nombre_completo,
                DATE_FORMAT(a.fecha, '%Y-%m-%dT%H:%i') AS fecha,
                a.observaciones,
                a.acciones_realizadas,
                a.responsable_nombre,
                a.responsable_usuario,
                a.registrado_por
             FROM acciones_seguimiento a
             INNER JOIN seguimientos s ON a.id_seguimiento = s.id_seguimiento
             INNER JOIN infantes i ON s.id_infante = i.id_infante
             WHERE a.id_accion = ?`,
            [idAccion]
        );

        await registrarBitacora(req, { accion: "UPDATE_EXITOSO", entidad: "acciones_seguimiento", id_registro: idAccion, valor_anterior: actuales[0], valor_nuevo: data[0] });
        return res.json(data[0]);
    } catch (error) {
        await registrarBitacora(req, { accion: "UPDATE_FALLIDO", entidad: "acciones_seguimiento", id_registro: idAccion, valor_nuevo: req.body, motivo: error.message });
        console.error("Error al actualizar acción:", error);

        if (
            error.code === "ER_NO_REFERENCED_ROW_2" ||
            error.code === "ER_NO_REFERENCED_ROW"
        ) {
            return res.status(400).json({
                error: "El seguimiento o alguno de los usuarios indicados no existe."
            });
        }

        return res.status(500).json({
            error: "Ocurrió un error al actualizar la acción."
        });
    }
}

app.put("/acciones_seguimiento/:id", autenticarUsuario, autorizarRoles("administrador", "estancia"), async (req, res) => {
    try {
        await updateAccionSeguimiento(req, res);
    } catch (error) {
        console.error("Error en PUT /acciones_seguimiento:", error);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Error al actualizar la acción."
            });
        }
    }
});

//------------------------------------------------------------------------------------------------------------------------------------

app.post("/registrarse", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        let user = req.body.username;
        let pass = req.body.password;

        let [data] = await pool.execute(
            "SELECT id FROM usuarios WHERE usuario = ?",
            [user]
        );

        if (data.length === 0) {
            const hash = await argon2.hash(pass, {
                type: argon2.argon2id,
                memoryCost: 64 * 1024,
                timeCost: 3,
                parallelism: 1,
                saltLength: 128
            });

            const [resultado] = await pool.execute(
                "INSERT INTO usuarios (usuario, password) VALUES (?, ?)",
                [user, hash]
            );
            await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "usuarios", id_registro: resultado.insertId, valor_nuevo: { usuario: user }, motivo: "Registro de usuario" });

            res.sendStatus(201);
        } else {
            await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "usuarios", valor_nuevo: { usuario: user }, motivo: "El usuario ya existe" });
            res.sendStatus(403);
        }
    } catch (error) {
        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "usuarios", valor_nuevo: { usuario: req.body.username }, motivo: error.message });
        res.sendStatus(500);
    }
});

function autenticarUsuario(req, res, next) {
    const encabezado = req.headers.authentication;

    if (!encabezado || !encabezado.startsWith("Bearer ")) {
        return res.status(401).json({
            mensaje: "Se requiere iniciar sesión."
        });
    }

    const token = encabezado.substring(7);

    try {
        const datos = jwt.verify(token, JWT_SECRET);

        req.usuario = {
            id_usuario: datos.id_usuario,
            correo: datos.correo,
            rol: datos.rol
        };

        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: "El token es inválido o ha expirado."
        });
    }
}

function autorizarRoles(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: "No tienes permisos para realizar esta acción."
            });
        }

        next();
    };
}

 // demo
app.post("/login", async (req, res) => {
    try {
        const { correo, password } = req.body;
        if (typeof correo !== "string" || typeof password !== "string" || !correo.trim() || !password) {
            return res.status(400).json({
                mensaje: "El correo y la contraseña son obligatorios."
            });
        }
        const [usuarios] = await pool.execute(
            `SELECT
                u.id_usuario,
                u.nombre,
                u.correo,
                u.password_hash,
                u.id_rol,
                u.estado,
                r.nombre AS rol
             FROM usuarios u
             INNER JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.correo = ?
             LIMIT 1`,
            [correo.trim()]
        );
        if (usuarios.length === 0) {
            await registrarBitacora(req, { accion: "LOGIN_FALLIDO", entidad: "usuarios", valor_nuevo: { correo: correo.trim() }, motivo: "Credenciales incorrectas" });
            return res.status(401).json({
                mensaje: "Credenciales incorrectas."
            });
        }
        const usuario = usuarios[0];
        const passwordGuardada = usuario.password_hash;
        let passwordValida = false;
        if (typeof passwordGuardada === "string" && passwordGuardada.startsWith("$argon2")) {
            // Verificar hashes Argon2 existentes.
            passwordValida = await argon2.verify(passwordGuardada, password);
        } else {
            // Compatibilidad temporal SOLO con contraseñas que se sabe que están almacenadas en texto plano.
            passwordValida = password === passwordGuardada;
            if (passwordValida) {
                const nuevoHash = await argon2.hash(password, ARGON2_OPTIONS);
                await pool.execute(
                    `UPDATE usuarios
                     SET password_hash = ?
                     WHERE id_usuario = ?`,
                    [nuevoHash, usuario.id_usuario]
                );
            }
        }
        if (!passwordValida) {
            await registrarBitacora(req, { accion: "LOGIN_FALLIDO", entidad: "usuarios", valor_nuevo: { correo: correo.trim() }, motivo: "Credenciales incorrectas" });
            return res.status(401).json({
                mensaje: "Credenciales incorrectas."
            });
        }
        if (usuario.estado !== "activo") {
            await registrarBitacora(req, { accion: "LOGIN_FALLIDO", entidad: "usuarios", id_registro: usuario.id_usuario, valor_nuevo: { correo: usuario.correo }, motivo: "La cuenta no está activa" });
            return res.status(403).json({
                mensaje: "La cuenta no está activa."
            });
        }
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                correo: usuario.correo,
                rol: usuario.rol
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        await registrarBitacora(req, { accion: "LOGIN_EXITOSO", entidad: "usuarios", id_registro: usuario.id_usuario, valor_nuevo: { correo: usuario.correo, rol: usuario.rol } });
        return res.json({
            mensaje: "Inicio de sesión correcto.",
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                id_rol: usuario.id_rol,
                rol: usuario.rol
            }
        });
    } catch (error) {
        await registrarBitacora(req, { accion: "LOGIN_FALLIDO", entidad: "usuarios", valor_nuevo: { correo: req.body?.correo }, motivo: error.message });
        console.error("Error en POST /login:", error);
        return res.status(500).json({
            mensaje: "Error interno del servidor."
        });
    }
});

app.get("/usuario-actual", autenticarUsuario, async (req, res) => {
    try {
        const idUsuario = req.usuario.id_usuario;
        const [usuarios] = await pool.execute(
            `SELECT
                id_usuario,
                nombre,
                correo,
                id_rol,
                estado
             FROM usuarios
             WHERE id_usuario = ?
             LIMIT 1`,
            [idUsuario]
        );
        if (usuarios.length === 0) {
            return res.status(404).json({
                mensaje: "El usuario ya no existe."
            });
        }
        if (usuarios[0].estado !== "activo") {
            await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "usuarios", id_registro: idUsuario, motivo: "La cuenta no está activa" });
            return res.status(403).json({
                mensaje: "La cuenta no está activa."
            });
        }

        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "usuarios", id_registro: idUsuario, valor_nuevo: { id_usuario: usuarios[0].id_usuario, nombre: usuarios[0].nombre, correo: usuarios[0].correo, id_rol: usuarios[0].id_rol } });
        return res.json({
            id_usuario: usuarios[0].id_usuario,
            nombre: usuarios[0].nombre,
            correo: usuarios[0].correo,
            id_rol: usuarios[0].id_rol
        });
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "usuarios", id_registro: req.usuario?.id_usuario, motivo: error.message });
        console.error("Error en GET /usuario-actual:", error);
        return res.status(500).json({
            mensaje: "Error al consultar el usuario actual."
        });
    }
});

// Ejecutar una revisión al iniciar el servidor.
detectarMedicionesPendientes()
    .then(resultado => {
        console.log("Revisión inicial:", resultado);
    })
    .catch(error => {
        console.error("Error en la revisión inicial:", error);
    });

// Ejecutar la revisión cada 24 horas.
const revision = 24 * 60 * 60 * 1000;
setInterval(async () => {
    try {
        const resultado = await detectarMedicionesPendientes();
        console.log("Revisión automática:", resultado);
    } catch (error) {
        console.error("Error en la revisión automática:", error);
    }
}, revision);

app.get("/alertas", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia"), async (req, res) => {
    try {
        // Paginación solicitada por React-Admin
        const inicio = Math.max(0, Number.parseInt(req.query._start, 10) || 0);
        const finSolicitado = Number.parseInt(req.query._end, 10);
        const fin = Number.isFinite(finSolicitado) ? Math.max(inicio, finSolicitado) : inicio + 25;
        const limite = Math.min(fin - inicio, 100);
        // Solo permitimos ordenar por columnas conocidas
        const columnasOrdenables = {id: "a.id_alerta", id_alerta: "a.id_alerta", tipo: "a.tipo", estado: "a.estado", creada_en: "a.creada_en",};
        const sortSolicitado = req.query._sort || "creada_en";
        const sortBy = columnasOrdenables[sortSolicitado] || "a.creada_en";
        const sortOrder = String(req.query._order).toUpperCase() === "ASC" ? "ASC" : "DESC";
        // Consultar alertas y nombre del infante
        const [data] = await pool.execute(
            `SELECT
                a.id_alerta AS id,
                a.id_alerta,
                a.id_infante,
                a.id_evaluacion,
                a.tipo,
                a.mensaje,
                a.estado,
                a.creada_en,
                CONCAT_WS(
                    ' ',
                    i.nombre,
                    i.apellido_paterno,
                    i.apellido_materno
                ) AS nombre_completo
             FROM alertas a
             INNER JOIN infantes i
                ON i.id_infante = a.id_infante
             ORDER BY ${sortBy} ${sortOrder}
             LIMIT ? OFFSET ?`,
            [limite, inicio]
        );
        // Total de alertas para la paginación
        const [total] = await pool.execute("SELECT COUNT(*) AS total FROM alertas");
        res.set("Access-Control-Expose-Headers", "X-Total-Count");
        res.set("X-Total-Count", String(total[0].total));
        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "alertas", motivo: "Consulta de lista de alertas" });
        res.json(data);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "alertas", motivo: error.message });
        console.error("Error al consultar alertas:", error);
        res.status(500).json({
            error: "Error al consultar las alertas",
        });
    }
});

async function detectarMedicionesPendientes() {
    // Buscar infantes sin mediciones o con más de 45 días.
    const [infantesPendientes] = await pool.execute(`
        SELECT
            i.id_infante,
            CONCAT_WS(
                ' ',
                i.nombre,
                i.apellido_paterno,
                i.apellido_materno
            ) AS nombre_completo,
            DATE_FORMAT(MAX(m.fecha_medicion), '%Y-%m-%d') AS ultima_medicion,
            DATEDIFF(CURDATE(), MAX(m.fecha_medicion)) AS dias_transcurridos
        FROM infantes i
        LEFT JOIN mediciones_vigentes m
            ON m.id_infante = i.id_infante
        GROUP BY
            i.id_infante,
            i.nombre,
            i.apellido_paterno,
            i.apellido_materno
        HAVING
            MAX(m.fecha_medicion) IS NULL
            OR DATEDIFF(CURDATE(), MAX(m.fecha_medicion)) > 45
    `);
    let creadas = 0;
    let omitidas = 0;
    for (const infante of infantesPendientes) {
        // Solo evitar duplicar alertas que sigan pendientes.
        const [existentes] = await pool.execute(
            `SELECT id_alerta
             FROM alertas
             WHERE id_infante = ?
               AND tipo = 'medicion_pendiente'
               AND estado = 'pendiente'
               AND (
                    ? IS NULL
                    OR DATE(creada_en) > ?
               )
             LIMIT 1`,
            [infante.id_infante, infante.ultima_medicion, infante.ultima_medicion]
        );
        if (existentes.length > 0) {
            omitidas++;
            continue;
        }
        let mensaje;
        if (!infante.ultima_medicion) {
            mensaje = "No hay mediciones registradas para este infante.";
        } else {
            mensaje = `Han transcurrido ${infante.dias_transcurridos} días ` + `desde la última medición (${infante.ultima_medicion}).`;
        }
        await pool.execute(
            `INSERT INTO alertas (
                id_infante,
                id_evaluacion,
                tipo,
                mensaje,
                estado
            ) VALUES (?, NULL, 'medicion_pendiente', ?, 'pendiente')`,
            [infante.id_infante, mensaje]
        );
        creadas++;
    }
    return {
        mensaje: "Detección de mediciones pendientes finalizada.",
        infantesRevisados: infantesPendientes.length,
        alertasCreadas: creadas,
        alertasOmitidas: omitidas
    };
}

app.post("/alertas/detectar-mediciones-pendientes", autenticarUsuario, autorizarRoles("administrador", "coordinador_regional", "estancia"), async (req, res) => {
    try {
        const resultado = await detectarMedicionesPendientes();
        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "alertas", valor_nuevo: resultado, motivo: "Detección manual de mediciones pendientes" });
        res.json(resultado);
    } catch (error) {
        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "alertas", motivo: error.message });
        console.error("Error al detectar mediciones pendientes:", error);
        res.status(500).json({
            error: "No se pudieron detectar las mediciones pendientes."
        });
    }
});

app.get("/usuarios", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        // Paginación
        const inicio = Math.max(0, Number(req.query._start) || 0);
        const fin = Number(req.query._end) || 10;
        const limite = Math.max(1, Math.min(fin - inicio, 100));
        // Ordenamiento
        const sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
        const columnasPermitidas = [
            "id_usuario",
            "nombre",
            "correo",
            "id_rol",
            "estado",
            "creado_en"
        ];
        const sortSolicitado = String(req.query._sort || "id_usuario");
        const sortBy = columnasPermitidas.includes(sortSolicitado) ? sortSolicitado : "id_usuario";
        // Filtros recibidos desde React-Admin
        const condiciones = [];
        const parametros = [];
        const nombre = String(req.query.nombre || "").trim();
        const correo = String(req.query.correo || "").trim();
        const idRol = req.query.id_rol;
        const estado = String(req.query.estado || "").trim();
        if (nombre) {
            condiciones.push("u.nombre LIKE ?");
            parametros.push(`%${nombre}%`);
        }
        if (correo) {
            condiciones.push("u.correo LIKE ?");
            parametros.push(`%${correo}%`);
        }
        if (idRol !== undefined && idRol !== "" && Number.isInteger(Number(idRol)) && Number(idRol) > 0) {
            condiciones.push("u.id_rol = ?");
            parametros.push(Number(idRol));
        }
        const estadosPermitidos = ["activo", "bloqueado", "baja"];
        if (estado) {
            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    mensaje: "El estado seleccionado no es válido."
                });
            }
            condiciones.push("u.estado = ?");
            parametros.push(estado);
        }
        // WHERE dinámico
        const whereSQL = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
        // Consultar usuarios filtrados y paginados
        const [usuarios] = await pool.execute(
            `SELECT
                u.id_usuario AS id,
                u.id_usuario,
                u.nombre,
                u.correo,
                u.id_rol,
                r.nombre AS rol,
                u.estado,
                u.creado_en
             FROM usuarios u
             INNER JOIN roles r ON r.id_rol = u.id_rol
             ${whereSQL}
             ORDER BY u.\`${sortBy}\` ${sortOrder}
             LIMIT ? OFFSET ?`,
            [...parametros, limite, inicio]
        );
        // Contar únicamente los usuarios que coinciden con los filtros
        const [total] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM usuarios u
             INNER JOIN roles r ON r.id_rol = u.id_rol
             ${whereSQL}`,
            parametros
        );
        res.set("Access-Control-Expose-Headers", "X-Total-Count");
        res.set("X-Total-Count", String(total[0].total));
        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "usuarios", valor_nuevo: { total: total[0].total }, motivo: "Consulta de lista de usuarios" });
        res.json(usuarios);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "usuarios", motivo: error.message });
        console.error("Error en GET /usuarios:", error);
        res.status(500).json({
            mensaje: "Error al consultar usuarios."
        });
    }
});

app.get("/roles", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        const inicio = Math.max(0, Number(req.query._start) || 0);
        const fin = Number(req.query._end) || 100;
        const limite = Math.max(1, Math.min(fin - inicio, 100));
        const [roles] = await pool.execute(
            `SELECT
                id_rol AS id,
                id_rol,
                nombre
             FROM roles
             ORDER BY nombre ASC
             LIMIT ? OFFSET ?`,
            [limite, inicio]
        );
        const [total] = await pool.execute("SELECT COUNT(*) AS total FROM roles");
        res.set("Access-Control-Expose-Headers", "X-Total-Count");
        res.set("X-Total-Count", String(total[0].total));
        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "roles", valor_nuevo: { total: total[0].total }, motivo: "Consulta de lista de roles" });
        res.json(roles);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "roles", motivo: error.message });
        console.error("Error en GET /roles:", error);
        res.status(500).json({
            mensaje: "Error al consultar roles."
        });
    }
});

app.post("/usuarios", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        const { nombre, correo, password, id_rol, estado } = req.body;
        if ( typeof nombre !== "string" || !nombre.trim() || typeof correo !== "string" || !correo.trim() || typeof password !== "string" || !password || !Number.isInteger(Number(id_rol)) || Number(id_rol) <= 0) {
            return res.status(400).json({
                mensaje: "Nombre, correo, contraseña y rol son obligatorios."
            });
        }
        const nombreLimpio = nombre.trim();
        const correoLimpio = correo.trim().toLowerCase();
        const estadoFinal = estado ?? "activo";
        if (nombreLimpio.length > 150 || correoLimpio.length > 254) {
            return res.status(400).json({
                mensaje: "El nombre o el correo excede la longitud permitida."
            });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            return res.status(400).json({
                mensaje: "El correo electrónico no tiene un formato válido."
            });
        }
        if (!["activo", "bloqueado", "baja"].includes(estadoFinal)) {
            return res.status(400).json({
                mensaje: "El estado indicado no es válido."
            });
        }
        const [roles] = await pool.execute(
            "SELECT id_rol FROM roles WHERE id_rol = ?",
            [Number(id_rol)]
        );
        if (roles.length === 0) {
            return res.status(400).json({
                mensaje: "El rol seleccionado no existe."
            });
        }
        const [existentes] = await pool.execute(
            "SELECT id_usuario FROM usuarios WHERE correo = ?",
            [correoLimpio]
        );
        if (existentes.length > 0) {
            return res.status(409).json({
                mensaje: "Ya existe un usuario registrado con ese correo."
            });
        }
        const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);
        const [resultado] = await pool.execute(
            `INSERT INTO usuarios
                (nombre, correo, password_hash, id_rol, estado)
             VALUES (?, ?, ?, ?, ?)`,
            [nombreLimpio, correoLimpio, passwordHash, Number(id_rol), estadoFinal]
        );
        const [nuevoUsuario] = await pool.execute(
            `SELECT
                u.id_usuario AS id,
                u.id_usuario,
                u.nombre,
                u.correo,
                u.id_rol,
                r.nombre AS rol,
                u.estado,
                u.creado_en
             FROM usuarios u
             INNER JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = ?`,
            [resultado.insertId]
        );

        await registrarBitacora(req, { accion: "CREATE_EXITOSO", entidad: "usuarios", id_registro: resultado.insertId, valor_nuevo: { nombre: nombreLimpio, correo: correoLimpio, id_rol: Number(id_rol), estado: estadoFinal }, motivo: "Creación de usuario" });
        return res.status(201).json(nuevoUsuario[0]);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "Ya existe un usuario registrado con ese correo."
            });
        }

        await registrarBitacora(req, { accion: "CREATE_FALLIDO", entidad: "usuarios", valor_nuevo: { nombre: req.body?.nombre, correo: req.body?.correo }, motivo: error.message });
        console.error("Error en POST /usuarios:", error);
        return res.status(500).json({
            mensaje: "Error interno al crear el usuario."
        });
    }
});

app.get("/usuarios/:id", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: "El ID del usuario no es válido."
            });
        }
        const [usuarios] = await pool.execute(
            `SELECT
                u.id_usuario AS id,
                u.id_usuario,
                u.nombre,
                u.correo,
                u.id_rol,
                r.nombre AS rol,
                u.estado,
                u.creado_en
             FROM usuarios u
             INNER JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = ?
             LIMIT 1`,
            [id]
        );
        if (usuarios.length === 0) {
            await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "usuarios", id_registro: id, motivo: "El usuario no existe" });
            return res.status(404).json({
                mensaje: "El usuario no existe."
            });
        }

        await registrarBitacora(req, { accion: "READ_EXITOSO", entidad: "usuarios", id_registro: id, valor_nuevo: usuarios[0], motivo: "Consulta de usuario por ID" });
        return res.json(usuarios[0]);
    } catch (error) {
        await registrarBitacora(req, { accion: "READ_FALLIDO", entidad: "usuarios", id_registro: Number(req.params.id) || null, motivo: error.message });
        console.error("Error en GET /usuarios/:id:", error);

        return res.status(500).json({
            mensaje: "Error al consultar el usuario."
        });
    }
});

app.put("/usuarios/:id", autenticarUsuario, autorizarRoles("administrador"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: "El ID del usuario no es válido."
            });
        }
        const {nombre, correo, password, id_rol, estado} = req.body;
        if (typeof nombre !== "string" || !nombre.trim() || typeof correo !== "string" || !correo.trim() || !Number.isInteger(Number(id_rol)) || Number(id_rol) <= 0 || !["activo", "bloqueado", "baja"].includes(estado)) {
            return res.status(400).json({
                mensaje: "Verifica el nombre, correo, rol y estado."
            });
        }
        const nombreLimpio = nombre.trim();
        const correoLimpio = correo.trim().toLowerCase();
        if (nombreLimpio.length > 150 || correoLimpio.length > 254) {
            return res.status(400).json({
                mensaje: "El nombre o correo excede la longitud permitida."
            });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            return res.status(400).json({
                mensaje: "El correo no tiene un formato válido."
            });
        }
        // La contraseña es opcional al editar. Si se envía, debe ser una cadena.
        if (password !== undefined && password !== null && typeof password !== "string") {
            return res.status(400).json({
                mensaje: "La contraseña debe ser un texto válido."
            });
        }
        const [usuarios] = await pool.execute(
            "SELECT id_usuario, nombre, correo, id_rol, estado FROM usuarios WHERE id_usuario = ?",
            [id]
        );
        if (usuarios.length === 0) {
            return res.status(404).json({
                mensaje: "El usuario no existe."
            });
        }
        const [roles] = await pool.execute(
            "SELECT id_rol FROM roles WHERE id_rol = ?",
            [Number(id_rol)]
        );
        if (roles.length === 0) {
            return res.status(400).json({
                mensaje: "El rol seleccionado no existe."
            });
        }
        const [duplicados] = await pool.execute(
            `SELECT id_usuario
             FROM usuarios
             WHERE correo = ? AND id_usuario <> ?`,
            [correoLimpio, id]
        );
        if (duplicados.length > 0) {
            return res.status(409).json({
                mensaje: "Ese correo ya está registrado por otro usuario."
            });
        }
        // Si se proporcionó una contraseña no vacía, generar el hash con los parámetros Argon2id configurados.
        if (typeof password === "string" && password.length > 0) {
            const passwordHash = await argon2.hash(password, ARGON2_OPTIONS);
            await pool.execute(
                `UPDATE usuarios
                 SET nombre = ?,
                     correo = ?,
                     id_rol = ?,
                     estado = ?,
                     password_hash = ?
                 WHERE id_usuario = ?`,
                [nombreLimpio, correoLimpio, Number(id_rol), estado, passwordHash, id]
            );
        } else {
            // Si la contraseña no se proporcionó o está vacía, conservar el hash existente.
            await pool.execute(
                `UPDATE usuarios
                 SET nombre = ?,
                     correo = ?,
                     id_rol = ?,
                     estado = ?
                 WHERE id_usuario = ?`,
                [nombreLimpio, correoLimpio, Number(id_rol), estado, id]
            );
        }
        const [actualizados] = await pool.execute(
            `SELECT
                u.id_usuario AS id,
                u.id_usuario,
                u.nombre,
                u.correo,
                u.id_rol,
                r.nombre AS rol,
                u.estado,
                u.creado_en
             FROM usuarios u
             INNER JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = ?`,
            [id]
        );

        await registrarBitacora(req, { accion: "UPDATE_EXITOSO", entidad: "usuarios", id_registro: id, valor_anterior: usuarios[0], valor_nuevo: actualizados[0], motivo: "Actualización de usuario" });
        return res.json(actualizados[0]);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "Ese correo ya está registrado."
            });
        }
        await registrarBitacora(req, { accion: "UPDATE_FALLIDO", entidad: "usuarios", id_registro: Number(req.params.id) || null, valor_nuevo: { nombre: req.body?.nombre, correo: req.body?.correo, id_rol: req.body?.id_rol, estado: req.body?.estado }, motivo: error.message });
        console.error("Error en PUT /usuarios/:id:", error);
        return res.status(500).json({
            mensaje: "Error interno al actualizar el usuario."
        });
    }
});

//-------------------------------------------------------------------------------------------------------------------------------------

const options = {
    key: fs.readFileSync("backend.key"),
    cert: fs.readFileSync("backend.crt")
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`Backend corriendo con HTTPS en puerto ${PORT}`);
});