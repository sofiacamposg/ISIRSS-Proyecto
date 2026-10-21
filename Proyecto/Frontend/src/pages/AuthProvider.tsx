import type { AuthProvider } from "react-admin";
const API_URL = "http://localhost:3000";
const clavesSesion = [
    "username",
    "userRole",
    "userFullName",
    "userId",
    "userCorreo",
    "userRegionId",
    "userEbdiId",
    "userInfanteIds",
    "token",
];
function limpiarSesion() {
    clavesSesion.forEach((key) => localStorage.removeItem(key));
}
export const authProvider: AuthProvider = {
    async login({ username, password }) {
        const correo = String(username ?? "").trim();
        if (!correo || typeof password !== "string" || !password) {
            throw new Error("Ingresa tu correo y contraseña.");
        }
        let response: Response;
        try {
            response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    correo,
                    password,
                }),
            });
        } catch {
            throw new Error(
                "No se pudo conectar con el servidor. Verifica que el backend esté encendido."
            );
        }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(
                data.mensaje ?? "No fue posible iniciar sesión."
            );
        }
        const usuario = data.usuario;
        if (!usuario || usuario.id_usuario == null || !usuario.correo || !usuario.rol) {
            throw new Error("El servidor devolvió una respuesta incompleta.");
        }
        if (typeof data.token !== "string" || !data.token) {
            throw new Error("El servidor no devolvió el token de autenticación.");
        }
        // Evita conservar datos de una sesión anterior.
        limpiarSesion();
        localStorage.setItem("username", usuario.correo);
        localStorage.setItem("userRole", usuario.rol);
        localStorage.setItem("userFullName", usuario.nombre);
        localStorage.setItem("userId", String(usuario.id_usuario));
        localStorage.setItem("userCorreo", usuario.correo);
        localStorage.setItem("token", data.token);
    },
    async logout() {
        limpiarSesion();
    },
    async checkError({ status }) {
        if (status === 401 || status === 403) {
            limpiarSesion();
            throw new Error(
                "Tu sesión expiró o no tienes permiso para realizar esta acción."
            );
        }
    },
    async checkAuth() {
        if (
            !localStorage.getItem("username") ||
            !localStorage.getItem("userRole")
        ) {
            throw new Error("Debes iniciar sesión para acceder a la plataforma.");
        }
    },
    async getPermissions() {
        return localStorage.getItem("userRole") ?? "sin_perfil";
    },
    async canAccess({ resource, action }) {
        const role = localStorage.getItem("userRole");
        if (!role || !resource) {
            return false;
        }
        // El administrador tiene acceso completo en la interfaz.
        if (role === "administrador") {
            return true;
        }
        const permisos: Record<string, Record<string, string[]>> = {
            coordinador_regional: {
                tutores: ["list", "show"],
                infantes: ["list", "show"],
                mediciones: ["list", "show"],
                seguimientos: ["list", "show"],
                crecimiento: ["list", "show"],
                alertas: ["list", "show"],
                reportes: ["list", "show", "export"],
                regiones: ["list", "show"],
                estados: ["list", "show"],
                ebdis: ["list", "show"],
            },
            estancia: {
                tutores: ["list", "show"],
                infantes: ["list", "show", "create", "edit"],
                mediciones: ["list", "show", "create", "edit"],
                seguimientos: ["list", "show", "create", "edit"],
                crecimiento: ["list", "show"],
                alertas: ["list", "show"],
                reportes: ["list", "show", "export"],
            },
            tutor: {
                infantes: ["list", "show"],
                mediciones: ["list", "show"],
                seguimientos: ["list", "show"],
                crecimiento: ["list", "show"],
            },
        };
        return permisos[role]?.[resource]?.includes(action) ?? false;
    },
    async getIdentity() {
        const id = localStorage.getItem("userId");
        const correo = localStorage.getItem("userCorreo");
        const fullName = localStorage.getItem("userFullName");
        if (!id || !correo) {
            throw new Error("No hay una sesión activa.");
        }
        return {
            id,
            fullName: fullName ?? correo,
        };
    },
};