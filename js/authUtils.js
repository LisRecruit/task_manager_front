export function getUserFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    try {
        const decoded = JSON.parse(atob(payload));
        return {
            id: decoded.id,
            roles: decoded.roles || []
        };
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
}
export function canEdit(field, task) {
    const user = getUserFromToken();
    if (!user) return false;

    const isCreator = String(user.id) === String(task.taskSetById);
    const isResponsible = String(user.id) === String(task.responsiblePersonId);
    const isManager = String(user.id) === String(task.directManagerId);

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
