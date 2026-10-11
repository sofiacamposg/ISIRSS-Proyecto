import { type DataProvider } from "react-admin";

// Lo siguiente solo es para mostrar datos de ejemplo ficticios y poder probar la interfaz
type Infante = {
  id: number;
  nombre: string;
  fechaNacimiento?: string;
  sexo?: string;
  unidadAtencion?: string;
  tutor?: string;
  ultimaMedicion?: string;
  diasDesdeUltimaMedicion?: number | null;
  estadoSeguimiento?: string;
};

const infantes: Infante[] = [
  { id: 1, nombre: "Sofía Martínez", fechaNacimiento: "2024-01-15", },
  { id: 2, nombre: "Mateo Hernández", fechaNacimiento: "2023-12-10", },
  { id: 3, nombre: "Valentina López", fechaNacimiento: "2024-05-20", },
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

      return { data: infante as any };
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