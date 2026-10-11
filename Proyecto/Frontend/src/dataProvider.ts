import { type DataProvider } from "react-admin";

// Lo siguiente solo es para mostrar datos de ejemplo ficticios y poder probar la interfaz
type Infante = {
  id: number;
  nombre: string;
  fechaNacimiento?: string;
  sexo?: string;
  unidadAtencion?: string;
  tutor?: string;
  matricula?: string;
  ebdiId?: number;
  fechaIngreso?: string;
  activo?: boolean;
  seguimientoActivo?: boolean;
  restriccionesAlimentarias?: string;
  ultimaMedicion?: string;
  diasDesdeUltimaMedicion?: number | null;
  estadoSeguimiento?: string;
};

const infantes: Infante[] = [
  { id: 1, nombre: "Sofía Martínez", fechaNacimiento: "2024-01-15", ebdiId: 1, matricula: "EJ-001", fechaIngreso: "2025-01-15", activo: true, seguimientoActivo: true, },
  { id: 2, nombre: "Mateo Hernández", fechaNacimiento: "2023-12-10", ebdiId: 2, matricula: "EJ-002", fechaIngreso: "2024-08-01", activo: true, seguimientoActivo: true, },
  { id: 3, nombre: "Valentina López", fechaNacimiento: "2024-05-20", ebdiId: 3, matricula: "EJ-003", fechaIngreso: "2025-02-10", activo: true, seguimientoActivo: false, },
];

type Medicion = {
  id: number;
  infanteId: number;
  fecha: string;
  pesoKg: number;
  tallaCm: number;
  perimetroCefalicoCm?: number;
  observaciones?: string;
};

const mediciones: Medicion[] = [
  {
    id: 1,
    infanteId: 1,
    fecha: "2026-07-01",
    pesoKg: 12.4,
    tallaCm: 86.5,
    perimetroCefalicoCm: 48.2,
    observaciones: "Medición de ejemplo.",
  },
  {
    id: 2,
    infanteId: 2,
    fecha: "2026-09-15",
    pesoKg: 14.2,
    tallaCm: 92.0,
    perimetroCefalicoCm: 49.1,
    observaciones: "Registro de prueba.",
  },
];

type Seguimiento = {
  id: number;
  infanteId: number;
  fecha: string;
  motivo: string;
  observaciones: string;
  acciones: string;
  responsable: string;
  estado: string;
};

const seguimientos: Seguimiento[] = [
  {
    id: 1,
    infanteId: 1,
    fecha: "2026-10-05",
    motivo: "Revisión periódica del crecimiento",
    observaciones: "Se requiere revisar la evolución de las mediciones.",
    acciones: "Programar una nueva medición.",
    responsable: "Personal de nutrición",
    estado: "En seguimiento",
  },
];


// Catálogos organizacionales de ejemplo. Sustituir por el catálogo oficial validado.
type Region = { id: number; nombre: string; descripcion?: string };
type Estado = { id: number; nombre: string; regionId: number };
type EBDI = { id: number; nombre: string; clave: string; estadoId: number; municipio?: string; activo: boolean };

const regiones: Region[] = [
  { id: 1, nombre: "Norte", descripcion: "Región de ejemplo" },
  { id: 2, nombre: "Sur", descripcion: "Región de ejemplo" },
  { id: 3, nombre: "Este", descripcion: "Región de ejemplo" },
  { id: 4, nombre: "Oeste", descripcion: "Región de ejemplo" },
];

const estados: Estado[] = [
  { id: 1, nombre: "Nuevo León", regionId: 1 },
  { id: 2, nombre: "Ciudad de México", regionId: 2 },
  { id: 3, nombre: "Jalisco", regionId: 4 },
];

const ebdis: EBDI[] = [
  { id: 1, nombre: "EBDI de ejemplo Norte", clave: "EJ-NL-001", estadoId: 1, municipio: "Monterrey", activo: true },
  { id: 2, nombre: "EBDI de ejemplo Centro", clave: "EJ-CDMX-001", estadoId: 2, municipio: "Ciudad de México", activo: true },
  { id: 3, nombre: "EBDI de ejemplo Oeste", clave: "EJ-JAL-001", estadoId: 3, municipio: "Guadalajara", activo: true },
];

// Alcance de acceso DEMO.
function rolActual(): string { return localStorage.getItem("userRole") ?? "sin_perfil"; }
function idsInfantesPermitidos(): number[] {
  const rol = rolActual();
  if (rol === "administrador") return infantes.map((x) => x.id);
  if (rol === "tutor") {
    try { return JSON.parse(localStorage.getItem("userInfanteIds") ?? "[]").map(Number); } catch { return []; }
  }
  if (rol === "estancia") {
    const ebdiId = Number(localStorage.getItem("userEbdiId"));
    return infantes.filter((x) => Number(x.ebdiId) === ebdiId).map((x) => x.id);
  }
  if (rol === "coordinador_regional") {
    const regionId = Number(localStorage.getItem("userRegionId"));
    const estadosDeRegion = estados.filter((x) => Number(x.regionId) === regionId).map((x) => x.id);
    const ebdisDeRegion = ebdis.filter((x) => estadosDeRegion.includes(Number(x.estadoId))).map((x) => x.id);
    return infantes.filter((x) => ebdisDeRegion.includes(Number(x.ebdiId))).map((x) => x.id);
  }
  return [];
}
function puedeConsultarRecurso(resource: string): boolean {
  const rol = rolActual();
  if (rol === "administrador") return true;
  if (["infantes", "mediciones", "seguimientos", "crecimiento", "alertas"].includes(resource)) return ["estancia", "coordinador_regional", "tutor"].includes(rol);
  if (resource === "reportes") return ["estancia", "coordinador_regional"].includes(rol);
  if (["regiones", "estados", "ebdis"].includes(resource)) return rol === "coordinador_regional" || (rol === "estancia" && resource === "ebdis");
  return false;
}
function puedeModificarRecurso(resource: string): boolean {
  const rol = rolActual();
  if (rol === "administrador") return true;
  return rol === "estancia" && ["infantes", "mediciones", "seguimientos"].includes(resource);
}
function infantePermitido(infanteId: unknown): boolean { return idsInfantesPermitidos().includes(Number(infanteId)); }
function medicionPermitida(item: Medicion): boolean { return infantePermitido(item.infanteId); }
function seguimientoPermitido(item: Seguimiento): boolean { return infantePermitido(item.infanteId); }

// funcion para calcular la edad
function calcularEdadEnMeses(fechaNacimiento?: string, fechaMedicion?: string): number | null {
  if (!fechaNacimiento || !fechaMedicion) {
    return null;
  }

  const [anioN, mesN, diaN] = fechaNacimiento.split("-").map(Number);
  const [anioM, mesM, diaM] = fechaMedicion.split("-").map(Number);

  if (!anioN || !mesN || !diaN || !anioM || !mesM || !diaM) {
    return null;
  }

  const nacimiento = new Date(anioN, mesN - 1, diaN);
  const medicion = new Date(anioM, mesM - 1, diaM);

  if (
    nacimiento.getFullYear() !== anioN ||
    nacimiento.getMonth() !== mesN - 1 ||
    nacimiento.getDate() !== diaN ||
    medicion.getFullYear() !== anioM ||
    medicion.getMonth() !== mesM - 1 ||
    medicion.getDate() !== diaM ||
    medicion < nacimiento
  ) {
    return null;
  }

  let meses = (anioM - anioN) * 12 + (mesM - mesN);

  if (diaM < diaN) {
    meses--;
  }

  return meses;
}

function obtenerResumenMediciones(infanteId: number) {
  const registros = mediciones
    .filter((m) => m.infanteId === infanteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (registros.length === 0) {
    return {
      ultimaMedicion: "",
      diasDesdeUltimaMedicion: null,
      estadoSeguimiento: "Sin mediciones",
    };
  }

  const ultimaMedicion = registros[0].fecha;

  const fechaUltima = new Date(`${ultimaMedicion}T00:00:00Z`);
  const hoy = new Date();
  const fechaHoy = new Date(
    Date.UTC(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    )
  );

  const diasDesdeUltimaMedicion = Math.floor(
    (fechaHoy.getTime() - fechaUltima.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    ultimaMedicion,
    diasDesdeUltimaMedicion,
    estadoSeguimiento:
      diasDesdeUltimaMedicion > 45
        ? "Medición pendiente"
        : "Al día",
  };
}

export const dataProvider: DataProvider = {
  getList: async (resource: string, _params: any) => {
    if (!puedeConsultarRecurso(resource)) return { data: [], total: 0 } as any;
    if (resource === "infantes") {
      const infantesConSeguimiento = infantes.filter((infante) => infantePermitido(infante.id)).map((infante) => ({
        ...infante,
        ...obtenerResumenMediciones(infante.id),
      }));
      return {
        data: infantesConSeguimiento as any[],
        total: infantesConSeguimiento.length,
      } as any;
    } 

    if(resource === "mediciones") {
      const filtradas = mediciones.filter(medicionPermitida);
      return { data: filtradas as any[], total: filtradas.length } as any;
    }

    if (resource === "seguimientos") {
      const filtrados = seguimientos.filter(seguimientoPermitido);
      return { data: filtrados as any[], total: filtrados.length } as any;
    }

    if (resource === "alertas") {
      const alertas = infantes
        .filter((infante) => infantePermitido(infante.id))
        .map((infante) => {
          const resumen = obtenerResumenMediciones(infante.id);
          return {
            id: infante.id,
            infanteId: infante.id,
            nombre: infante.nombre,
            ...resumen,
          };
        })
        .filter((infante) => infante.estadoSeguimiento !== "Al día").sort((a, b) => {
          if (a.diasDesdeUltimaMedicion == null) return -1;
          if (b.diasDesdeUltimaMedicion == null) return 1;
          return b.diasDesdeUltimaMedicion - a.diasDesdeUltimaMedicion;
        });
      return {
        data: alertas as any[],
        total: alertas.length,
      } as any;
    }

    if (resource === "regiones") {
      const disponibles = rolActual() === "coordinador_regional"
        ? regiones.filter((r) => String(r.id) === localStorage.getItem("userRegionId"))
        : regiones;
      return { data: disponibles as any[], total: disponibles.length } as any;
    }
    if (resource === "estados") {
      let filtrados = _params.filter?.regionId
        ? estados.filter((item) => String(item.regionId) === String(_params.filter.regionId))
        : [...estados];
      if (rolActual() === "coordinador_regional") filtrados = filtrados.filter((item) => String(item.regionId) === localStorage.getItem("userRegionId"));
      return { data: filtrados as any[], total: filtrados.length } as any;
    }
    if (resource === "ebdis") {
      let filtrados = [...ebdis];
      if (_params.filter?.estadoId) filtrados = filtrados.filter((item) => String(item.estadoId) === String(_params.filter.estadoId));
      if (_params.filter?.regionId) {
        const idsEstados = estados.filter((e) => String(e.regionId) === String(_params.filter.regionId)).map((e) => e.id);
        filtrados = filtrados.filter((item) => idsEstados.includes(item.estadoId));
      }
      if (rolActual() === "estancia") filtrados = filtrados.filter((item) => String(item.id) === localStorage.getItem("userEbdiId"));
      if (rolActual() === "coordinador_regional") {
        const regionId = Number(localStorage.getItem("userRegionId"));
        const estadosDeRegion = estados.filter((e) => e.regionId === regionId).map((e) => e.id);
        filtrados = filtrados.filter((item) => estadosDeRegion.includes(item.estadoId));
      }
      return { data: filtrados as any[], total: filtrados.length } as any;
    }

    return { data: [], total: 0 } as any;
  },

  getOne: async (resource, params) => {
    console.log("getOne recibio:", resource, params.id);
    const id = String(params.id);

    if (resource === "infantes") {
      const infante = infantes.find(
        (item) => String(item.id) === id
      );

      if (!infante || !infantePermitido(infante.id)) {
        throw new Error(`Infante con ID ${id} no encontrado o fuera de tu ámbito de acceso`);
      }

      return { data: { ...infante, ...obtenerResumenMediciones(infante.id) } as any };
    }

    if (resource === "mediciones") {
      const medicion = mediciones.find(
        (item) => String(item.id) === String(params.id)
      );

      if (!medicion || !medicionPermitida(medicion)) {
        throw new Error(`Medición con ID ${id} no encontrada o fuera de tu ámbito de acceso`);
      }

      return { data: medicion as any };
    }

    if (resource === "seguimientos") {
      const seguimiento = seguimientos.find((item) => String(item.id) === String(params.id));
      if (!seguimiento || !seguimientoPermitido(seguimiento)) {
        throw new Error(`Seguimiento con ID ${params.id} no encontrado o fuera de tu ámbito de acceso`);
      }
      return { data: seguimiento as any };
    }

    if (resource === "regiones") {
      const item = regiones.find((x) => String(x.id) === id);
      if (!item || (rolActual() === "coordinador_regional" && String(item.id) !== localStorage.getItem("userRegionId"))) throw new Error(`Región con ID ${id} no encontrada o fuera de tu ámbito de acceso`);
      return { data: item as any };
    }
    if (resource === "estados") {
      const item = estados.find((x) => String(x.id) === id);
      if (!item || (rolActual() === "coordinador_regional" && String(item.regionId) !== localStorage.getItem("userRegionId"))) throw new Error(`Estado con ID ${id} no encontrado o fuera de tu ámbito de acceso`);
      return { data: item as any };
    }
    if (resource === "ebdis") {
      const item = ebdis.find((x) => String(x.id) === id);
      const estado = item ? estados.find((e) => e.id === item.estadoId) : undefined;
      if (!item || (rolActual() === "estancia" && String(item.id) !== localStorage.getItem("userEbdiId")) || (rolActual() === "coordinador_regional" && String(estado?.regionId) !== localStorage.getItem("userRegionId"))) throw new Error(`EBDI con ID ${id} no encontrada o fuera de tu ámbito de acceso`);
      return { data: item as any };
    }

    throw new Error(`Recurso ${resource} no encontrado`);
  },

  getMany: async (resource, params) => {
    if (resource === "infantes") {
      return {data: infantes.filter((item) => params.ids.map(String).includes(String(item.id)) && infantePermitido(item.id)) as any[],};
    }
    if (resource === "mediciones") {
      return {data: mediciones.filter((item) => params.ids.map(String).includes(String(item.id)) && medicionPermitida(item)) as any[],};
    }
    if (resource === "seguimientos") {
      return {data: seguimientos.filter((item) => params.ids.map(String).includes(String(item.id)) && seguimientoPermitido(item)) as any[],};
    }
    if (resource === "regiones") return { data: regiones.filter((item) => params.ids.map(String).includes(String(item.id))) as any[] };
    if (resource === "estados") return { data: estados.filter((item) => params.ids.map(String).includes(String(item.id))) as any[] };
    if (resource === "ebdis") return { data: ebdis.filter((item) => params.ids.map(String).includes(String(item.id))) as any[] };
    return { data: [] };
  },

  getManyReference: async (resource, params) => {
    if (resource !== "mediciones") {
      return { data: [], total: 0 };
    }
    const infanteId = String(params.id);
    if (!infantePermitido(infanteId)) return { data: [], total: 0 };
    const filtradas = mediciones.filter((medicion) => String((medicion as any)[params.target]) === infanteId && medicionPermitida(medicion)).sort((a, b) => {
        const direccion = params.sort?.order === "ASC" ? 1 : -1;
        const campo = params.sort?.field ?? "fecha";
        return (String((a as any)[campo] ?? "").localeCompare(String((b as any)[campo] ?? "")) * direccion);
      });
    const total = filtradas.length;
    const pagina = params.pagination?.page ?? 1;
    const porPagina = params.pagination?.perPage ?? 25;
    const datosPagina = filtradas.slice((pagina - 1) * porPagina, pagina * porPagina);
    const infante = infantes.find((item) => String(item.id) === infanteId);
    const datosConEdad = datosPagina.map((medicion) => {
      const meses = calcularEdadEnMeses(
        infante?.fechaNacimiento,
        medicion.fecha
      );
      return {
        ...medicion,
        edadEnMedicion: meses === null ? "No disponible" : `${Math.floor(meses / 12)} años y ${meses % 12} meses`,
      };
    });
    return {data: datosConEdad as any[], total,};
  },

  create: async (resource, params) => {
    if (!puedeModificarRecurso(resource)) throw new Error("Tu perfil no tiene permiso para crear registros en este módulo.");
    if (resource === "infantes") {
      const datos = { ...params.data };
      if (rolActual() === "estancia") datos.ebdiId = Number(localStorage.getItem("userEbdiId"));
      const nuevoInfante = {
        ...datos,
        id: Date.now(),
      } as Infante;
      infantes.push(nuevoInfante);
      return { data: nuevoInfante as any };
    }

    if (resource === "mediciones") {
      if (!infantePermitido(params.data.infanteId)) throw new Error("No puedes registrar mediciones para un infante fuera de tu ámbito.");
      const nuevaMedicion: Medicion = {
        ...params.data,
        id: Date.now(),
      } as Medicion;
      mediciones.push(nuevaMedicion);
      return { data: nuevaMedicion as any };
    }

    if (resource === "seguimientos") {
      if (!infantePermitido(params.data.infanteId)) throw new Error("No puedes registrar seguimientos para un infante fuera de tu ámbito.");
      const nuevoSeguimiento: Seguimiento = {
        ...params.data,
        id: Date.now(),
      } as Seguimiento;
      seguimientos.push(nuevoSeguimiento);
      return { data: nuevoSeguimiento as any };
    }

    if (resource === "regiones") {
      const data = params.data as Partial<Region>;
      const nuevo: Region = {
        ...data,
        nombre: data.nombre ?? "",
        id: Date.now(),
      };
      regiones.push(nuevo);
      return { data: nuevo as any };
    }
    if (resource === "estados") {
      const data = params.data as Partial<Estado>;
      const nuevo: Estado = {
        ...data,
        nombre: data.nombre ?? "",
        regionId: Number(data.regionId ?? 0),
        id: Date.now(),
      };
      estados.push(nuevo);
      return { data: nuevo as any };
    }
    if (resource === "ebdis") {
      const data = params.data as Partial<EBDI>;
      const nuevo: EBDI = {
        activo: true,
        ...data,
        nombre: data.nombre ?? "",
        clave: data.clave ?? "",
        estadoId: Number(data.estadoId ?? 0),
        id: Date.now(),
      };
      ebdis.push(nuevo);
      return { data: nuevo as any };
    }
    throw new Error("Recurso no encontrado");
  },

  update: async (resource, params) => {
    if (!puedeModificarRecurso(resource)) throw new Error("Tu perfil no tiene permiso para modificar registros en este módulo.");
    if (resource === "infantes") {
      const index = infantes.findIndex((item) => String(item.id) === String(params.id));
      if (index === -1 || !infantePermitido(infantes[index]?.id)) {
        throw new Error("Infante no encontrado o fuera de tu ámbito de acceso");
      }
      const actualizado = {
        ...infantes[index],
        ...params.data,
        ...(rolActual() === "estancia" ? { ebdiId: Number(localStorage.getItem("userEbdiId")) } : {}),
        id: infantes[index].id,
      };
      infantes[index] = actualizado;
      return { data: actualizado as any };
    }

    if (resource === "mediciones") {
      const index = mediciones.findIndex((item) => String(item.id) === String(params.id));
      if (index === -1 || !medicionPermitida(mediciones[index])) {
        throw new Error("Medición no encontrada o fuera de tu ámbito de acceso");
      }
      if (!infantePermitido(params.data.infanteId ?? mediciones[index].infanteId)) throw new Error("No puedes asignar la medición a un infante fuera de tu ámbito.");
      const actualizada: Medicion = {
        ...mediciones[index],
        ...params.data,
        id: mediciones[index].id,
      };
      mediciones[index] = actualizada;
      return { data: actualizada as any };
    }

    if (resource === "seguimientos") {
      const index = seguimientos.findIndex((item) => String(item.id) === String(params.id));
      if (index === -1 || !seguimientoPermitido(seguimientos[index])) {
        throw new Error("Seguimiento no encontrado o fuera de tu ámbito de acceso");
      }
      if (!infantePermitido(params.data.infanteId ?? seguimientos[index].infanteId)) throw new Error("No puedes asignar el seguimiento a un infante fuera de tu ámbito.");
      const actualizado: Seguimiento = {
        ...seguimientos[index],
        ...params.data,
        id: seguimientos[index].id,
      };
      seguimientos[index] = actualizado;
      return { data: actualizado as any };
    }

    if (resource === "regiones") {
      const i = regiones.findIndex((x) => String(x.id) === String(params.id));
      if (i < 0) throw new Error("Región no encontrada");
      regiones[i] = { ...regiones[i], ...params.data, id: regiones[i].id };
      return { data: regiones[i] as any };
    }
    if (resource === "estados") {
      const i = estados.findIndex((x) => String(x.id) === String(params.id));
      if (i < 0) throw new Error("Estado no encontrado");
      estados[i] = { ...estados[i], ...params.data, id: estados[i].id };
      return { data: estados[i] as any };
    }
    if (resource === "ebdis") {
      const i = ebdis.findIndex((x) => String(x.id) === String(params.id));
      if (i < 0) throw new Error("EBDI no encontrado");
      ebdis[i] = { ...ebdis[i], ...params.data, id: ebdis[i].id };
      return { data: ebdis[i] as any };
    }
    throw new Error("Recurso no encontrado");
  },

  updateMany: async (resource, params) => {
    if (!puedeModificarRecurso(resource)) throw new Error("Tu perfil no tiene permiso para modificar registros en este módulo.");
    return { data: params.ids };
  },

  delete: async (resource, params) => {
    if (rolActual() !== "administrador") throw new Error("Solo el administrador puede eliminar registros.");
    return { data: params.previousData as any };
  },

  deleteMany: async (resource, params) => {
    if (rolActual() !== "administrador") throw new Error("Solo el administrador puede eliminar registros.");
    return { data: params.ids };
  },
};