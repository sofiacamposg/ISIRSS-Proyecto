import type { AuthProvider } from "react-admin";

// Cuentas DEMO para probar la interfaz. No usar estas credenciales en producción.
const cuentasDemo: Record<string, { password: string; role: string; fullName: string; regionId?: number; ebdiId?: number; infanteIds?: number[] }> = {
  admin: { password: "admin123", role: "administrador", fullName: "Administrador del sistema" },
  coordinador: { password: "coord123", role: "coordinador_regional", fullName: "Coordinador regional", regionId: 1 },
  estancia: { password: "ebdi123", role: "estancia", fullName: "Personal de EBDI", ebdiId: 1 },
  tutor: { password: "tutor123", role: "tutor", fullName: "Padre, madre o tutor", infanteIds: [1] },
};

export const authProvider: AuthProvider = {
  async login({ username, password }) {
    const cuenta = cuentasDemo[String(username ?? "").trim().toLowerCase()];
    if (!cuenta || cuenta.password !== password) {
      throw new Error("Usuario o contraseña incorrectos. Revisa las cuentas de demostración.");
    }
    localStorage.setItem("username", String(username).trim().toLowerCase());
    localStorage.setItem("userRole", cuenta.role);
    localStorage.setItem("userFullName", cuenta.fullName);
    if (cuenta.regionId) localStorage.setItem("userRegionId", String(cuenta.regionId));
    else localStorage.removeItem("userRegionId");
    if (cuenta.ebdiId) localStorage.setItem("userEbdiId", String(cuenta.ebdiId));
    else localStorage.removeItem("userEbdiId");
    if (cuenta.infanteIds) localStorage.setItem("userInfanteIds", JSON.stringify(cuenta.infanteIds));
    else localStorage.removeItem("userInfanteIds");
  },
  async logout() {
    ["username", "userRole", "userFullName", "userRegionId", "userEbdiId", "userInfanteIds"].forEach((key) => localStorage.removeItem(key));
  },
  async checkError({ status }) {
    if (status === 401 || status === 403) {
      ["username", "userRole", "userFullName", "userRegionId", "userEbdiId", "userInfanteIds"].forEach((key) => localStorage.removeItem(key));
      throw new Error("Tu sesión expiró o no tienes permiso para realizar esta acción.");
    }
  },
  async checkAuth() {
    if (!localStorage.getItem("username") || !localStorage.getItem("userRole")) {
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

    // El administrador tiene acceso completo.
    if (role === "administrador") {
      return true;
    }

    // Recursos disponibles para cada perfil.
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
        ebdi: ["list", "show"],
      },
      estancia: {
        tutores: ["list", "show"],
        infantes: ["list", "show", "create", "edit"],
        mediciones: ["list", "show", "create", "edit"],
        seguimientos: ["list", "show", "create", "edit"],
        crecimiento: ["list", "show"],
        alertas: ["list", "show"],
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
    const username = localStorage.getItem("username");
    if (!username) throw new Error("No hay una sesión activa.");
    return {
      id: username,
      fullName: localStorage.getItem("userFullName") ?? username,
    };
  },
};
