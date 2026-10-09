import type { DataProvider } from "react-admin";

export const dataProvider: DataProvider = {
  getList: async () => ({
    data: [],
    total: 0,
  }),

  getOne: async (_resource, _params) => ({
    data: {} as any,
  }),

  getMany: async () => ({
    data: [],
  }),

  getManyReference: async () => ({
    data: [],
    total: 0,
  }),

  create: async (_resource, params) => ({
    data: params.data as any,
  }),

  update: async (_resource, params) => ({
    data: params.data as any,
  }),

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