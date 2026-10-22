//Definition of modules
//Imports the required modules
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require("dotenv").config();

//Creates the Express server
const app = express();
const PORT = 3000; //Port the server will listen on


//Enables CORS and JSON request handling
app.use(cors());

//app.use(express.json());
const bodyParser=require("body-parser")
const argon2=require("argon2");
const jwt=require("jsonwebtoken");
app.use(bodyParser.json());
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MiB en KiB
    timeCost: 3,       // 3 iteraciones
    parallelism: 1     // 1 hilo
};

//Creates a MySQL connection pool
const pool = mysql.createPool({
    host: '172.23.192.1',
    user: 'root',
    password: '12042203Y@yo',
    database: 'issste_padron'
}).promise();

//clave para firmar los tokens
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Falta configurar la variable de entorno JWT_SECRET.");
}

//Funciones de referencia------------------------------------------------------------------------------------
async function getMany(collection, req, res) {
    let ids = req.query.id;

    if (!Array.isArray(ids)) {
        ids = ids === undefined ? [] : [ids];
    }

    ids = ids.map(Number);

    if (ids.length === 0) {
        return res.json([]);
    }

    let placeholders = ids.map(() => "?").join(",");

    let [data] = await pool.execute(
        `SELECT * FROM \`${collection}\`
         WHERE id IN (${placeholders})`,
        ids
    );

    res.json(data);
}

async function getManyReference(collection, req, res) {
    let target = req.query.target;
    let id = req.query.id;

    const columnas = ["id", "nombre", "precio"]; // Ajustar a las columnas reales

    if (!columnas.includes(target)) {
        return res.status(400).json({ error: "Referencia inválida" });
    }

    let [data] = await pool.execute(
        `SELECT * FROM \`${collection}\` WHERE \`${target}\` = ?`,
        [id]
    );

    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(data.length));
    res.json(data);
}

async function getOne(collection, id, req, res) {
    let [data] = await pool.execute(
        `SELECT * FROM \`${collection}\` WHERE id = ?`,
        [id]
    );

    if (data.length === 0) {
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

async function updateData(collection, req, res) {
    let valores = { ...req.body };
    let id = Number(req.params.id);

    delete valores.id;

    let campos = Object.keys(valores);

    if (campos.length === 0) {
        return getOne(collection, id, req, res);
    }

    let asignaciones = campos
        .map(campo => `\`${campo}\` = ?`)
        .join(", ");

    let parametros = campos.map(campo => valores[campo]);
    parametros.push(id);

    await pool.execute(
        `UPDATE \`${collection}\`
         SET ${asignaciones}
         WHERE id = ?`,
        parametros
    );

    await getOne(collection, id, req, res);
}

async function deleteData(collection, id, req, res) {
    let [data] = await pool.execute(
        `DELETE FROM \`${collection}\` WHERE id = ?`,
        [id]
    );

    res.json({ id, affectedRows: data.affectedRows });
}

async function createData(collection, req, res) {
    let valores = { ...req.body };

    delete valores.id;

    let campos = Object.keys(valores);

    if (campos.length === 0) {
        return res.status(400).json({ error: "No hay datos" });
    }

    let nombres = campos
        .map(campo => `\`${campo}\``)
        .join(", ");

    let placeholders = campos.map(() => "?").join(", ");
    let parametros = campos.map(campo => valores[campo]);

    let [data] = await pool.execute(
        `INSERT INTO \`${collection}\` (${nombres})
         VALUES (${placeholders})`,
        parametros
    );

    await getOne(collection, data.insertId, req, res);
}









app.get("/tutores", async (req, res) => {
    try {
        let sortBy;
        let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

        let inicio = Number(req.query._start) || 0;
        let fin = Number(req.query._end) || 10;
        let limite = fin - inicio;

        const columnas = [
            "id",
            "id_tutor",
            "nombre_tutor",
            "telefono",
            "correo",
            "id_usuario"
        ];

        if (!columnas.includes(sortBy)) {
            sortBy = "id_tutor";
        }

        const [data] = await pool.execute(
            `SELECT
                id_tutor AS id,
                id_tutor,
                nombre as nombre_tutor,
                telefono,
                correo,
                id_usuario
             FROM tutores
             ORDER BY \`${sortBy}\` ${sortOrder}
             LIMIT ? OFFSET ?`,
            [limite, inicio]
        );

        const [total] = await pool.execute(
            "SELECT COUNT(*) AS total FROM tutores"
        );

        res.set("Access-Control-Expose-Headers", "X-Total-Count");
        res.set("X-Total-Count", String(total[0].total));

        res.json(data);
    } catch (error) {
        console.error("Error al consultar tutores:", error);
        res.status(500).json({
            error: "Error al consultar tutores"
        });
    }
});


app.post("/tutores", async (req, res) => {
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

        res.status(201).json(rows[0]);
    } catch (error) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/tutores/:id", async (req, res) => {
    try {
        await getOneTutor("tutores", Number(req.params.id), req, res);
    } catch (error) {
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
    return res.json(data);
}

app.get("/infantes", async (req, res) => {
    try {
        let token = req.get("Authentication");
        console.log("Token recibido:", token);
        // await jwt.verify(token, "admin123");

        if ("target" in req.query) {
            await getManyReference("infantes", req, res);
        } else if ("id_infante" in req.query) {
            await getMany("infantes", req, res);
        } else {
            await getListInfantes("infantes", req, res);
        }

    } catch (error) {
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

    // const creado_por = req.user?.id_usuario;

    // if (!creado_por) {
    //     return res.status(401).json({
    //         error: "Usuario no autenticado"
    //     });
    // }

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
                1
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

app.post("/infantes", async (req, res) => {
    try {
        await createInfante(req, res);
    } catch (error) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/infantes/:id", async (req, res) => {
    try {
        await getOneInfante("infantes", Number(req.params.id), req, res);
    } catch (error) {
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

        return res.json(datos[0]);

    } catch (error) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (errorRollback) {
                console.error("Error al cancelar la transacción:", errorRollback);
            }
        }

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

app.put("/infantes/:id", async (req, res) => {
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
    res.json(data);
}

app.get("/regiones", async (req, res) => {
    try {
        let token = req.get("Authentication");
        // await jwt.verify(token, "admin123");

        if ("target" in req.query) {
            console.log("estoy entrando a donde no deberia1");
            await getManyReference("regiones", req, res);
        } else if ("id_region" in req.query) {
            console.log("estoy entrando a donde no deberia2");
            await getMany("regiones", req, res);
        } else {
            await getListRegiones("regiones", req, res);
        }

    } catch (error) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/regiones/:id", async (req, res) => {
    try {
        await getOneRegion("regiones", Number(req.params.id), req, res);
    } catch (error) {
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
    res.json(data);
}

app.get("/estados", async (req, res) => {
    try {
        let token = req.get("Authentication");
        // await jwt.verify(token, "admin123");

        if ("target" in req.query) {
            await getManyReference("estados", req, res);
        } else if ("id_estado" in req.query) {
            await getMany("estados", req, res);
        } else {
            await getListEstados("estados", req, res);
        }

    } catch (error) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/estados/:id", async (req, res) => {
    try {
        await getOneEstado("estados", Number(req.params.id), req, res);
    } catch (error) {
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
    res.json(data);
}

app.get("/ebdis", async (req, res) => {
    try {
        let token = req.get("Authentication");
        // await jwt.verify(token, "admin123");

        if ("target" in req.query) {
            await getManyReference("ebdi", req, res);
        } else if ("id_ebdi" in req.query) {
            await getMany("ebdi", req, res);
        } else {
            await getListEbdi("ebdi", req, res);
        }

    } catch (error) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/ebdis/:id", async (req, res) => {
    try {
        await getOneEbdi("ebdis", Number(req.params.id), req, res);
    } catch (error) {
        res.sendStatus(500);
        throw error;
    }
});

//---------------------------------------------------------------------------------------------------------------

async function getListMediciones(collection, req, res) {
    let sortBy = req.query._sort || "id_medicion";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = fin - inicio;

    // Validar la columna por la que se ordenará
    if (true) {
        sortBy = "id_medicion";
    }

    // Consultar registros
    let [data] = await pool.execute(
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

        WHERE m.id_medicion = (
            SELECT m2.id_medicion
            FROM mediciones_vigentes m2
            WHERE m2.id_infante = m.id_infante
            ORDER BY m2.fecha_medicion DESC, m2.id_medicion DESC
            LIMIT 1
        )

        ORDER BY m.id_medicion ${sortOrder}
        LIMIT ? OFFSET ?`,
        [limite, inicio]
    );

    // Consultar total de infantes que tienen mediciones
    let [total] = await pool.execute(
        `SELECT COUNT(DISTINCT id_infante) AS total
         FROM mediciones_vigentes`
    );

    // Enviar total para la paginación de React Admin
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    res.json(data);
}

app.get("/mediciones", async (req, res) => {
    try {
        let token = req.get("Authentication");
        // await jwt.verify(token, "admin123");

        if ("target" in req.query) {
            await getManyReference("mediciones", req, res);
        } else if ("id" in req.query) {
            await getMany("mediciones", req, res);
        } else {
            await getListMediciones("mediciones", req, res);
        }

    } catch (error) {
        console.error("Error en GET /mediciones:", error);
        res.status(500).json({ error: error.message });
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

    // ID temporal hasta terminar la autenticación.
    const usuarioId = 1;

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
            [id_infante, id_ebdi_captura, usuarioId]
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
                usuarioId
            ]
        );

        await connection.commit();

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

app.post("/mediciones", async (req, res) => {
    try {
        await createMedicion(req, res);
    } catch (error) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/mediciones/:id", async (req, res) => {
    try {
        await getOneMedicion("mediciones", Number(req.params.id), req, res);
    } catch (error) {
        res.sendStatus(500);
        throw error;
    }
});


async function updateMedicion(req, res) {
    const id_medicion = Number(req.params.id);
    const usuarioId = 1; // Temporal, mientras se implementa la autenticación real.

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
                usuarioId
            ]
        );

        //Confirmar la transacción
        await connection.commit();

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

app.put("/mediciones/:id", async (req, res) => {
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
    res.json(data);
}

app.get("/seguimientos", async (req, res) => {
    try {
        let token = req.get("Authentication");
        // await jwt.verify(token, "admin123");

        if ("target" in req.query) {
            await getManyReference("seguimientos", req, res);
        } else if ("id_seguimiento" in req.query) {
            await getMany("seguimientos", req, res);
        } else {
            await getListSeguimientos("seguimientos", req, res);
        }

    } catch (error) {
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

    const usuarioId = 1; // Temporal hasta conectar la autenticación.

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
                usuarioId
            ]
        );

        await conexion.commit();

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

app.post("/seguimientos", async (req, res) => {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/seguimientos/:id", async (req, res) => {
    try {
        await getOneSeguimiento("seguimientos", Number(req.params.id), req, res);
    } catch (error) {
        res.sendStatus(500);
        throw error;
    }
});


async function updateSeguimiento(req, res) {
    const idSeguimiento = Number(req.params.id);
    const usuarioId = 1; // Temporal hasta conectar la autenticación.

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

    const fechaConvertida = convertirFecha(fechaTexto);

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

app.put("/seguimientos/:id", async (req, res) => {
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
    res.json(data);
}

app.get("/condiciones", async (req, res) => {
    try {
        if ("target" in req.query) {
            await getListCondiciones(req, res);
        } else if ("id_condicion" in req.query) {
            await getMany(req, res);
        } else {
            await getListCondiciones(req, res);
        }
    } catch (error) {
        console.error("Error en GET /condiciones:", error);
        res.status(500).json({
            error: "Error al consultar las condiciones de salud."
        });
    }
});

async function getOneCondicion(id, res) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/condiciones/:id", async (req, res) => {
    try {
        await getOneCondicion(Number(req.params.id), res);
    } catch (error) {
        console.error("Error en GET /condiciones/:id:", error);
        res.status(500).json({
            error: "Error al consultar la condición."
        });
    }
});

async function createCondicion(req, res) {
    const { id_infante, fecha_registro, descripcion } = req.body;
    const usuarioId = 1; // Temporal hasta conectar la autenticación.

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

        return res.status(201).json({
            id: resultado.insertId,
            id_condicion: resultado.insertId,
            id_infante: infanteId,
            descripcion: descripcion.trim(),
            fecha_registro: fechaTexto,
            registrado_por: usuarioId
        });
    } catch (error) {
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

app.post("/condiciones", async (req, res) => {
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
            `SELECT id_condicion
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

        return res.json(data[0]);
    } catch (error) {
        console.error("Error al actualizar condición:", error);

        return res.status(500).json({
            error: "Ocurrió un error al actualizar la condición."
        });
    }
}

app.put("/condiciones/:id", async (req, res) => {
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
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || inicio + 10;
    let limite = fin - inicio;

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
         ORDER BY a.id_accion ${sortOrder}
         LIMIT ? OFFSET ?`,
        [limite, inicio]
    );

    const [total] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM acciones_seguimiento`
    );

    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    res.json(data);
}

app.get("/acciones_seguimiento", async (req, res) => {
    try {
        if ("id" in req.query) {
            await getMany(req, res);
        } else {
            await getListAccionesSeguimiento(req, res);
        }
    } catch (error) {
        console.error("Error en GET /acciones_seguimiento:", error);
        res.status(500).json({
            error: "Error al consultar las acciones."
        });
    }
});

async function getOneAccionSeguimiento(id, res) {
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
        return res.sendStatus(404);
    }

    res.json(data[0]);
}

app.get("/acciones_seguimiento/:id", async (req, res) => {
    try {
        await getOneAccionSeguimiento(
            Number(req.params.id),
            res
        );
    } catch (error) {
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

    const usuarioId = 1; // Temporal hasta conectar la autenticación.

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

app.post("/acciones_seguimiento", async (req, res) => {
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
            `SELECT id_accion
             FROM acciones_seguimiento
             WHERE id_accion = ?`,
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

        return res.json(data[0]);
    } catch (error) {
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

app.put("/acciones_seguimiento/:id", async (req, res) => {
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











app.get("/Productos/:id", async (req, res) => {
    try {
        await getOne("productos", Number(req.params.id), req, res);
    } catch (error) {
        res.sendStatus(500);
    }
});


app.put("/Productos/:id", async (req, res) => {
    try {
        await updateData("productos", req, res);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.delete("/Productos/:id", async (req, res) => {
    try {
        await deleteData("productos", Number(req.params.id), req, res);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/Productos/", async (req, res) => {
    try {
        await createData("productos", req, res);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.post("/registrarse", async (req, res) => {
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

            await pool.execute(
                "INSERT INTO usuarios (usuario, password) VALUES (?, ?)",
                [user, hash]
            );

            res.sendStatus(201);
        } else {
            res.sendStatus(403);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});



function autenticarUsuario(req, res, next) {
    const encabezado = req.headers.authorization;

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
            return res.status(401).json({
                mensaje: "Credenciales incorrectas."
            });
        }
        if (usuario.estado !== "activo") {
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
            return res.status(403).json({
                mensaje: "La cuenta no está activa."
            });
        }
        return res.json({
            id_usuario: usuarios[0].id_usuario,
            nombre: usuarios[0].nombre,
            correo: usuarios[0].correo,
            id_rol: usuarios[0].id_rol
        });
    } catch (error) {
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

app.listen(PORT, async () => {
    console.log("Backend corriendo en puerto 3000");
});

app.get("/alertas", async (req, res) => {
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
        res.json(data);
    } catch (error) {
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

app.post("/alertas/detectar-mediciones-pendientes", async (req, res) => {
    try {
        const resultado = await detectarMedicionesPendientes();
        res.json(resultado);
    } catch (error) {
        console.error("Error al detectar mediciones pendientes:", error);
        res.status(500).json({
            error: "No se pudieron detectar las mediciones pendientes."
        });
    }
});

app.get("/usuarios", async (req, res) => {
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
        res.json(usuarios);
    } catch (error) {
        console.error("Error en GET /usuarios:", error);
        res.status(500).json({
            mensaje: "Error al consultar usuarios."
        });
    }
});

app.get("/roles", async (req, res) => {
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
        res.json(roles);
    } catch (error) {
        console.error("Error en GET /roles:", error);
        res.status(500).json({
            mensaje: "Error al consultar roles."
        });
    }
});

app.post("/usuarios", async (req, res) => {
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
        return res.status(201).json(nuevoUsuario[0]);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "Ya existe un usuario registrado con ese correo."
            });
        }
        console.error("Error en POST /usuarios:", error);
        return res.status(500).json({
            mensaje: "Error interno al crear el usuario."
        });
    }
});

app.get("/usuarios/:id", async (req, res) => {
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
            return res.status(404).json({
                mensaje: "El usuario no existe."
            });
        }
        return res.json(usuarios[0]);
    } catch (error) {
        console.error("Error en GET /usuarios/:id:", error);

        return res.status(500).json({
            mensaje: "Error al consultar el usuario."
        });
    }
});

app.put("/usuarios/:id", async (req, res) => {
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
            "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
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
        return res.json(actualizados[0]);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "Ese correo ya está registrado."
            });
        }
        console.error("Error en PUT /usuarios/:id:", error);
        return res.status(500).json({
            mensaje: "Error interno al actualizar el usuario."
        });
    }
});