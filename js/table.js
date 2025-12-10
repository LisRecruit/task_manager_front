import { initTableFilters } from "./tableFilter.js";
import {getMyTasks, getSubordinatesTasks } from "./tableApi.js";

let currentGetFn = getMyTasks;

//window.getMyTasksWithFilter = () => {
//    currentGetFn = getMyTasks;
//    return getMyTasks({ taskComplete: false });
//};
//window.getSubordinatesTasksWithFilter = () => {
//    currentGetFn = getSubordinatesTasks;
//    return getSubordinatesTasks({ taskComplete: false });
//};

document.addEventListener("DOMContentLoaded", () => {
    currentGetFn({ taskComplete: false });
    document.getElementById("myTasksBtn").addEventListener("click", () => {
        currentGetFn = getMyTasks;
        initTableFilters(currentGetFn);
        currentGetFn({ taskComplete: false });
    });

    document.getElementById("subsTasksBtn").addEventListener("click", () => {
        currentGetFn = getSubordinatesTasks;
        initTableFilters(currentGetFn);
        currentGetFn({ taskComplete: false });
    });

    initTableFilters((filter) => currentGetFn(filter));
});