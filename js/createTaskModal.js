import { post } from "./httpMethods.js";
import { getToken } from "./authUtils.js";
import { TASK_TYPE_VALUES, REPEATABLE_TYPE } from "./settings.js";


export function openCreateTaskModal() {
    fillModalSelects();
    document.getElementById("modal").style.display = "block";
}

export function closeCreateTaskModal() {
    document.getElementById("modal").style.display = "none";
}


export function initCreateTaskModal(onCreatedCallback) {
//    fillModalSelects();
    const modal = document.getElementById("modal");
    const closeBtn = document.getElementById("closeModal");
    const saveBtn = document.getElementById("saveTaskBtn");

    const repeatableCheckbox = document.getElementById("repeatable");
    const repeatableTypeSelect = document.getElementById("repeatableTypeSelect");

    // Блокируем/разблокируем селект в зависимости от чекбокса
    repeatableCheckbox.addEventListener("change", () => {
        repeatableTypeSelect.disabled = !repeatableCheckbox.checked;
    });
    // Изначально блокируем, если чекбокс не отмечен
    repeatableTypeSelect.disabled = !repeatableCheckbox.checked;



    closeBtn.addEventListener("click", closeCreateTaskModal);

    window.addEventListener("click", (e) => {
        if (e.target === modal) closeCreateTaskModal();
    });

    saveBtn.addEventListener("click", async () => {
        const periodValue = document.getElementById("period").value;
        const period = periodValue ? periodValue + "-01" : null;
        const newTask = {
            taskDescription: document.getElementById("taskDescription").value,
            responsiblePersonId: Number(document.getElementById("responsiblePersonId").value),
            dueDate: document.getElementById("taskDueDate").value,
            taskType: document.getElementById("taskTypeSelect").value,
            repeatable: document.getElementById("repeatable").checked,
            repeatableType: document.getElementById("repeatable").checked
                    ? document.getElementById("repeatableTypeSelect").value
                    : null,
//            period: document.getElementById("period").value

             period: period
        };

         if (!newTask.taskDescription || !newTask.responsiblePersonId || !newTask.dueDate || !newTask.taskType) {
            alert("Please fill all required fields");
            return;
         }

        const token = getToken();

        try {
            await post("task/create", newTask, token);
            closeCreateTaskModal();
            onCreatedCallback();
        } catch (e) {
            console.error("Failed to create task", e);
        }
    });
}

export function fillModalSelects() {
    const taskTypeSelect = document.getElementById("taskTypeSelect");
    const repeatableTypeSelect = document.getElementById("repeatableTypeSelect");

    if (taskTypeSelect) {
        taskTypeSelect.innerHTML = "";
        TASK_TYPE_VALUES.forEach(type => {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = type;
            taskTypeSelect.appendChild(opt);
        });
    }

    if (repeatableTypeSelect) {
        repeatableTypeSelect.innerHTML = "";
        REPEATABLE_TYPE.forEach(type => {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = type;
            repeatableTypeSelect.appendChild(opt);
        });
    }
}