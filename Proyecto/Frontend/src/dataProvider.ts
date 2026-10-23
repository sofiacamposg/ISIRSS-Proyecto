import { fetchUtils } from "react-admin";
import jsonServerProvider from "ra-data-json-server";

const fetchJsonUtil=(url:string, options:fetchUtils.Options={}) => {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    const token = sessionStorage.getItem("token");
    if (token) {
        headers.set("Authentication", `Bearer ${token}`);
    }
    options.headers = headers;
    return fetchUtils.fetchJson(url, options);
};

export const baseDataProvider = jsonServerProvider(import.meta.env.VITE_BACKEND, fetchJsonUtil);

//Lo siguiente esta pensando para que las graficas funcionen y se muestre bien el historial de crecimiento, ya que jsonServerProvider directamente, así que getManyReference construye la petición con los parámetros propios de JSON Server.
//Personalizacion de getManyReference
export const dataProvider = {
  ...baseDataProvider, //toma la base


  getManyReference: async (resource, params) => {
    if (resource !== "mediciones" || params.target !== "id_infante") {
      return baseDataProvider.getManyReference(resource, params);
    }

    //Paginacion
    const { page, perPage } = params.pagination;
    //Ordenamiento
    const { field, order } = params.sort;

    //Reconstruccion de los parametros de consulta
    const query = new URLSearchParams({
      target: params.target,
      id: String(params.id),
      _start: String((page - 1) * perPage),
      _end: String(page * perPage),
      _sort: field,
      _order: order,
    });

    //Peticion HTTPS
    const url = `${import.meta.env.VITE_BACKEND}/mediciones?${query.toString()}`;
    const { json, headers } = await fetchJsonUtil(url);

    const total = Number(headers.get("X-Total-Count") ?? json.length);

    return {
      data: json,
      total,
    };
  },

  // Autorizar o revocar una relación tutor-infante mediante PATCH.
    update: async (resource, params) => {
        if (resource !== "infante_tutor") {
            return baseDataProvider.update(resource, params);
        }
        const url =`${import.meta.env.VITE_BACKEND}/infante_tutor/` + encodeURIComponent(String(params.id));
        const { json } = await fetchJsonUtil(url, {
            method: "PATCH",
            body: JSON.stringify({
                acceso_autorizado: params.data.acceso_autorizado,
            }),
        });
        return {
            data: json,
        };
    },
};