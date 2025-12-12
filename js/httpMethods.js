import {BASE_URL} from './settings.js'



export async function post (endPoint, body, token = null) {
    console.log(body);
    console.log(BASE_URL)
    const url = buildUrl(endPoint);
    console.log(url);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });
     if (!response.ok) {
        throw new Error("POST request failed");
     }
     console.log(response);
    return response.json();
}

export async function get (endPoint, token = null) {
    const url = buildUrl(endPoint);
    const headers = {};
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    const response = await fetch(url, {
        method: "GET",
        headers
    });
    if (!response.ok) {
        throw new Error("GET request failed");
    }
    return response.json();
}

export async function patch(endPoint, body = null, token = null) {
    const url = buildUrl(endPoint);
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`PATCH request failed: ${response.status}`);
    }
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
}

export async function del(endPoint, token = null) {
    const url = buildUrl(endPoint);
    const headers = {};
    if (token) headers["Authorization"] = "Bearer " + token;
    const response = await fetch(url, { method: "DELETE", headers });
    if (!response.ok) throw new Error(`DELETE request failed: ${response.status}`);
    return null;
}




export function buildUrl (path){
    return BASE_URL+path;
}

export function redirect(url){
    window.location.href = url;
}