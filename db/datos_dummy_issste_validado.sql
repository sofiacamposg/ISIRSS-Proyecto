-- Datos dummy para el esquema ISSSTE/EBDI.
-- Ejecutar DESPUES del archivo que crea las tablas y vistas, en una base VACIA.
-- Se usan IDs explícitos del 1 al 20 en las tablas principales; no ejecutar dos veces.
-- Todos los nombres, correos, CURP y mediciones son ficticios. No usar en producción.
SET NAMES utf8mb4;
START TRANSACTION;


INSERT INTO regiones (id_region, nombre) VALUES
(1, 'Region Dummy 01'),
(2, 'Region Dummy 02'),
(3, 'Region Dummy 03'),
(4, 'Region Dummy 04'),
(5, 'Region Dummy 05'),
(6, 'Region Dummy 06'),
(7, 'Region Dummy 07'),
(8, 'Region Dummy 08'),
(9, 'Region Dummy 09'),
(10, 'Region Dummy 10'),
(11, 'Region Dummy 11'),
(12, 'Region Dummy 12'),
(13, 'Region Dummy 13'),
(14, 'Region Dummy 14'),
(15, 'Region Dummy 15'),
(16, 'Region Dummy 16'),
(17, 'Region Dummy 17'),
(18, 'Region Dummy 18'),
(19, 'Region Dummy 19'),
(20, 'Region Dummy 20');

INSERT INTO estados (id_estado, nombre, id_region) VALUES
(1, 'Estado Dummy 01', 1),
(2, 'Estado Dummy 02', 2),
(3, 'Estado Dummy 03', 3),
(4, 'Estado Dummy 04', 4),
(5, 'Estado Dummy 05', 5),
(6, 'Estado Dummy 06', 6),
(7, 'Estado Dummy 07', 7),
(8, 'Estado Dummy 08', 8),
(9, 'Estado Dummy 09', 9),
(10, 'Estado Dummy 10', 10),
(11, 'Estado Dummy 11', 11),
(12, 'Estado Dummy 12', 12),
(13, 'Estado Dummy 13', 13),
(14, 'Estado Dummy 14', 14),
(15, 'Estado Dummy 15', 15),
(16, 'Estado Dummy 16', 16),
(17, 'Estado Dummy 17', 17),
(18, 'Estado Dummy 18', 18),
(19, 'Estado Dummy 19', 19),
(20, 'Estado Dummy 20', 20);

INSERT INTO ebdi (id_ebdi, clave, nombre, id_estado, activa) VALUES
(1, 'EBDI-0001', 'Estancia Dummy 01', 1, 1),
(2, 'EBDI-0002', 'Estancia Dummy 02', 2, 1),
(3, 'EBDI-0003', 'Estancia Dummy 03', 3, 1),
(4, 'EBDI-0004', 'Estancia Dummy 04', 4, 1),
(5, 'EBDI-0005', 'Estancia Dummy 05', 5, 0),
(6, 'EBDI-0006', 'Estancia Dummy 06', 6, 1),
(7, 'EBDI-0007', 'Estancia Dummy 07', 7, 1),
(8, 'EBDI-0008', 'Estancia Dummy 08', 8, 1),
(9, 'EBDI-0009', 'Estancia Dummy 09', 9, 1),
(10, 'EBDI-0010', 'Estancia Dummy 10', 10, 0),
(11, 'EBDI-0011', 'Estancia Dummy 11', 11, 1),
(12, 'EBDI-0012', 'Estancia Dummy 12', 12, 1),
(13, 'EBDI-0013', 'Estancia Dummy 13', 13, 1),
(14, 'EBDI-0014', 'Estancia Dummy 14', 14, 1),
(15, 'EBDI-0015', 'Estancia Dummy 15', 15, 0),
(16, 'EBDI-0016', 'Estancia Dummy 16', 16, 1),
(17, 'EBDI-0017', 'Estancia Dummy 17', 17, 1),
(18, 'EBDI-0018', 'Estancia Dummy 18', 18, 1),
(19, 'EBDI-0019', 'Estancia Dummy 19', 19, 1),
(20, 'EBDI-0020', 'Estancia Dummy 20', 20, 0);

INSERT IGNORE INTO roles (id_rol, nombre) VALUES
(1, 'administrador'),
(2, 'estancia'),
(3, 'coordinador_regional'),
(4, 'tutor');

INSERT IGNORE INTO roles (id_rol, nombre) VALUES
(5, 'rol_prueba_05'),
(6, 'rol_prueba_06'),
(7, 'rol_prueba_07'),
(8, 'rol_prueba_08'),
(9, 'rol_prueba_09'),
(10, 'rol_prueba_10'),
(11, 'rol_prueba_11'),
(12, 'rol_prueba_12'),
(13, 'rol_prueba_13'),
(14, 'rol_prueba_14'),
(15, 'rol_prueba_15'),
(16, 'rol_prueba_16'),
(17, 'rol_prueba_17'),
(18, 'rol_prueba_18'),
(19, 'rol_prueba_19'),
(20, 'rol_prueba_20');

INSERT INTO permisos (id_permiso, codigo, descripcion) VALUES
(1, 'PERMISO_DUMMY_01', 'Permiso ficticio de prueba numero 1'),
(2, 'PERMISO_DUMMY_02', 'Permiso ficticio de prueba numero 2'),
(3, 'PERMISO_DUMMY_03', 'Permiso ficticio de prueba numero 3'),
(4, 'PERMISO_DUMMY_04', 'Permiso ficticio de prueba numero 4'),
(5, 'PERMISO_DUMMY_05', 'Permiso ficticio de prueba numero 5'),
(6, 'PERMISO_DUMMY_06', 'Permiso ficticio de prueba numero 6'),
(7, 'PERMISO_DUMMY_07', 'Permiso ficticio de prueba numero 7'),
(8, 'PERMISO_DUMMY_08', 'Permiso ficticio de prueba numero 8'),
(9, 'PERMISO_DUMMY_09', 'Permiso ficticio de prueba numero 9'),
(10, 'PERMISO_DUMMY_10', 'Permiso ficticio de prueba numero 10'),
(11, 'PERMISO_DUMMY_11', 'Permiso ficticio de prueba numero 11'),
(12, 'PERMISO_DUMMY_12', 'Permiso ficticio de prueba numero 12'),
(13, 'PERMISO_DUMMY_13', 'Permiso ficticio de prueba numero 13'),
(14, 'PERMISO_DUMMY_14', 'Permiso ficticio de prueba numero 14'),
(15, 'PERMISO_DUMMY_15', 'Permiso ficticio de prueba numero 15'),
(16, 'PERMISO_DUMMY_16', 'Permiso ficticio de prueba numero 16'),
(17, 'PERMISO_DUMMY_17', 'Permiso ficticio de prueba numero 17'),
(18, 'PERMISO_DUMMY_18', 'Permiso ficticio de prueba numero 18'),
(19, 'PERMISO_DUMMY_19', 'Permiso ficticio de prueba numero 19'),
(20, 'PERMISO_DUMMY_20', 'Permiso ficticio de prueba numero 20');

INSERT INTO rol_permiso (id_rol, id_permiso) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(11, 11),
(12, 12),
(13, 13),
(14, 14),
(15, 15),
(16, 16),
(17, 17),
(18, 18),
(19, 19),
(20, 20);

INSERT INTO usuarios (id_usuario, nombre, correo, password_hash, id_rol, estado, creado_en) VALUES
(1, 'Usuario Dummy 01', 'usuario01@example.com', '2b84289294a8123e347a77cece5c1ec052de66874e12191c90dc6dce350c0020', 1, 'activo', '2026-01-01 09:00:00'),
(2, 'Usuario Dummy 02', 'usuario02@example.com', '18185d8434f32bbf386196b54e10f4d780f91f89211dbcab8891f37ab0463861', 2, 'activo', '2026-01-02 09:00:00'),
(3, 'Usuario Dummy 03', 'usuario03@example.com', '296fa1f87c16886d837d1c9d1e9e6080e1c4a3a1517c78bc229931926013cd4c', 3, 'bloqueado', '2026-01-03 09:00:00'),
(4, 'Usuario Dummy 04', 'usuario04@example.com', '390fc92e11c2ba6e2565bf987de0a90bcfe255303762ef2c99e210ea948dcba4', 4, 'baja', '2026-01-04 09:00:00'),
(5, 'Usuario Dummy 05', 'usuario05@example.com', '5ec5ea4967f36ba73e6061e96c5cf1b883825bb8fc06fecbd1f2339848bf2347', 5, 'activo', '2026-01-05 09:00:00'),
(6, 'Usuario Dummy 06', 'usuario06@example.com', '7985c6a1075c857be19a5befcf5f354a3f1d163ebd8edc6836afc69987adc4dc', 6, 'activo', '2026-01-06 09:00:00'),
(7, 'Usuario Dummy 07', 'usuario07@example.com', '643ae5d16d22c2806d550eca414ef37b6593b64eb3e0ab339afa364bf8ba4285', 7, 'activo', '2026-01-07 09:00:00'),
(8, 'Usuario Dummy 08', 'usuario08@example.com', '62b969ab38b5e4e88d1bef28f87adc8bf723c993f1cff5620986fbab2b1289d1', 8, 'bloqueado', '2026-01-08 09:00:00'),
(9, 'Usuario Dummy 09', 'usuario09@example.com', '05d83a28627422335d9885efa422c621c314b915bbb60a44f55e597148b91914', 9, 'baja', '2026-01-09 09:00:00'),
(10, 'Usuario Dummy 10', 'usuario10@example.com', 'a4cafe7a16a06aec9290a3461bd63d6b16abfa859d6e993ec4f9d8c4197d8f89', 10, 'activo', '2026-01-10 09:00:00'),
(11, 'Usuario Dummy 11', 'usuario11@example.com', 'fcc09acb92efba72cd471e24a6f3a38db347ad58a33e65ce316229f40fa2b7b6', 11, 'activo', '2026-01-11 09:00:00'),
(12, 'Usuario Dummy 12', 'usuario12@example.com', 'ef680d8c68ee78cfde17ff6b0ca4abfb0fd154304cf735b44504e3952eea6cab', 12, 'activo', '2026-01-12 09:00:00'),
(13, 'Usuario Dummy 13', 'usuario13@example.com', '39231271c559897341c2a23d626b741e9d110f9df89333de34ec3f658a649c9d', 13, 'bloqueado', '2026-01-13 09:00:00'),
(14, 'Usuario Dummy 14', 'usuario14@example.com', 'e0250610770500520f4c74797b54c8d9f93387eb64964a6eff8631afdc5bebb8', 14, 'baja', '2026-01-14 09:00:00'),
(15, 'Usuario Dummy 15', 'usuario15@example.com', 'c4b7948849ce3a74ce10eb7a1732a2b4d826f825350eba0082cd3043c37d4292', 15, 'activo', '2026-01-15 09:00:00'),
(16, 'Usuario Dummy 16', 'usuario16@example.com', '4bbc1b65ceec5a48cdf228e2a030020fe47ac4517d44ca9a3c4fec5f8bc73430', 16, 'activo', '2026-01-16 09:00:00'),
(17, 'Usuario Dummy 17', 'usuario17@example.com', '3c9a4f827d41f1563bad9ba9381d2abc7d39dd5943be871289a9680e588dcc3d', 17, 'activo', '2026-01-17 09:00:00'),
(18, 'Usuario Dummy 18', 'usuario18@example.com', '37fe2edf5026b120b2a816692da44c1d38d58aee65c99fb384cf6c561dc581c1', 18, 'bloqueado', '2026-01-18 09:00:00'),
(19, 'Usuario Dummy 19', 'usuario19@example.com', 'd31f92d67c505ce5a1631cfe329762bb54e74317a95847838ef5e43f16bed1eb', 19, 'baja', '2026-01-19 09:00:00'),
(20, 'Usuario Dummy 20', 'usuario20@example.com', '23f47c4b781c0bfcfc212221feee249e4ba753057941d155c4d2c7bc2f338bbf', 20, 'activo', '2026-01-20 09:00:00');

INSERT INTO usuario_ambito (id_ambito, id_usuario, id_region, id_estado, id_ebdi) VALUES
(1, 1, 1, NULL, NULL),
(2, 2, NULL, 2, NULL),
(3, 3, NULL, NULL, 3),
(4, 4, 4, NULL, NULL),
(5, 5, NULL, 5, NULL),
(6, 6, NULL, NULL, 6),
(7, 7, 7, NULL, NULL),
(8, 8, NULL, 8, NULL),
(9, 9, NULL, NULL, 9),
(10, 10, 10, NULL, NULL),
(11, 11, NULL, 11, NULL),
(12, 12, NULL, NULL, 12),
(13, 13, 13, NULL, NULL),
(14, 14, NULL, 14, NULL),
(15, 15, NULL, NULL, 15),
(16, 16, 16, NULL, NULL),
(17, 17, NULL, 17, NULL),
(18, 18, NULL, NULL, 18),
(19, 19, 19, NULL, NULL),
(20, 20, NULL, 20, NULL);

INSERT INTO infantes (id_infante, id_infante_origen, matricula, nombre, apellido_paterno, apellido_materno, curp, fecha_nacimiento, sexo_patron, fecha_ingreso, id_ebdi, activo, restricciones_nutricionales, creado_por, creado_en) VALUES
(1, 1001, 'MAT-DUMMY-0001', 'Infante01', 'Apellido01', 'Materno01', 'DUMM200001MXNXXX1', '2021-02-01', 'no_especificado', '2025-02-01', 1, 1, NULL, 1, '2026-02-01 10:00:00'),
(2, 1002, 'MAT-DUMMY-0002', 'Infante02', 'Apellido02', 'Materno02', 'DUMM200002MXNXXX2', '2022-03-01', 'masculino', '2024-03-01', 2, 1, NULL, 2, '2026-02-02 10:00:00'),
(3, 1003, 'MAT-DUMMY-0003', 'Infante03', 'Apellido03', 'Materno03', 'DUMM200003MXNXXX3', '2023-04-01', 'no_especificado', '2025-04-01', 3, 1, 'Ejemplo: evitar alimento ficticio', 3, '2026-02-03 10:00:00'),
(4, 1004, 'MAT-DUMMY-0004', 'Infante04', 'Apellido04', 'Materno04', 'DUMM200004MXNXXX4', '2024-05-01', 'masculino', '2024-05-01', 4, 1, NULL, 4, '2026-02-04 10:00:00'),
(5, 1005, 'MAT-DUMMY-0005', 'Infante05', 'Apellido05', 'Materno05', 'DUMM200005MXNXXX5', '2020-06-01', 'no_especificado', '2025-06-01', 5, 1, NULL, 5, '2026-02-05 10:00:00'),
(6, 1006, 'MAT-DUMMY-0006', 'Infante06', 'Apellido06', 'Materno06', 'DUMM200006MXNXXX6', '2021-07-01', 'masculino', '2024-07-01', 6, 1, 'Ejemplo: evitar alimento ficticio', 6, '2026-02-06 10:00:00'),
(7, 1007, 'MAT-DUMMY-0007', 'Infante07', 'Apellido07', 'Materno07', 'DUMM200007MXNXXX7', '2022-08-01', 'no_especificado', '2025-08-01', 7, 0, NULL, 7, '2026-02-07 10:00:00'),
(8, 1008, 'MAT-DUMMY-0008', 'Infante08', 'Apellido08', 'Materno08', 'DUMM200008MXNXXX8', '2023-09-01', 'masculino', '2024-09-01', 8, 1, NULL, 8, '2026-02-08 10:00:00'),
(9, 1009, 'MAT-DUMMY-0009', 'Infante09', 'Apellido09', 'Materno09', 'DUMM200009MXNXXX9', '2024-10-01', 'no_especificado', '2025-10-01', 9, 1, 'Ejemplo: evitar alimento ficticio', 9, '2026-02-09 10:00:00'),
(10, 1010, 'MAT-DUMMY-0010', 'Infante10', 'Apellido10', 'Materno10', 'DUMM200010MXNXXX0', '2020-11-01', 'masculino', '2024-11-01', 10, 1, NULL, 10, '2026-02-10 10:00:00'),
(11, 1011, 'MAT-DUMMY-0011', 'Infante11', 'Apellido11', 'Materno11', 'DUMM200011MXNXXX1', '2021-12-01', 'no_especificado', '2025-12-01', 11, 1, NULL, 11, '2026-02-11 10:00:00'),
(12, 1012, 'MAT-DUMMY-0012', 'Infante12', 'Apellido12', 'Materno12', 'DUMM200012MXNXXX2', '2022-01-01', 'masculino', '2024-01-01', 12, 1, 'Ejemplo: evitar alimento ficticio', 12, '2026-02-12 10:00:00'),
(13, 1013, 'MAT-DUMMY-0013', 'Infante13', 'Apellido13', 'Materno13', 'DUMM200013MXNXXX3', '2023-02-01', 'no_especificado', '2025-02-01', 13, 1, NULL, 13, '2026-02-13 10:00:00'),
(14, 1014, 'MAT-DUMMY-0014', 'Infante14', 'Apellido14', 'Materno14', 'DUMM200014MXNXXX4', '2024-03-01', 'masculino', '2024-03-01', 14, 0, NULL, 14, '2026-02-14 10:00:00'),
(15, 1015, 'MAT-DUMMY-0015', 'Infante15', 'Apellido15', 'Materno15', 'DUMM200015MXNXXX5', '2020-04-01', 'no_especificado', '2025-04-01', 15, 1, 'Ejemplo: evitar alimento ficticio', 15, '2026-02-15 10:00:00'),
(16, 1016, 'MAT-DUMMY-0016', 'Infante16', 'Apellido16', 'Materno16', 'DUMM200016MXNXXX6', '2021-05-01', 'masculino', '2024-05-01', 16, 1, NULL, 16, '2026-02-16 10:00:00'),
(17, 1017, 'MAT-DUMMY-0017', 'Infante17', 'Apellido17', 'Materno17', 'DUMM200017MXNXXX7', '2022-06-01', 'no_especificado', '2025-06-01', 17, 1, NULL, 17, '2026-02-17 10:00:00'),
(18, 1018, 'MAT-DUMMY-0018', 'Infante18', 'Apellido18', 'Materno18', 'DUMM200018MXNXXX8', '2023-07-01', 'masculino', '2024-07-01', 18, 1, 'Ejemplo: evitar alimento ficticio', 18, '2026-02-18 10:00:00'),
(19, 1019, 'MAT-DUMMY-0019', 'Infante19', 'Apellido19', 'Materno19', 'DUMM200019MXNXXX9', '2024-08-01', 'no_especificado', '2025-08-01', 19, 1, NULL, 19, '2026-02-19 10:00:00'),
(20, 1020, 'MAT-DUMMY-0020', 'Infante20', 'Apellido20', 'Materno20', 'DUMM200020MXNXXX0', '2020-09-01', 'masculino', '2024-09-01', 20, 1, NULL, 20, '2026-02-20 10:00:00');

INSERT INTO tutores (id_tutor, id_usuario, nombre, telefono, correo) VALUES
(1, 1, 'Tutor Dummy 01', '5550000001', 'tutor01@example.com'),
(2, 2, 'Tutor Dummy 02', '5550000002', 'tutor02@example.com'),
(3, 3, 'Tutor Dummy 03', '5550000003', 'tutor03@example.com'),
(4, 4, 'Tutor Dummy 04', '5550000004', 'tutor04@example.com'),
(5, 5, 'Tutor Dummy 05', '5550000005', 'tutor05@example.com'),
(6, 6, 'Tutor Dummy 06', '5550000006', 'tutor06@example.com'),
(7, 7, 'Tutor Dummy 07', '5550000007', 'tutor07@example.com'),
(8, 8, 'Tutor Dummy 08', '5550000008', 'tutor08@example.com'),
(9, 9, 'Tutor Dummy 09', '5550000009', 'tutor09@example.com'),
(10, 10, 'Tutor Dummy 10', '5550000010', 'tutor10@example.com'),
(11, 11, 'Tutor Dummy 11', '5550000011', 'tutor11@example.com'),
(12, 12, 'Tutor Dummy 12', '5550000012', 'tutor12@example.com'),
(13, 13, 'Tutor Dummy 13', '5550000013', 'tutor13@example.com'),
(14, 14, 'Tutor Dummy 14', '5550000014', 'tutor14@example.com'),
(15, 15, 'Tutor Dummy 15', '5550000015', 'tutor15@example.com'),
(16, 16, 'Tutor Dummy 16', '5550000016', 'tutor16@example.com'),
(17, 17, 'Tutor Dummy 17', '5550000017', 'tutor17@example.com'),
(18, 18, 'Tutor Dummy 18', '5550000018', 'tutor18@example.com'),
(19, 19, 'Tutor Dummy 19', '5550000019', 'tutor19@example.com'),
(20, 20, 'Tutor Dummy 20', '5550000020', 'tutor20@example.com');

INSERT INTO infante_tutor (id_infante, id_tutor, parentesco, acceso_autorizado, autorizado_por, autorizado_en) VALUES
(1, 1, 'tutor', 1, 1, '2026-03-01 11:00:00'),
(2, 2, 'tutor', 1, 2, '2026-03-02 11:00:00'),
(3, 3, 'tutor', 1, 3, '2026-03-03 11:00:00'),
(4, 4, 'tutor', 1, 4, '2026-03-04 11:00:00'),
(5, 5, 'tutor', 1, 5, '2026-03-05 11:00:00'),
(6, 6, 'tutor', 1, 6, '2026-03-06 11:00:00'),
(7, 7, 'tutor', 1, 7, '2026-03-07 11:00:00'),
(8, 8, 'tutor', 1, 8, '2026-03-08 11:00:00'),
(9, 9, 'tutor', 1, 9, '2026-03-09 11:00:00'),
(10, 10, 'tutor', 1, 10, '2026-03-10 11:00:00'),
(11, 11, 'tutor', 1, 11, '2026-03-11 11:00:00'),
(12, 12, 'tutor', 1, 12, '2026-03-12 11:00:00'),
(13, 13, 'tutor', 1, 13, '2026-03-13 11:00:00'),
(14, 14, 'tutor', 1, 14, '2026-03-14 11:00:00'),
(15, 15, 'tutor', 1, 15, '2026-03-15 11:00:00'),
(16, 16, 'tutor', 1, 16, '2026-03-16 11:00:00'),
(17, 17, 'tutor', 1, 17, '2026-03-17 11:00:00'),
(18, 18, 'tutor', 1, 18, '2026-03-18 11:00:00'),
(19, 19, 'tutor', 1, 19, '2026-03-19 11:00:00'),
(20, 20, 'tutor', 1, 20, '2026-03-20 11:00:00');

INSERT INTO antecedentes_parentales (id_antecedente, id_infante, estatura_madre_cm, estatura_padre_cm, registrado_por, registrado_en) VALUES
(1, 1, 151, 161, 1, '2026-03-01 12:00:00'),
(2, 2, 152, 162, 2, '2026-03-02 12:00:00'),
(3, 3, 153, 163, 3, '2026-03-03 12:00:00'),
(4, 4, 154, 164, 4, '2026-03-04 12:00:00'),
(5, 5, 155, 165, 5, '2026-03-05 12:00:00'),
(6, 6, 156, 166, 6, '2026-03-06 12:00:00'),
(7, 7, 157, 167, 7, '2026-03-07 12:00:00'),
(8, 8, 158, 168, 8, '2026-03-08 12:00:00'),
(9, 9, 159, 169, 9, '2026-03-09 12:00:00'),
(10, 10, 160, 170, 10, '2026-03-10 12:00:00'),
(11, 11, 161, 171, 11, '2026-03-11 12:00:00'),
(12, 12, 162, 172, 12, '2026-03-12 12:00:00'),
(13, 13, 163, 173, 13, '2026-03-13 12:00:00'),
(14, 14, 164, 174, 14, '2026-03-14 12:00:00'),
(15, 15, 165, 175, 15, '2026-03-15 12:00:00'),
(16, 16, 166, 176, 16, '2026-03-16 12:00:00'),
(17, 17, 167, 177, 17, '2026-03-17 12:00:00'),
(18, 18, 168, 178, 18, '2026-03-18 12:00:00'),
(19, 19, 169, 179, 19, '2026-03-19 12:00:00'),
(20, 20, 170, 180, 20, '2026-03-20 12:00:00');

INSERT INTO movimientos_padron (id_movimiento, id_infante, tipo, fecha, id_ebdi_origen, id_ebdi_destino, motivo, registrado_por) VALUES
(1, 1, 'transferencia', '2026-04-01', 2, 1, 'Movimiento ficticio de prueba 1', 1),
(2, 2, 'baja', '2026-04-02', NULL, NULL, 'Movimiento ficticio de prueba 2', 2),
(3, 3, 'reactivacion', '2026-04-03', NULL, NULL, 'Movimiento ficticio de prueba 3', 3),
(4, 4, 'otro', '2026-04-04', NULL, NULL, 'Movimiento ficticio de prueba 4', 4),
(5, 5, 'alta', '2026-04-05', NULL, NULL, 'Movimiento ficticio de prueba 5', 5),
(6, 6, 'transferencia', '2026-04-06', 7, 6, 'Movimiento ficticio de prueba 6', 6),
(7, 7, 'baja', '2026-04-07', NULL, NULL, 'Movimiento ficticio de prueba 7', 7),
(8, 8, 'reactivacion', '2026-04-08', NULL, NULL, 'Movimiento ficticio de prueba 8', 8),
(9, 9, 'otro', '2026-04-09', NULL, NULL, 'Movimiento ficticio de prueba 9', 9),
(10, 10, 'alta', '2026-04-10', NULL, NULL, 'Movimiento ficticio de prueba 10', 10),
(11, 11, 'transferencia', '2026-04-11', 12, 11, 'Movimiento ficticio de prueba 11', 11),
(12, 12, 'baja', '2026-04-12', NULL, NULL, 'Movimiento ficticio de prueba 12', 12),
(13, 13, 'reactivacion', '2026-04-13', NULL, NULL, 'Movimiento ficticio de prueba 13', 13),
(14, 14, 'otro', '2026-04-14', NULL, NULL, 'Movimiento ficticio de prueba 14', 14),
(15, 15, 'alta', '2026-04-15', NULL, NULL, 'Movimiento ficticio de prueba 15', 15),
(16, 16, 'transferencia', '2026-04-16', 17, 16, 'Movimiento ficticio de prueba 16', 16),
(17, 17, 'baja', '2026-04-17', NULL, NULL, 'Movimiento ficticio de prueba 17', 17),
(18, 18, 'reactivacion', '2026-04-18', NULL, NULL, 'Movimiento ficticio de prueba 18', 18),
(19, 19, 'otro', '2026-04-19', NULL, NULL, 'Movimiento ficticio de prueba 19', 19),
(20, 20, 'alta', '2026-04-20', NULL, NULL, 'Movimiento ficticio de prueba 20', 20);

INSERT INTO revisiones_padron (id_revision, id_ebdi, periodo, revisado_por, revisado_en, observaciones) VALUES
(1, 1, '2026-01-01', 1, '2026-04-01 13:00:00', 'Revision dummy 1'),
(2, 2, '2026-02-01', 2, '2026-04-02 13:00:00', 'Revision dummy 2'),
(3, 3, '2026-03-01', 3, '2026-04-03 13:00:00', 'Revision dummy 3'),
(4, 4, '2026-04-01', 4, '2026-04-04 13:00:00', 'Revision dummy 4'),
(5, 5, '2026-05-01', 5, '2026-04-05 13:00:00', 'Revision dummy 5'),
(6, 6, '2026-06-01', 6, '2026-04-06 13:00:00', 'Revision dummy 6'),
(7, 7, '2026-07-01', 7, '2026-04-07 13:00:00', 'Revision dummy 7'),
(8, 8, '2026-08-01', 8, '2026-04-08 13:00:00', 'Revision dummy 8'),
(9, 9, '2026-09-01', 9, '2026-04-09 13:00:00', 'Revision dummy 9'),
(10, 10, '2026-10-01', 10, '2026-04-10 13:00:00', 'Revision dummy 10'),
(11, 11, '2026-11-01', 11, '2026-04-11 13:00:00', 'Revision dummy 11'),
(12, 12, '2026-12-01', 12, '2026-04-12 13:00:00', 'Revision dummy 12'),
(13, 13, '2026-01-01', 13, '2026-04-13 13:00:00', 'Revision dummy 13'),
(14, 14, '2026-02-01', 14, '2026-04-14 13:00:00', 'Revision dummy 14'),
(15, 15, '2026-03-01', 15, '2026-04-15 13:00:00', 'Revision dummy 15'),
(16, 16, '2026-04-01', 16, '2026-04-16 13:00:00', 'Revision dummy 16'),
(17, 17, '2026-05-01', 17, '2026-04-17 13:00:00', 'Revision dummy 17'),
(18, 18, '2026-06-01', 18, '2026-04-18 13:00:00', 'Revision dummy 18'),
(19, 19, '2026-07-01', 19, '2026-04-19 13:00:00', 'Revision dummy 19'),
(20, 20, '2026-08-01', 20, '2026-04-20 13:00:00', 'Revision dummy 20');

INSERT INTO inscripciones_mensuales (id_infante, periodo, id_ebdi, codigo_institucional) VALUES
(1, '2026-01-01', 1, 'COD-DUMMY-0001'),
(2, '2026-02-01', 2, 'COD-DUMMY-0002'),
(3, '2026-03-01', 3, 'COD-DUMMY-0003'),
(4, '2026-04-01', 4, 'COD-DUMMY-0004'),
(5, '2026-05-01', 5, 'COD-DUMMY-0005'),
(6, '2026-06-01', 6, 'COD-DUMMY-0006'),
(7, '2026-07-01', 7, 'COD-DUMMY-0007'),
(8, '2026-08-01', 8, 'COD-DUMMY-0008'),
(9, '2026-09-01', 9, 'COD-DUMMY-0009'),
(10, '2026-10-01', 10, 'COD-DUMMY-0010'),
(11, '2026-11-01', 11, 'COD-DUMMY-0011'),
(12, '2026-12-01', 12, 'COD-DUMMY-0012'),
(13, '2026-01-01', 13, 'COD-DUMMY-0013'),
(14, '2026-02-01', 14, 'COD-DUMMY-0014'),
(15, '2026-03-01', 15, 'COD-DUMMY-0015'),
(16, '2026-04-01', 16, 'COD-DUMMY-0016'),
(17, '2026-05-01', 17, 'COD-DUMMY-0017'),
(18, '2026-06-01', 18, 'COD-DUMMY-0018'),
(19, '2026-07-01', 19, 'COD-DUMMY-0019'),
(20, '2026-08-01', 20, 'COD-DUMMY-0020');

INSERT INTO mediciones (id_medicion, id_infante, id_ebdi_captura, creado_por, creado_en) VALUES
(1, 1, 1, 1, '2026-05-01 09:30:00'),
(2, 2, 2, 2, '2026-05-02 09:30:00'),
(3, 3, 3, 3, '2026-05-03 09:30:00'),
(4, 4, 4, 4, '2026-05-04 09:30:00'),
(5, 5, 5, 5, '2026-05-05 09:30:00'),
(6, 6, 6, 6, '2026-05-06 09:30:00'),
(7, 7, 7, 7, '2026-05-07 09:30:00'),
(8, 8, 8, 8, '2026-05-08 09:30:00'),
(9, 9, 9, 9, '2026-05-09 09:30:00'),
(10, 10, 10, 10, '2026-05-10 09:30:00'),
(11, 11, 11, 11, '2026-05-11 09:30:00'),
(12, 12, 12, 12, '2026-05-12 09:30:00'),
(13, 13, 13, 13, '2026-05-13 09:30:00'),
(14, 14, 14, 14, '2026-05-14 09:30:00'),
(15, 15, 15, 15, '2026-05-15 09:30:00'),
(16, 16, 16, 16, '2026-05-16 09:30:00'),
(17, 17, 17, 17, '2026-05-17 09:30:00'),
(18, 18, 18, 18, '2026-05-18 09:30:00'),
(19, 19, 19, 19, '2026-05-19 09:30:00'),
(20, 20, 20, 20, '2026-05-20 09:30:00');

INSERT INTO medicion_versiones (id_version, id_medicion, numero_version, fecha_medicion, fecha_nacimiento_utilizada, sexo_patron_utilizado, peso_kg, talla_cm, tipo_talla, perimetro_cefalico_cm, tipo, motivo_extraordinaria, observaciones, estado_nutricional_registrado, motivo_correccion, registrado_por, registrado_en) VALUES
(1, 1, 1, '2026-05-01', '2021-02-01', 'no_especificado', 8.35, 71.8, 'longitud_acostado', 42.3, 'periodica', NULL, 'Observacion ficticia 1', NULL, NULL, 1, '2026-05-01 09:45:00'),
(2, 2, 1, '2026-05-02', '2022-03-01', 'masculino', 8.7, 73.6, 'talla_de_pie', 42.6, 'periodica', NULL, 'Observacion ficticia 2', NULL, NULL, 2, '2026-05-02 09:45:00'),
(3, 3, 1, '2026-05-03', '2023-04-01', 'no_especificado', 9.05, 75.4, 'longitud_acostado', 42.9, 'periodica', NULL, 'Observacion ficticia 3', NULL, NULL, 3, '2026-05-03 09:45:00'),
(4, 4, 1, '2026-05-04', '2024-05-01', 'masculino', 9.4, 77.2, 'talla_de_pie', 43.2, 'periodica', NULL, 'Observacion ficticia 4', NULL, NULL, 4, '2026-05-04 09:45:00'),
(5, 5, 1, '2026-05-05', '2020-06-01', 'no_especificado', 9.75, 79.0, 'longitud_acostado', 43.5, 'periodica', NULL, 'Observacion ficticia 5', NULL, NULL, 5, '2026-05-05 09:45:00'),
(6, 6, 1, '2026-05-06', '2021-07-01', 'masculino', 10.1, 80.8, 'talla_de_pie', 43.8, 'periodica', NULL, 'Observacion ficticia 6', NULL, NULL, 6, '2026-05-06 09:45:00'),
(7, 7, 1, '2026-05-07', '2022-08-01', 'no_especificado', 10.45, 82.6, 'longitud_acostado', 44.1, 'periodica', NULL, 'Observacion ficticia 7', NULL, NULL, 7, '2026-05-07 09:45:00'),
(8, 8, 1, '2026-05-08', '2023-09-01', 'masculino', 10.8, 84.4, 'talla_de_pie', 44.4, 'periodica', NULL, 'Observacion ficticia 8', NULL, NULL, 8, '2026-05-08 09:45:00'),
(9, 9, 1, '2026-05-09', '2024-10-01', 'no_especificado', 11.15, 86.2, 'longitud_acostado', 44.7, 'periodica', NULL, 'Observacion ficticia 9', NULL, NULL, 9, '2026-05-09 09:45:00'),
(10, 10, 1, '2026-05-10', '2020-11-01', 'masculino', 11.5, 88.0, 'talla_de_pie', 45.0, 'periodica', NULL, 'Observacion ficticia 10', NULL, NULL, 10, '2026-05-10 09:45:00'),
(11, 11, 1, '2026-05-11', '2021-12-01', 'no_especificado', 11.85, 89.8, 'longitud_acostado', 45.3, 'periodica', NULL, 'Observacion ficticia 11', NULL, NULL, 11, '2026-05-11 09:45:00'),
(12, 12, 1, '2026-05-12', '2022-01-01', 'masculino', 12.2, 91.6, 'talla_de_pie', 45.6, 'periodica', NULL, 'Observacion ficticia 12', NULL, NULL, 12, '2026-05-12 09:45:00'),
(13, 13, 1, '2026-05-13', '2023-02-01', 'no_especificado', 12.55, 93.4, 'longitud_acostado', 45.9, 'periodica', NULL, 'Observacion ficticia 13', NULL, NULL, 13, '2026-05-13 09:45:00'),
(14, 14, 1, '2026-05-14', '2024-03-01', 'masculino', 12.9, 95.2, 'talla_de_pie', 46.2, 'periodica', NULL, 'Observacion ficticia 14', NULL, NULL, 14, '2026-05-14 09:45:00'),
(15, 15, 1, '2026-05-15', '2020-04-01', 'no_especificado', 13.25, 97.0, 'longitud_acostado', 46.5, 'periodica', NULL, 'Observacion ficticia 15', NULL, NULL, 15, '2026-05-15 09:45:00'),
(16, 16, 1, '2026-05-16', '2021-05-01', 'masculino', 13.6, 98.8, 'talla_de_pie', 46.8, 'periodica', NULL, 'Observacion ficticia 16', NULL, NULL, 16, '2026-05-16 09:45:00'),
(17, 17, 1, '2026-05-17', '2022-06-01', 'no_especificado', 13.95, 100.6, 'longitud_acostado', 47.1, 'periodica', NULL, 'Observacion ficticia 17', NULL, NULL, 17, '2026-05-17 09:45:00'),
(18, 18, 1, '2026-05-18', '2023-07-01', 'masculino', 14.3, 102.4, 'talla_de_pie', 47.4, 'periodica', NULL, 'Observacion ficticia 18', NULL, NULL, 18, '2026-05-18 09:45:00'),
(19, 19, 1, '2026-05-19', '2024-08-01', 'no_especificado', 14.65, 104.2, 'longitud_acostado', 47.7, 'periodica', NULL, 'Observacion ficticia 19', NULL, NULL, 19, '2026-05-19 09:45:00'),
(20, 20, 1, '2026-05-20', '2020-09-01', 'masculino', 15.0, 106.0, 'talla_de_pie', 48.0, 'periodica', NULL, 'Observacion ficticia 20', NULL, NULL, 20, '2026-05-20 09:45:00');

INSERT INTO referencias_clinicas (id_referencia, nombre, version, fuente, indicador, contenido, sha256, estado, autorizado_por_institucion, autorizado_en) VALUES
(1, 'Referencia Dummy 01', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_01', '{"dummy": true, "id": 1}', '9ae3c46eed2064b34eae59679f222c52eaec8034937a766984cce7a5cbce4bcb', 'autorizada', 'Institucion de prueba 1', '2026-01-01 08:00:00'),
(2, 'Referencia Dummy 02', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_02', '{"dummy": true, "id": 2}', '0c7e526e697ad4a6c4bbc74f0eadad8bad802fd7f1c9bcd78df61bc1077394fe', 'autorizada', 'Institucion de prueba 2', '2026-01-02 08:00:00'),
(3, 'Referencia Dummy 03', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_03', '{"dummy": true, "id": 3}', 'e59e9ab42acf0c84cc4d85b64839b982d3ada9cdc4a5d9d660dccbcf6a5665b4', 'autorizada', 'Institucion de prueba 3', '2026-01-03 08:00:00'),
(4, 'Referencia Dummy 04', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_04', '{"dummy": true, "id": 4}', '129d66e6381d326291abe7cc7424f088023d57aa6b53eca8a7f4f96ca2a21b87', 'autorizada', 'Institucion de prueba 4', '2026-01-04 08:00:00'),
(5, 'Referencia Dummy 05', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_05', '{"dummy": true, "id": 5}', '4b26de358c3bd56e1b1910aa818fe014651c751cbe7790bbdf866d323066d17d', 'autorizada', 'Institucion de prueba 5', '2026-01-05 08:00:00'),
(6, 'Referencia Dummy 06', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_06', '{"dummy": true, "id": 6}', '8d1fbcb3fde7f5e6801cffc7ff301e9451a0013be39545c4de8a74aa81ae8c37', 'autorizada', 'Institucion de prueba 6', '2026-01-06 08:00:00'),
(7, 'Referencia Dummy 07', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_07', '{"dummy": true, "id": 7}', '9d55ae40538947114a34c974081efd09ba59d5de7904193a7eaaa7da2080a400', 'autorizada', 'Institucion de prueba 7', '2026-01-07 08:00:00'),
(8, 'Referencia Dummy 08', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_08', '{"dummy": true, "id": 8}', 'ec65c0c8d416edbaa14c524a1781b94004fdec4c7f7a59b3f2d72c3dd5f79b53', 'autorizada', 'Institucion de prueba 8', '2026-01-08 08:00:00'),
(9, 'Referencia Dummy 09', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_09', '{"dummy": true, "id": 9}', 'd73a355a399b87c4e0b75bb39efa6e7afddaca90356b4fe80d6afde5a95e4c3a', 'autorizada', 'Institucion de prueba 9', '2026-01-09 08:00:00'),
(10, 'Referencia Dummy 10', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_10', '{"dummy": true, "id": 10}', '991318f559a37058b34a27c43d91ca1809468d4a5fca64e72a3a4e933898d10e', 'autorizada', 'Institucion de prueba 10', '2026-01-10 08:00:00'),
(11, 'Referencia Dummy 11', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_11', '{"dummy": true, "id": 11}', '91c33c4f06e712cacaf2995296d8b0386006dfca762f89fbe706034cb03e8dc8', 'autorizada', 'Institucion de prueba 11', '2026-01-11 08:00:00'),
(12, 'Referencia Dummy 12', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_12', '{"dummy": true, "id": 12}', '1caa53f1fa3bc8ad4b340012957786c136e0aa1894d4345b11eca7a66514e8c7', 'autorizada', 'Institucion de prueba 12', '2026-01-12 08:00:00'),
(13, 'Referencia Dummy 13', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_13', '{"dummy": true, "id": 13}', 'ba94358075f6b456a449098900bcfe7cbab225a0d34ab64d9e560f2755fc970f', 'autorizada', 'Institucion de prueba 13', '2026-01-13 08:00:00'),
(14, 'Referencia Dummy 14', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_14', '{"dummy": true, "id": 14}', 'df664dc77521f272fdbd24861b1a46cc8df7edb53fa867acd91910b230cb4d57', 'autorizada', 'Institucion de prueba 14', '2026-01-14 08:00:00'),
(15, 'Referencia Dummy 15', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_15', '{"dummy": true, "id": 15}', '510c751adeff6742526d87e928861091b36068173a0c67e9913fe9eee9dfe3fa', 'autorizada', 'Institucion de prueba 15', '2026-01-15 08:00:00'),
(16, 'Referencia Dummy 16', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_16', '{"dummy": true, "id": 16}', 'e80f6e7a87c11e699b221c7bb52ca8447daff335b434c7baebb074718204009b', 'autorizada', 'Institucion de prueba 16', '2026-01-16 08:00:00'),
(17, 'Referencia Dummy 17', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_17', '{"dummy": true, "id": 17}', '8b728ac5c87f19ce46c0fb5f48019ef3a6b4ec66269363a5c1656b8ec30fb60e', 'autorizada', 'Institucion de prueba 17', '2026-01-17 08:00:00'),
(18, 'Referencia Dummy 18', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_18', '{"dummy": true, "id": 18}', 'aea188c846189c2bdc9bfa52191bb8fc8fa776e464d50a870df8e0fdd0b0138e', 'autorizada', 'Institucion de prueba 18', '2026-01-18 08:00:00'),
(19, 'Referencia Dummy 19', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_19', '{"dummy": true, "id": 19}', '12fa856ee0d1425b71e21f3234dd3facb4694dbc65e1e88ea41c778ffa4bd2b6', 'autorizada', 'Institucion de prueba 19', '2026-01-19 08:00:00'),
(20, 'Referencia Dummy 20', '1.0', 'Fuente ficticia para pruebas', 'indicador_dummy_20', '{"dummy": true, "id": 20}', 'fcf6caaf1216b637057b69aee4a02cfe730bc505d3f3384c7c852be7fbbe355c', 'autorizada', 'Institucion de prueba 20', '2026-01-20 08:00:00');

INSERT INTO referencia_region (id_referencia, id_region, vigente_desde, vigente_hasta) VALUES
(1, 1, '2026-01-01', NULL),
(2, 2, '2026-01-01', NULL),
(3, 3, '2026-01-01', NULL),
(4, 4, '2026-01-01', NULL),
(5, 5, '2026-01-01', NULL),
(6, 6, '2026-01-01', NULL),
(7, 7, '2026-01-01', NULL),
(8, 8, '2026-01-01', NULL),
(9, 9, '2026-01-01', NULL),
(10, 10, '2026-01-01', NULL),
(11, 11, '2026-01-01', NULL),
(12, 12, '2026-01-01', NULL),
(13, 13, '2026-01-01', NULL),
(14, 14, '2026-01-01', NULL),
(15, 15, '2026-01-01', NULL),
(16, 16, '2026-01-01', NULL),
(17, 17, '2026-01-01', NULL),
(18, 18, '2026-01-01', NULL),
(19, 19, '2026-01-01', NULL),
(20, 20, '2026-01-01', NULL);

INSERT INTO evaluaciones (id_evaluacion, id_version_medicion, id_referencia, id_antecedente, id_region_aplicada, valor, unidad, categoria, detalle, evaluado_por, evaluado_en) VALUES
(1, 1, 1, 1, 1, 1.1, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 1, '2026-05-01 10:00:00'),
(2, 2, 2, 2, 2, 1.2, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 2, '2026-05-02 10:00:00'),
(3, 3, 3, 3, 3, 1.3, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 3, '2026-05-03 10:00:00'),
(4, 4, 4, 4, 4, 1.4, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 4, '2026-05-04 10:00:00'),
(5, 5, 5, 5, 5, 1.5, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 5, '2026-05-05 10:00:00'),
(6, 6, 6, 6, 6, 1.6, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 6, '2026-05-06 10:00:00'),
(7, 7, 7, 7, 7, 1.7, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 7, '2026-05-07 10:00:00'),
(8, 8, 8, 8, 8, 1.8, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 8, '2026-05-08 10:00:00'),
(9, 9, 9, 9, 9, 1.9, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 9, '2026-05-09 10:00:00'),
(10, 10, 10, 10, 10, 2.0, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 10, '2026-05-10 10:00:00'),
(11, 11, 11, 11, 11, 2.1, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 11, '2026-05-11 10:00:00'),
(12, 12, 12, 12, 12, 2.2, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 12, '2026-05-12 10:00:00'),
(13, 13, 13, 13, 13, 2.3, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 13, '2026-05-13 10:00:00'),
(14, 14, 14, 14, 14, 2.4, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 14, '2026-05-14 10:00:00'),
(15, 15, 15, 15, 15, 2.5, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 15, '2026-05-15 10:00:00'),
(16, 16, 16, 16, 16, 2.6, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 16, '2026-05-16 10:00:00'),
(17, 17, 17, 17, 17, 2.7, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 17, '2026-05-17 10:00:00'),
(18, 18, 18, 18, 18, 2.8, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 18, '2026-05-18 10:00:00'),
(19, 19, 19, 19, 19, 2.9, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 19, '2026-05-19 10:00:00'),
(20, 20, 20, 20, 20, 3.0, 'unidad_dummy', 'categoria_prueba', '{"dummy": true, "nota": "no es evaluacion clinica"}', 20, '2026-05-20 10:00:00');

INSERT INTO condiciones_salud (id_condicion, id_infante, descripcion, fecha_registro, registrado_por) VALUES
(1, 1, 'Condicion ficticia de prueba 1', '2026-05-01', 1),
(2, 2, 'Condicion ficticia de prueba 2', '2026-05-02', 2),
(3, 3, 'Condicion ficticia de prueba 3', '2026-05-03', 3),
(4, 4, 'Condicion ficticia de prueba 4', '2026-05-04', 4),
(5, 5, 'Condicion ficticia de prueba 5', '2026-05-05', 5),
(6, 6, 'Condicion ficticia de prueba 6', '2026-05-06', 6),
(7, 7, 'Condicion ficticia de prueba 7', '2026-05-07', 7),
(8, 8, 'Condicion ficticia de prueba 8', '2026-05-08', 8),
(9, 9, 'Condicion ficticia de prueba 9', '2026-05-09', 9),
(10, 10, 'Condicion ficticia de prueba 10', '2026-05-10', 10),
(11, 11, 'Condicion ficticia de prueba 11', '2026-05-11', 11),
(12, 12, 'Condicion ficticia de prueba 12', '2026-05-12', 12),
(13, 13, 'Condicion ficticia de prueba 13', '2026-05-13', 13),
(14, 14, 'Condicion ficticia de prueba 14', '2026-05-14', 14),
(15, 15, 'Condicion ficticia de prueba 15', '2026-05-15', 15),
(16, 16, 'Condicion ficticia de prueba 16', '2026-05-16', 16),
(17, 17, 'Condicion ficticia de prueba 17', '2026-05-17', 17),
(18, 18, 'Condicion ficticia de prueba 18', '2026-05-18', 18),
(19, 19, 'Condicion ficticia de prueba 19', '2026-05-19', 19),
(20, 20, 'Condicion ficticia de prueba 20', '2026-05-20', 20);

INSERT INTO seguimientos (id_seguimiento, id_infante, id_condicion, motivo, estado, fecha_apertura, fecha_cierre, creado_por) VALUES
(1, 1, 1, 'Motivo ficticio 1', 'en_seguimiento', '2026-06-01', NULL, 1),
(2, 2, 2, 'Motivo ficticio 2', 'concluido', '2026-06-02', '2026-06-09', 2),
(3, 3, 3, 'Motivo ficticio 3', 'requiere_seguimiento', '2026-06-03', NULL, 3),
(4, 4, 4, 'Motivo ficticio 4', 'en_seguimiento', '2026-06-04', NULL, 4),
(5, 5, 5, 'Motivo ficticio 5', 'concluido', '2026-06-05', '2026-06-12', 5),
(6, 6, 6, 'Motivo ficticio 6', 'requiere_seguimiento', '2026-06-06', NULL, 6),
(7, 7, 7, 'Motivo ficticio 7', 'en_seguimiento', '2026-06-07', NULL, 7),
(8, 8, 8, 'Motivo ficticio 8', 'concluido', '2026-06-08', '2026-06-15', 8),
(9, 9, 9, 'Motivo ficticio 9', 'requiere_seguimiento', '2026-06-09', NULL, 9),
(10, 10, 10, 'Motivo ficticio 10', 'en_seguimiento', '2026-06-10', NULL, 10),
(11, 11, 11, 'Motivo ficticio 11', 'concluido', '2026-06-11', '2026-06-18', 11),
(12, 12, 12, 'Motivo ficticio 12', 'requiere_seguimiento', '2026-06-12', NULL, 12),
(13, 13, 13, 'Motivo ficticio 13', 'en_seguimiento', '2026-06-13', NULL, 13),
(14, 14, 14, 'Motivo ficticio 14', 'concluido', '2026-06-14', '2026-06-21', 14),
(15, 15, 15, 'Motivo ficticio 15', 'requiere_seguimiento', '2026-06-15', NULL, 15),
(16, 16, 16, 'Motivo ficticio 16', 'en_seguimiento', '2026-06-16', NULL, 16),
(17, 17, 17, 'Motivo ficticio 17', 'concluido', '2026-06-17', '2026-06-24', 17),
(18, 18, 18, 'Motivo ficticio 18', 'requiere_seguimiento', '2026-06-18', NULL, 18),
(19, 19, 19, 'Motivo ficticio 19', 'en_seguimiento', '2026-06-19', NULL, 19),
(20, 20, 20, 'Motivo ficticio 20', 'concluido', '2026-06-20', '2026-06-27', 20);

INSERT INTO acciones_seguimiento (id_accion, id_seguimiento, fecha, observaciones, acciones_realizadas, responsable_nombre, responsable_usuario, registrado_por) VALUES
(1, 1, '2026-06-01 14:00:00', 'Observacion dummy 1', 'Accion ficticia de seguimiento 1', 'Responsable Dummy 1', 1, 1),
(2, 2, '2026-06-02 14:00:00', 'Observacion dummy 2', 'Accion ficticia de seguimiento 2', 'Responsable Dummy 2', 2, 2),
(3, 3, '2026-06-03 14:00:00', 'Observacion dummy 3', 'Accion ficticia de seguimiento 3', 'Responsable Dummy 3', 3, 3),
(4, 4, '2026-06-04 14:00:00', 'Observacion dummy 4', 'Accion ficticia de seguimiento 4', 'Responsable Dummy 4', 4, 4),
(5, 5, '2026-06-05 14:00:00', 'Observacion dummy 5', 'Accion ficticia de seguimiento 5', 'Responsable Dummy 5', 5, 5),
(6, 6, '2026-06-06 14:00:00', 'Observacion dummy 6', 'Accion ficticia de seguimiento 6', 'Responsable Dummy 6', 6, 6),
(7, 7, '2026-06-07 14:00:00', 'Observacion dummy 7', 'Accion ficticia de seguimiento 7', 'Responsable Dummy 7', 7, 7),
(8, 8, '2026-06-08 14:00:00', 'Observacion dummy 8', 'Accion ficticia de seguimiento 8', 'Responsable Dummy 8', 8, 8),
(9, 9, '2026-06-09 14:00:00', 'Observacion dummy 9', 'Accion ficticia de seguimiento 9', 'Responsable Dummy 9', 9, 9),
(10, 10, '2026-06-10 14:00:00', 'Observacion dummy 10', 'Accion ficticia de seguimiento 10', 'Responsable Dummy 10', 10, 10),
(11, 11, '2026-06-11 14:00:00', 'Observacion dummy 11', 'Accion ficticia de seguimiento 11', 'Responsable Dummy 11', 11, 11),
(12, 12, '2026-06-12 14:00:00', 'Observacion dummy 12', 'Accion ficticia de seguimiento 12', 'Responsable Dummy 12', 12, 12),
(13, 13, '2026-06-13 14:00:00', 'Observacion dummy 13', 'Accion ficticia de seguimiento 13', 'Responsable Dummy 13', 13, 13),
(14, 14, '2026-06-14 14:00:00', 'Observacion dummy 14', 'Accion ficticia de seguimiento 14', 'Responsable Dummy 14', 14, 14),
(15, 15, '2026-06-15 14:00:00', 'Observacion dummy 15', 'Accion ficticia de seguimiento 15', 'Responsable Dummy 15', 15, 15),
(16, 16, '2026-06-16 14:00:00', 'Observacion dummy 16', 'Accion ficticia de seguimiento 16', 'Responsable Dummy 16', 16, 16),
(17, 17, '2026-06-17 14:00:00', 'Observacion dummy 17', 'Accion ficticia de seguimiento 17', 'Responsable Dummy 17', 17, 17),
(18, 18, '2026-06-18 14:00:00', 'Observacion dummy 18', 'Accion ficticia de seguimiento 18', 'Responsable Dummy 18', 18, 18),
(19, 19, '2026-06-19 14:00:00', 'Observacion dummy 19', 'Accion ficticia de seguimiento 19', 'Responsable Dummy 19', 19, 19),
(20, 20, '2026-06-20 14:00:00', 'Observacion dummy 20', 'Accion ficticia de seguimiento 20', 'Responsable Dummy 20', 20, 20);

INSERT INTO alertas (id_alerta, id_infante, id_evaluacion, tipo, mensaje, estado, creada_en, atendida_por, atendida_en) VALUES
(1, 1, 1, 'indicador', 'Alerta ficticia 1', 'atendida', '2026-06-01 15:00:00', 1, '2026-06-01 16:00:00'),
(2, 2, NULL, 'medicion_pendiente', 'Alerta ficticia 2', 'descartada', '2026-06-02 15:00:00', NULL, NULL),
(3, 3, 3, 'indicador', 'Alerta ficticia 3', 'pendiente', '2026-06-03 15:00:00', NULL, NULL),
(4, 4, NULL, 'medicion_pendiente', 'Alerta ficticia 4', 'atendida', '2026-06-04 15:00:00', 4, '2026-06-04 16:00:00'),
(5, 5, 5, 'indicador', 'Alerta ficticia 5', 'descartada', '2026-06-05 15:00:00', NULL, NULL),
(6, 6, NULL, 'medicion_pendiente', 'Alerta ficticia 6', 'pendiente', '2026-06-06 15:00:00', NULL, NULL),
(7, 7, 7, 'indicador', 'Alerta ficticia 7', 'atendida', '2026-06-07 15:00:00', 7, '2026-06-07 16:00:00'),
(8, 8, NULL, 'medicion_pendiente', 'Alerta ficticia 8', 'descartada', '2026-06-08 15:00:00', NULL, NULL),
(9, 9, 9, 'indicador', 'Alerta ficticia 9', 'pendiente', '2026-06-09 15:00:00', NULL, NULL),
(10, 10, NULL, 'medicion_pendiente', 'Alerta ficticia 10', 'atendida', '2026-06-10 15:00:00', 10, '2026-06-10 16:00:00'),
(11, 11, 11, 'indicador', 'Alerta ficticia 11', 'descartada', '2026-06-11 15:00:00', NULL, NULL),
(12, 12, NULL, 'medicion_pendiente', 'Alerta ficticia 12', 'pendiente', '2026-06-12 15:00:00', NULL, NULL),
(13, 13, 13, 'indicador', 'Alerta ficticia 13', 'atendida', '2026-06-13 15:00:00', 13, '2026-06-13 16:00:00'),
(14, 14, NULL, 'medicion_pendiente', 'Alerta ficticia 14', 'descartada', '2026-06-14 15:00:00', NULL, NULL),
(15, 15, 15, 'indicador', 'Alerta ficticia 15', 'pendiente', '2026-06-15 15:00:00', NULL, NULL),
(16, 16, NULL, 'medicion_pendiente', 'Alerta ficticia 16', 'atendida', '2026-06-16 15:00:00', 16, '2026-06-16 16:00:00'),
(17, 17, 17, 'indicador', 'Alerta ficticia 17', 'descartada', '2026-06-17 15:00:00', NULL, NULL),
(18, 18, NULL, 'medicion_pendiente', 'Alerta ficticia 18', 'pendiente', '2026-06-18 15:00:00', NULL, NULL),
(19, 19, 19, 'indicador', 'Alerta ficticia 19', 'atendida', '2026-06-19 15:00:00', 19, '2026-06-19 16:00:00'),
(20, 20, NULL, 'medicion_pendiente', 'Alerta ficticia 20', 'descartada', '2026-06-20 15:00:00', NULL, NULL);

INSERT INTO avisos_tutores (id_aviso, id_infante, mensaje, publicado_por, publicado_en) VALUES
(1, 1, 'Aviso de prueba ficticio 1', 1, '2026-06-01 17:00:00'),
(2, 2, 'Aviso de prueba ficticio 2', 2, '2026-06-02 17:00:00'),
(3, 3, 'Aviso de prueba ficticio 3', 3, '2026-06-03 17:00:00'),
(4, 4, 'Aviso de prueba ficticio 4', 4, '2026-06-04 17:00:00'),
(5, 5, 'Aviso de prueba ficticio 5', 5, '2026-06-05 17:00:00'),
(6, 6, 'Aviso de prueba ficticio 6', 6, '2026-06-06 17:00:00'),
(7, 7, 'Aviso de prueba ficticio 7', 7, '2026-06-07 17:00:00'),
(8, 8, 'Aviso de prueba ficticio 8', 8, '2026-06-08 17:00:00'),
(9, 9, 'Aviso de prueba ficticio 9', 9, '2026-06-09 17:00:00'),
(10, 10, 'Aviso de prueba ficticio 10', 10, '2026-06-10 17:00:00'),
(11, 11, 'Aviso de prueba ficticio 11', 11, '2026-06-11 17:00:00'),
(12, 12, 'Aviso de prueba ficticio 12', 12, '2026-06-12 17:00:00'),
(13, 13, 'Aviso de prueba ficticio 13', 13, '2026-06-13 17:00:00'),
(14, 14, 'Aviso de prueba ficticio 14', 14, '2026-06-14 17:00:00'),
(15, 15, 'Aviso de prueba ficticio 15', 15, '2026-06-15 17:00:00'),
(16, 16, 'Aviso de prueba ficticio 16', 16, '2026-06-16 17:00:00'),
(17, 17, 'Aviso de prueba ficticio 17', 17, '2026-06-17 17:00:00'),
(18, 18, 'Aviso de prueba ficticio 18', 18, '2026-06-18 17:00:00'),
(19, 19, 'Aviso de prueba ficticio 19', 19, '2026-06-19 17:00:00'),
(20, 20, 'Aviso de prueba ficticio 20', 20, '2026-06-20 17:00:00');

INSERT INTO bitacora (id_evento, id_usuario, fecha_hora, accion, entidad, id_registro, valor_anterior, valor_nuevo, motivo) VALUES
(1, 1, '2026-06-01 18:00:00', 'INSERT_DUMMY', 'infantes', '1', NULL, '{"dummy": true, "id": 1}', 'Evento ficticio de prueba'),
(2, 2, '2026-06-02 18:00:00', 'INSERT_DUMMY', 'infantes', '2', NULL, '{"dummy": true, "id": 2}', 'Evento ficticio de prueba'),
(3, 3, '2026-06-03 18:00:00', 'INSERT_DUMMY', 'infantes', '3', NULL, '{"dummy": true, "id": 3}', 'Evento ficticio de prueba'),
(4, 4, '2026-06-04 18:00:00', 'INSERT_DUMMY', 'infantes', '4', NULL, '{"dummy": true, "id": 4}', 'Evento ficticio de prueba'),
(5, 5, '2026-06-05 18:00:00', 'INSERT_DUMMY', 'infantes', '5', NULL, '{"dummy": true, "id": 5}', 'Evento ficticio de prueba'),
(6, 6, '2026-06-06 18:00:00', 'INSERT_DUMMY', 'infantes', '6', NULL, '{"dummy": true, "id": 6}', 'Evento ficticio de prueba'),
(7, 7, '2026-06-07 18:00:00', 'INSERT_DUMMY', 'infantes', '7', NULL, '{"dummy": true, "id": 7}', 'Evento ficticio de prueba'),
(8, 8, '2026-06-08 18:00:00', 'INSERT_DUMMY', 'infantes', '8', NULL, '{"dummy": true, "id": 8}', 'Evento ficticio de prueba'),
(9, 9, '2026-06-09 18:00:00', 'INSERT_DUMMY', 'infantes', '9', NULL, '{"dummy": true, "id": 9}', 'Evento ficticio de prueba'),
(10, 10, '2026-06-10 18:00:00', 'INSERT_DUMMY', 'infantes', '10', NULL, '{"dummy": true, "id": 10}', 'Evento ficticio de prueba'),
(11, 11, '2026-06-11 18:00:00', 'INSERT_DUMMY', 'infantes', '11', NULL, '{"dummy": true, "id": 11}', 'Evento ficticio de prueba'),
(12, 12, '2026-06-12 18:00:00', 'INSERT_DUMMY', 'infantes', '12', NULL, '{"dummy": true, "id": 12}', 'Evento ficticio de prueba'),
(13, 13, '2026-06-13 18:00:00', 'INSERT_DUMMY', 'infantes', '13', NULL, '{"dummy": true, "id": 13}', 'Evento ficticio de prueba'),
(14, 14, '2026-06-14 18:00:00', 'INSERT_DUMMY', 'infantes', '14', NULL, '{"dummy": true, "id": 14}', 'Evento ficticio de prueba'),
(15, 15, '2026-06-15 18:00:00', 'INSERT_DUMMY', 'infantes', '15', NULL, '{"dummy": true, "id": 15}', 'Evento ficticio de prueba'),
(16, 16, '2026-06-16 18:00:00', 'INSERT_DUMMY', 'infantes', '16', NULL, '{"dummy": true, "id": 16}', 'Evento ficticio de prueba'),
(17, 17, '2026-06-17 18:00:00', 'INSERT_DUMMY', 'infantes', '17', NULL, '{"dummy": true, "id": 17}', 'Evento ficticio de prueba'),
(18, 18, '2026-06-18 18:00:00', 'INSERT_DUMMY', 'infantes', '18', NULL, '{"dummy": true, "id": 18}', 'Evento ficticio de prueba'),
(19, 19, '2026-06-19 18:00:00', 'INSERT_DUMMY', 'infantes', '19', NULL, '{"dummy": true, "id": 19}', 'Evento ficticio de prueba'),
(20, 20, '2026-06-20 18:00:00', 'INSERT_DUMMY', 'infantes', '20', NULL, '{"dummy": true, "id": 20}', 'Evento ficticio de prueba');

COMMIT;

-- Fin de datos dummy. Verificacion rapida de cantidades:
SELECT 'regiones' tabla, COUNT(*) cantidad FROM regiones
UNION ALL SELECT 'estados', COUNT(*) FROM estados
UNION ALL SELECT 'ebdi', COUNT(*) FROM ebdi
UNION ALL SELECT 'roles', COUNT(*) FROM roles
UNION ALL SELECT 'permisos', COUNT(*) FROM permisos
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'infantes', COUNT(*) FROM infantes
UNION ALL SELECT 'mediciones', COUNT(*) FROM mediciones
UNION ALL SELECT 'medicion_versiones', COUNT(*) FROM medicion_versiones;





SELECT
    i.id_infante,
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
    t.nombre AS nombre_tutor,
    s.estado

FROM infantes i

LEFT JOIN mediciones_vigentes mv
    ON i.id_infante = mv.id_infante

LEFT JOIN infante_tutor it
    ON i.id_infante = it.id_infante

LEFT JOIN tutores t
    ON it.id_tutor = t.id_tutor
    
LEFT JOIN seguimientos s 
	ON i.id_infante = s.id_infante;
    

SELECT
            e.id_ebdi AS id,
            e.nombre AS nombre_ebdi,
            e.id_estado,
            e.clave,
            e.activa AS activo,
            es.nombre AS nombre_estado

        FROM ebdi e

        LEFT JOIN estados es
            ON e.id_estado = es.id_estado;
            
SELECT
            r.id_region AS id,
            r.nombre AS nombre_region

        FROM regiones r;
        
Select * from 
