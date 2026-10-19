import { fetchUtils, UrlField } from "react-admin";
import jsonServerProvider from "ra-data-json-server";

const fetchJsonUtil=(url:string, options:fetchUtils.Options={})=>{
    if(!options.headers){
        options.headers= new Headers({Accept: "application/json"});
    }
    options.headers.set("Authentication", sessionStorage.getItem("auth"))
    return fetchUtils.fetchJson(url, options);
};

export const dataProvider = jsonServerProvider("http://localhost:3000", fetchJsonUtil);