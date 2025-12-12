import { initTableFilters, fillTaskTypeFilter } from "./tableFilter.js";
import {getMyTasks, getSubordinatesTasks } from "./tableApi.js";
import { openCreateTaskModal, initCreateTaskModal } from "./createTaskModal.js";

let currentGetFn = getMyTasks;

document.addEventListener("DOMContentLoaded", () => {
    currentGetFn({ taskComplete: false });
    document.getElementById("myTasksBtn").addEventListener("click", () => {
        currentGetFn = getMyTasks;
        initTableFilters(currentGetFn);
        currentGetFn({ taskComplete: false });
    });

    initCreateTaskModal(() => currentGetFn({ taskComplete: false }));


    document.getElementById("createTaskBtn").addEventListener("click", ()=> {
         openCreateTaskModal();
    })

    document.getElementById("subsTasksBtn").addEventListener("click", () => {
        currentGetFn = getSubordinatesTasks;
        initTableFilters(currentGetFn);
        currentGetFn({ taskComplete: false });
    });

    initTableFilters((filter) => currentGetFn(filter));
});

document.addEventListener("DOMContentLoaded", () => {
    fillTaskTypeFilter();
    currentGetFn({ taskComplete: false });
});