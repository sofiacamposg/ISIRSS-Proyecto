import { GET_ONE, type DataProvider } from "react-admin";

// Lo siguiente solo es para mostrar datos de ejemplo ficticios y poder probar la interfaz
type Infante = {
  id: number;
  nombre: string;
  fechaNacimiento?: string;
  sexo?: string;
  unidadAtencion?: string;
  tutor?: string;
};

const infantes: Infante[] = [
  { id: 1, nombre: "Sofía Martínez" },
  { id: 2, nombre: "Mateo Hernández" },
  { id: 3, nombre: "Valentina López" },
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
    fecha: "2026-09-01",
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

export const dataProvider: DataProvider = {
  getList: async (resource: string, _params: any) => {
    if (resource === "infantes") {
      return {
        data: infantes as any[],
        total: infantes.length,
      } as any;
    }

    if(resource === "mediciones") {
      return {
        data: mediciones as any[],
        total: mediciones.length,
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

    throw new Error(`Recurso ${resource} no encontrado`);
  },

  getMany: async (resource, params) => {
    if (resource === "infantes") {
      return {
        data: infantes.filter(
          (item) => params.ids.includes(item.id)
        ) as any[],
      };
    }

    if (resource === "mediciones") {
      return {
        data: mediciones.filter(
          (item) => params.ids.includes(item.id)
        ) as any[],
      };
    }

    return { data: [] };
  },

  getManyReference: async () => ({
    data: [],
    total: 0,
  }),

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

    throw new Error("Recurso no encontrado");
  },

  update: async (resource, params) => {
    if (resource === "infantes") {
      const index = infantes.findIndex(
        (item) => String(item.id) === String(params.id)
      );

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
      const index = mediciones.findIndex(
        (item) => String(item.id) === String(params.id)
      );

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