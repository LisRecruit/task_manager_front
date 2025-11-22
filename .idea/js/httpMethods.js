const baseUrl = "http://localhost:9998/api/v1/";


export async function post (url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });
    return response.json();
}
export function buildUrl (path){
    return baseUrl+path;
}

export function redirect(url){
    window.location.href = url;
}