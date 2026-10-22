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

export const dataProvider = jsonServerProvider(import.meta.env.VITE_BACKEND, fetchJsonUtil);