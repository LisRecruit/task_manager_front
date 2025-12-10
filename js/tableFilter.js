export function initTableFilters(getTasksFn) {
    const taskCompleteSelect = document.getElementById("filterTaskComplete");
    const taskTypeSelect = document.getElementById("filterTaskType");
    const dueDateFromInput = document.getElementById("filterDueDateFrom");
    const dueDateToInput = document.getElementById("filterDueDateTo");
    const applyBtn = document.getElementById("applyFilters");
    applyBtn.addEventListener("click", () => {
        const filter = {
//            taskComplete: taskCompleteSelect.value ? taskCompleteSelect.value === "true" : null,
            taskComplete: taskCompleteSelect.value === "" ? null : taskCompleteSelect.value === "true",
            taskType: taskTypeSelect.value || null,
            dueDateFrom: dueDateFromInput.value || null,
            dueDateTo: dueDateToInput.value || null
        };

        getTasksFn(filter);
    });
}

export function buildFilterQueryParams(filter = {}) {
    const params = new URLSearchParams();
    if (filter.taskComplete != null) params.append("taskComplete", filter.taskComplete);
    if (filter.taskType) params.append("taskType", filter.taskType);
    if (filter.dueDateFrom) params.append("dueDateFrom", filter.dueDateFrom);
    if (filter.dueDateTo) params.append("dueDateTo", filter.dueDateTo);
    return params.toString();
}