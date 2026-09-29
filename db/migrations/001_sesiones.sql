-- NOMBRE DE LA TABLA: sesiones
-- Cómo funciona: guarda solo el hash SHA-256 del identificador aleatorio enviado
-- en cookie HttpOnly. Vence a las 8 horas; cerrar sesión elimina la fila.
CREATE TABLE sesiones (
 token_hash CHAR(64) PRIMARY KEY,
 id_usuario BIGINT NOT NULL,
 expira_en DATETIME NOT NULL,
 FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario),
 INDEX ix_sesiones_expira(expira_en)
) ENGINE=InnoDB;
