export function getToken() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    return token;
}



export function getUserIdFromToken() {
    let token;
    try {
        token = getToken();
    } catch (e) {
        return null;
    }
    console.log("token: " + token);

    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    try {
        const decoded = JSON.parse(atob(payload));

        if (!decoded.user_id) {
             console.error("Token payload is missing 'user_id' field.", decoded);
             return null;
        }

        return String(decoded.user_id);

    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
}
export function canEdit(field, task) {
    console.log("Field: "+field);
    console.log("Task: "+task);

    const userId = getUserIdFromToken();
    if (!userId) return false;

    console.log("User id:"+userId);
    const isCreator = userId === String(task.taskSetById);
    console.log("is creator"+isCreator);
    const isResponsible = userId === String(task.responsiblePersonId);
    console.log("is responsible"+isResponsible);
    const isManager = userId === String(task.directManagerId);
    console.log("is manager"+isManager);

    switch (field) {
        case "taskComplete":
            return isCreator || isResponsible || isManager;
        case "taskDescription":
            return isCreator;
        case "taskType":
            return isCreator;
        case "dueDate":
            return isCreator || isManager;
        case "completionDate":
            return false;
        case "responsiblePerson":
            return isCreator || isManager;
        case "directManagerNote":
            return isManager;
        case "responsiblePersonNote":
            return isResponsible;
        case "period":
            return isCreator || isManager;
        default:
            return false;
    }
}
