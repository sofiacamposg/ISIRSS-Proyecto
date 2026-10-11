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
    if (resource === "infantes") {
      const infantesConSeguimiento = infantes.map((infante) => ({
        ...infante,
        ...obtenerResumenMediciones(infante.id),
      }));
      return {
        data: infantesConSeguimiento as any[],
        total: infantesConSeguimiento.length,
      } as any;
    } 

    if(resource === "mediciones") {
      return {
        data: mediciones as any[],
        total: mediciones.length,
      } as any;
    }

    if (resource === "seguimientos") {
      return {
        data: seguimientos as any[],
        total: seguimientos.length,
      } as any;
    }

    if (resource === "alertas") {
      const alertas = infantes
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
      return { data: regiones as any[], total: regiones.length } as any;
    }
    if (resource === "estados") {
      const filtrados = _params.filter?.regionId ? estados.filter((item) => String(item.regionId) === String(_params.filter.regionId)) : estados;
      return { data: filtrados as any[], total: filtrados.length } as any;
    }
    if (resource === "ebdis") {
      let filtrados = [...ebdis];
      if (_params.filter?.estadoId) filtrados = filtrados.filter((item) => String(item.estadoId) === String(_params.filter.estadoId));
      if (_params.filter?.regionId) {
        const idsEstados = estados.filter((e) => String(e.regionId) === String(_params.filter.regionId)).map((e) => e.id);
        filtrados = filtrados.filter((item) => idsEstados.includes(item.estadoId));
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

      if (!infante) {
        throw new Error(`Infante con ID ${id} no encontrado`);
      }

      return { data: { ...infante, ...obtenerResumenMediciones(infante.id) } as any };
    }

    if (resource === "mediciones") {
      const medicion = mediciones.find(
        (item) => String(item.id) === String(params.id)
      );

      if (!medicion) {
        throw new Error(`Medición con ID ${id} no encontrada`);
      }

      return { data: medicion as any };
    }

    if (resource === "seguimientos") {
      const seguimiento = seguimientos.find((item) => String(item.id) === String(params.id));
      if (!seguimiento) {
        throw new Error(`Seguimiento con ID ${params.id} no encontrado`);
      }
      return { data: seguimiento as any };
    }

    if (resource === "regiones") {
      const item = regiones.find((x) => String(x.id) === id);
      if (!item) throw new Error(`Región con ID ${id} no encontrada`);
      return { data: item as any };
    }
    if (resource === "estados") {
      const item = estados.find((x) => String(x.id) === id);
      if (!item) throw new Error(`Estado con ID ${id} no encontrado`);
      return { data: item as any };
    }
    if (resource === "ebdis") {
      const item = ebdis.find((x) => String(x.id) === id);
      if (!item) throw new Error(`EBDI con ID ${id} no encontrado`);
      return { data: item as any };
    }

    throw new Error(`Recurso ${resource} no encontrado`);
  },

  getMany: async (resource, params) => {
    if (resource === "infantes") {
      return {data: infantes.filter((item) => params.ids.includes(item.id)) as any[],};
    }
    if (resource === "mediciones") {
      return {data: mediciones.filter((item) => params.ids.includes(item.id)) as any[],};
    }
    if (resource === "seguimientos") {
      return {data: seguimientos.filter((item) => params.ids.map(String).includes(String(item.id))) as any[],};
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
    const filtradas = mediciones.filter((medicion) => String((medicion as any)[params.target]) === infanteId).sort((a, b) => {
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
    if (resource === "infantes") {
      const nuevoInfante = {
        ...params.data,
        id: Date.now(),
      } as Infante;
      infantes.push(nuevoInfante);
      return { data: nuevoInfante as any };
    }

    if (resource === "mediciones") {
      const nuevaMedicion: Medicion = {
        ...params.data,
        id: Date.now(),
      } as Medicion;
      mediciones.push(nuevaMedicion);
      return { data: nuevaMedicion as any };
    }

    if (resource === "seguimientos") {
      const nuevoSeguimiento: Seguimiento = {
        ...params.data,
        id: Date.now(),
      } as Seguimiento;
      seguimientos.push(nuevoSeguimiento);
      return { data: nuevoSeguimiento as any };
    }

    if (resource === "regiones") {
      const nuevo: Region = {
        ...(params.data as Partial<Region>),
        nombre: String((params.data as Partial<Region>)?.nombre ?? ""),
        id: Date.now(),
      };
      regiones.push(nuevo);
      return { data: nuevo as any };
    }
    if (resource === "estados") {
      const nuevo: Estado = {
        ...(params.data as Partial<Estado>),
        nombre: String((params.data as Partial<Estado>)?.nombre ?? ""),
        regionId: Number((params.data as Partial<Estado>)?.regionId ?? 0),
        id: Date.now(),
      };
      estados.push(nuevo);
      return { data: nuevo as any };
    }
    if (resource === "ebdis") {
      const nuevo: EBDI = {
        ...(params.data as Partial<EBDI>),
        nombre: String((params.data as Partial<EBDI>)?.nombre ?? ""),
        clave: String((params.data as Partial<EBDI>)?.clave ?? ""),
        estadoId: Number((params.data as Partial<EBDI>)?.estadoId ?? 0),
        activo: Boolean((params.data as Partial<EBDI>)?.activo ?? true),
        id: Date.now(),
      };
      ebdis.push(nuevo);
      return { data: nuevo as any };
    }
    throw new Error("Recurso no encontrado");
  },

  update: async (resource, params) => {
    if (resource === "infantes") {
      const index = infantes.findIndex((item) => String(item.id) === String(params.id));
      if (index === -1) {
        throw new Error("Infante no encontrado");
      }
      const actualizado = {
        ...infantes[index],
        ...params.data,
        id: infantes[index].id,
      };
      infantes[index] = actualizado;
      return { data: actualizado as any };
    }

    if (resource === "mediciones") {
      const index = mediciones.findIndex((item) => String(item.id) === String(params.id));
      if (index === -1) {
        throw new Error("Medición no encontrada");
      }
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
      if (index === -1) {
        throw new Error("Seguimiento no encontrado");
      }
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

  updateMany: async (_resource, params) => ({
    data: params.ids,
  }),

  delete: async (_resource, params) => ({
    data: params.previousData as any,
  }),

  deleteMany: async (_resource, params) => ({
    data: params.ids,
  }),
};