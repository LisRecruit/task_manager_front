import { get, patch, buildUrl, del } from "./httpMethods.js";
import { buildFilterQueryParams } from "./tableFilter.js";
import { populateTable } from "./tableBuilder.js";

export async function getMyTasks(filter = {}) {
    const token = getToken();
    const filterQuery = buildFilterQueryParams(filter);
     try {
            const data = await get("task/all?"+filterQuery, token);
            if (data) populateTable(data);
            return data;
         } catch (e) {
             console.error("Failed to load tasks", e);
         }

}
export async function getSubordinatesTasks(filter = {}) {
    const token = getToken();
    const filterQuery = buildFilterQueryParams(filter);
    try {
         const data = await get("task/all-subs?" + filterQuery, token);
                if (data) populateTable(data);
                return data;
    } catch(e) {
        console.error("Failed to load subordinates tasks", e);
    }
}

export async function deleteTask(id) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    try {
        await del(`task/delete/${id}`, token);
        console.log(`Task ${id} deleted`);
    } catch (e) {
        console.error("Failed to delete task", e);
        throw e;
    }
}

export async function updateTaskField(id, field, value) {
    const token = localStorage.getItem("token");
    const body = { id };
    body[field] = value;

    try {
        await patch("task/edit", body, token);
        console.log(`Task ${id} field ${field} updated to`, value);
    } catch (e) {
        console.error("Failed to update task field", e);
    }
}
export async function updateTaskCheckbox(id, value) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    await patch(`task/complete/${id}`, {}, token);
}

function getToken() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    return token;
}



