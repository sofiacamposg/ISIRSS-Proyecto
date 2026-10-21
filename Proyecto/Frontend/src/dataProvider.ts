import { fetchUtils, UrlField } from "react-admin";
import jsonServerProvider from "ra-data-json-server";

const fetchJsonUtil=(url:string, options:fetchUtils.Options={}) => {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    const token = localStorage.getItem("token");
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    options.headers = headers;
    return fetchUtils.fetchJson(url, options);
};

export const dataProvider = jsonServerProvider("http://localhost:3000", fetchJsonUtil);