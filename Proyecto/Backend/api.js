//Definition of modules
//Imports the required modules
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

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

// async function getList(collection, columnas, req, res) {
//     let sortBy = req.query._sort || "id";
//     let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";
//     let inicio = Number(req.query._start) || 0;
//     let fin = Number(req.query._end) || 10;
//     let limite = Math.max(0, fin - inicio);

//     // Validar la columna por la que se ordenará
//     if (!columnas.includes(sortBy)) {
//         sortBy = "id";
//     }

//     // Consultar registros
//     let [data] = await pool.execute(
//         `SELECT * FROM \`${collection}\`
//         ORDER BY \`${sortBy}\` ${sortOrder}
//         LIMIT ? OFFSET ?`,
//         [limite, inicio]
//     );

//     // Consultar total de registros
//     let [total] = await pool.execute(
//         `SELECT COUNT(*) AS total FROM \`${collection}\``
//     );

//     // Enviar total para la paginación de React Admin
//     res.set("Access-Control-Expose-Headers", "X-Total-Count");
//     res.set("X-Total-Count", String(total[0].total));
//     res.json(data);
// }

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
        let sortBy = req.query._sort || "id";
        let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

        let inicio = Math.max(0, Number(req.query._start) || 0);
        let fin = Number(req.query._end) || 10;
        let limite = Math.max(0, fin - inicio);

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
    let sortBy = req.query._sort || "id_infante";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = Math.max(0, fin - inicio);

    // Validar la columna por la que se ordenará
    if (true) {
        sortBy = "id_infante";
    }

    // Consultar registros
    // Consultar una sola fila por infante
    let [data] = await pool.execute(
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

        ORDER BY i.id_infante ${sortOrder}
        LIMIT ? OFFSET ?`,
        [limite, inicio]
    );

    // Consultar total de registros
    let [total] = await pool.execute(
        `SELECT COUNT(*) AS total FROM infantes;`
    );

    // Enviar total para la paginación de React Admin
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.set("X-Total-Count", String(total[0].total));
    res.json(data);
}

app.get("/infantes", async (req, res) => {
    try {
        let token = req.get("Authentication");
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
    let sortBy = req.query._sort || "id_region";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = Math.max(0, fin - inicio);

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
            await getManyReference("regiones", req, res);
        } else if ("id_region" in req.query) {
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
    let limite = Math.max(0, fin - inicio);

    // Validar la columna por la que se ordenará
    if (true) {
        sortBy = "id_estado";
    }

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
    let sortBy = req.query._sort || "id_ebdi";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = Math.max(0, fin - inicio);

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
    let limite = Math.max(0, fin - inicio);

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
            m.fecha_medicion,
            m.peso_kg,
            m.talla_cm,
            m.perimetro_cefalico_cm,
            m.observaciones

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

//---------------------------------------------------------------------------------------------------------------

async function getListSeguimientos(collection, req, res) {
    let sortBy = req.query._sort || "id_seguimiento";
    let sortOrder = req.query._order === "ASC" ? "ASC" : "DESC";

    let inicio = Number(req.query._start) || 0;
    let fin = Number(req.query._end) || 10;
    let limite = Math.max(0, fin - inicio);

    // Validar la columna por la que se ordenará
    if (true) {
        sortBy = "id_seguimiento";
    }

    // Consultar registros
    let [data] = await pool.execute(
        `SELECT 
            s.id_seguimiento AS id,
            s.id_infante,
            s.fecha_apertura,
            s.motivo,
            s.estado,
            a.responsable_nombre,
            a.observaciones,
            a.acciones_realizadas

        FROM acciones_seguimiento a
        JOIN seguimientos s 
        USING (id_seguimiento)
        ORDER BY \`${sortBy}\` ${sortOrder}
        LIMIT ? OFFSET ?`,
        [limite, inicio]
        
    );
    
    // Consultar total de registros
    let [total] = await pool.execute(
        `SELECT COUNT(*) AS total FROM seguimientos`
    );

    // Enviar total para la paginación de React Admin
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
        } else if ("id" in req.query) {
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
        fecha_apertura,
        motivo,
        estado,
        observaciones,
        acciones_realizadas,
        responsable_nombre
    } = req.body;

    // Usuario temporal hasta conectar la autenticación
    const usuarioId = 1;

    // Validar campos obligatorios
    if (
        !id_infante ||
        !fecha_apertura ||
        !motivo?.trim() ||
        !estado ||
        !responsable_nombre?.trim() ||
        !acciones_realizadas?.trim()
    ) {
        return res.status(400).json({
            error: "Todos los campos obligatorios deben completarse."
        });
    }

    const estadosValidos = [
        "requiere_seguimiento",
        "en_seguimiento",
        "concluido"
    ];

    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
            error: "El estado del seguimiento no es válido."
        });
    }

    // Un seguimiento concluido necesita una fecha de cierre.
    // En este formulario solo se crean seguimientos abiertos.
    if (estado === "concluido") {
        return res.status(400).json({
            error: "No puedes crear un seguimiento concluido desde este formulario."
        });
    }

    const conexion = await pool.getConnection();
    let transaccionIniciada = false;

    try {
        await conexion.beginTransaction();
        transaccionIniciada = true;

        // Crear el seguimiento
        const [resultado] = await conexion.execute(
            `INSERT INTO seguimientos
                (id_infante, id_condicion, motivo, estado,
                 fecha_apertura, creado_por)
             VALUES (?, NULL, ?, ?, ?, ?)`,
            [
                id_infante,
                motivo,
                estado,
                fecha_apertura,
                usuarioId
            ]
        );

        const idSeguimiento = resultado.insertId;

        // Registrar la primera acción del seguimiento
        await conexion.execute(
            `INSERT INTO acciones_seguimiento
                (id_seguimiento, fecha, observaciones,
                 acciones_realizadas, responsable_nombre, registrado_por)
             VALUES (?, NOW(), ?, ?, ?, ?)`,
            [
                idSeguimiento,
                observaciones || null,
                acciones_realizadas,
                responsable_nombre,
                usuarioId
            ]
        );

        await conexion.commit();
        transaccionIniciada = false;

        // Respuesta que React Admin necesita: debe incluir "id"
        return res.status(201).json({
            id: idSeguimiento,
            id_seguimiento: idSeguimiento,
            id_infante,
            id_condicion: null,
            fecha_apertura,
            motivo,
            estado
        });

    } catch (error) {
        if (transaccionIniciada) {
            await conexion.rollback();
        }

        console.error("Error al crear seguimiento:", error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                error: "El infante o el usuario indicado no existe."
            });
        }

        if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
            return res.status(400).json({
                error: "Los datos no cumplen las reglas del seguimiento."
            });
        }

        return res.status(500).json({
            error: "Ocurrió un error al registrar el seguimiento."
        });

    } finally {
        conexion.release();
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
    let [data] = await pool.execute(
        `SELECT 
            s.id_seguimiento AS id,
            s.id_infante,
            s.fecha_apertura,
            s.motivo,
            s.estado,
            a.responsable_nombre,
            a.observaciones,
            a.acciones_realizadas

        FROM acciones_seguimiento a
        JOIN seguimientos s 
        USING (id_seguimiento)

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

//---------------------------------------------------------------------------------------------------------------



















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

        if (
            typeof correo !== "string" ||
            typeof password !== "string" ||
            !correo.trim() ||
            !password
        ) {
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

        // Comprobación temporal sin cifrado.
        // Solo funciona si el valor recibido coincide exactamente
        // con el valor almacenado en password_hash.
        if (password !== usuario.password_hash) {
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
const UN_DIA = 24 * 60 * 60 * 1000;

setInterval(async () => {
    try {
        const resultado = await detectarMedicionesPendientes();
        console.log("Revisión automática:", resultado);
    } catch (error) {
        console.error("Error en la revisión automática:", error);
    }
}, UN_DIA);

app.listen(PORT, async () => {
    console.log("Backend corriendo en puerto 3000");
});


app.get("/alertas", async (req, res) => {
    try {
        // Paginación solicitada por React-Admin
        const inicio = Math.max(
            0,
            Number.parseInt(req.query._start, 10) || 0
        );
        const finSolicitado = Number.parseInt(req.query._end, 10);
        const fin = Number.isFinite(finSolicitado) ? Math.max(inicio, finSolicitado) : inicio + 25;
        const limite = Math.min(fin - inicio, 100);
        // Solo permitimos ordenar por columnas conocidas
        const columnasOrdenables = {
            id: "a.id_alerta",
            id_alerta: "a.id_alerta",
            tipo: "a.tipo",
            estado: "a.estado",
            creada_en: "a.creada_en",
        };
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
            [
                infante.id_infante,
                infante.ultima_medicion,
                infante.ultima_medicion
            ]
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
            [
                infante.id_infante,
                mensaje
            ]
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
        const inicio = Math.max(0, Number(req.query._start) || 0);
        const fin = Number(req.query._end) || 10;
        const limite = Math.max(1, Math.min(fin - inicio, 100));
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
             ORDER BY u.\`${sortBy}\` ${sortOrder}
             LIMIT ? OFFSET ?`,
            [limite, inicio]
        );
        const [total] = await pool.execute("SELECT COUNT(*) AS total FROM usuarios");
        res.set("Access-Control-Expose-Headers", "X-Total-Count");
        res.set("X-Total-Count", String(total[0].total));
        // Nunca enviar password_hash al frontend.
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
        // Temporal: se guarda el valor directamente, sin hash.
        // Sustituir por un algoritmo seguro antes de usar en producción.
        const [resultado] = await pool.execute(
            `INSERT INTO usuarios
                (nombre, correo, password_hash, id_rol, estado)
             VALUES (?, ?, ?, ?, ?)`,
            [
                nombreLimpio,
                correoLimpio,
                password,
                Number(id_rol),
                estadoFinal
            ]
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

        const {
            nombre,
            correo,
            password,
            id_rol,
            estado
        } = req.body;

        if (
            typeof nombre !== "string" ||
            !nombre.trim() ||
            typeof correo !== "string" ||
            !correo.trim() ||
            !Number.isInteger(Number(id_rol)) ||
            Number(id_rol) <= 0 ||
            !["activo", "bloqueado", "baja"].includes(estado)
        ) {
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

        if (
            password !== undefined &&
            (typeof password !== "string" || password.length === 0)
        ) {
            return res.status(400).json({
                mensaje: "Si proporcionas una contraseña, no puede estar vacía."
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

        if (password !== undefined) {
            // Temporal: sin hash, igual que el endpoint de creación actual.
            await pool.execute(
                `UPDATE usuarios
                 SET nombre = ?, correo = ?, id_rol = ?,
                     estado = ?, password_hash = ?
                 WHERE id_usuario = ?`,
                [
                    nombreLimpio,
                    correoLimpio,
                    Number(id_rol),
                    estado,
                    password,
                    id
                ]
            );
        } else {
            await pool.execute(
                `UPDATE usuarios
                 SET nombre = ?, correo = ?, id_rol = ?, estado = ?
                 WHERE id_usuario = ?`,
                [
                    nombreLimpio,
                    correoLimpio,
                    Number(id_rol),
                    estado,
                    id
                ]
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