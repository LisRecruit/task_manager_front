import { canEdit } from"./authUtils.js";
import {updateTaskField, updateTaskBatch, updateTaskCheckbox, deleteTask} from "./tableApi.js";
import { TASK_TYPE_VALUES } from "./settings.js";

export function populateTable(tasks) {
   const tbody = document.getElementById("taskBody");
       tbody.innerHTML = "";
       tasks.forEach(task => {
           tbody.appendChild(createRow(task));
       });
}
function createRow(task) {
    const row = document.createElement("tr");

    row.appendChild(buildTextCell(task.id));
    row.appendChild(buildTaskCompleteIndicator(task));
    row.appendChild(buildEditableEnum(task, "taskType", TASK_TYPE_VALUES));
//    row.appendChild(buildEditableInput(task, "dueDate", "date"));
    row.appendChild(buildEditableInput({ ...task, dueDate: formatDate(task.dueDate, "MM dd yyyy")}, "dueDate", "text"));
//    row.appendChild(buildEditableInput(task, "period", "month"));
//    row.appendChild(buildEditableInput({ ...task, period: formatDate(task.period, "yyyy MMM")}, "period", "text"));
    row.appendChild(buildEditableMonth(task, "period"));
//    row.appendChild(buildTextCell(task.completionDate));
    row.appendChild(buildTextCell(formatDate(task.completionDate, "MM dd yyyy")));
    row.appendChild(buildTextCell(task.daysOverdue));
    row.appendChild(buildEditableInput(task, "taskDescription", "text"));
    row.appendChild(buildTextCell(task.taskSetBy));
    row.appendChild(buildTextCell(task.responsiblePerson));
    row.appendChild(buildEditableInput(task, "directManagerNote", "text"));
    row.appendChild(buildEditableInput(task, "responsiblePersonNote", "text"));

    row.appendChild(wrapCell(buildEditButtons(row, task)));
    row.appendChild(buildDeleteButton(task));

    return row;
}


function buildEditableInput(task, field, type) {
    const input = document.createElement("input");
    input.type = type;
    input.value = task[field] ?? "";
    input.dataset.field = field;
    input.disabled=true;


    return wrapCell(input);
}

function buildTaskCompleteIndicator(task) {
    const btn = document.createElement("button");
    btn.dataset.field = "taskComplete";

    if(task.taskComplete) {
        btn.textContent = "✔️";
        btn.style.color = "green";
        btn.disabled = true;
        btn.title = "Task completed";
    } else {
        btn.textContent = "❌";
        btn.style.color = "red";
        btn.title = "Mark complete";
    }

    btn.addEventListener("click", async () => {
        if(task.taskComplete) return;

        if(!confirm("Complete this task?")) return;

        try {
            await updateTaskCheckbox(task.id, true);
            btn.textContent = "✔️";
            btn.style.color = "green";
            btn.disabled = true;
        } catch(err) {
            console.error(err);
            alert("Error");
        }
    });

    return wrapCell(btn);
}

function buildEditableEnum(task, field, options = []) {
    const select = document.createElement("select");
    select.dataset.field = field;
    select.disabled = true;

    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        if (task[field] === opt) option.selected = true;
        select.appendChild(option);
    });

    return wrapCell(select);
}

function buildDeleteButton(task) {
    const btn = document.createElement("button");
    btn.textContent = "❌️ delete";
    btn.title = "Delete task";
    btn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(task.id);
            btn.closest("tr").remove();
        } catch (e) {
            console.error("Failed to delete task", e);
        }
    });
    return wrapCell(btn);
}

function exitEditMode(row, buttonContainer, editBtn, originalValues) {
    const cells = row.querySelectorAll("input, select");

    cells.forEach(el => {
        const field = el.dataset.field;
        if (!field) return;
        if (originalValues.hasOwnProperty(field)) {
            if (el.type === "checkbox") el.checked = originalValues[field];
            else el.value = originalValues[field];
        }
        el.disabled = true;
        el.onchange = null;
        if (el.type === 'checkbox') {
             el.style.pointerEvents = 'none';
        }
    });

    const completeBtn = row.querySelector('[data-field="taskComplete"]');
    if (completeBtn && !originalValues.taskComplete) {
        completeBtn.disabled = false;
        completeBtn.style.opacity = 1;
        completeBtn.style.pointerEvents = 'auto';
    }

    buttonContainer.innerHTML = "";
    buttonContainer.appendChild(editBtn);
}

function buildEditButtons(row, task) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Edit";
    editBtn.title = "Edit task";
    editBtn.className = "bg-yellow-500 text-white hover:bg-yellow-600 p-1 rounded";

    const buttonContainer = document.createElement("div");
    buttonContainer.appendChild(editBtn);

    editBtn.addEventListener("click", () => {
        const cells = row.querySelectorAll("input, select");
        const original = {};
        let isAnyFieldEditable = false;

        const completeBtn = row.querySelector('[data-field="taskComplete"]');
            if (completeBtn) {
                completeBtn.disabled = true;
                completeBtn.style.opacity = 0.5;
                completeBtn.style.pointerEvents = 'none';
            }

        cells.forEach(el => {
            const field = el.dataset.field;
            if (!field) return;
            original[field] = el.type === "checkbox" ? el.checked : el.value;
            if (canEdit(field, task)) {
                el.disabled = false;
                isAnyFieldEditable = true;
                if (field === "taskComplete") {
                    el.style.pointerEvents = 'auto';
                    el.onchange = async (e) => {
                        if (original[field] && !e.target.checked) {
                            console.warn("Отмена выполнения задачи запрещена.");
                            e.target.checked = true;
                            return;
                        }
                        if (e.target.checked) {
                            try {
                                await updateTaskCheckbox(task.id, e.target.checked);
                                exitEditMode(row, buttonContainer, editBtn, original);
                            } catch (err) {
                                console.error(`Ошибка обновления задачи ${task.id}.`, err);
                                e.target.checked = false;
                            }
                        }
                    };
                }
            } else {
                el.disabled = true;
                if (el.type === 'checkbox') {
                     el.style.pointerEvents = 'none';
                }
            }
        });

        if (!isAnyFieldEditable) {
            console.warn("У вас нет прав на редактирование полей в этой задаче.");
            return;
        }

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "💾 Save";
        saveBtn.title = "Save changes";
        saveBtn.className = "bg-green-500 text-white hover:bg-green-600 p-1 rounded mr-2";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "❌ Cancel";
        cancelBtn.title = "Cancel editing";
        cancelBtn.className = "bg-red-400 text-white hover:bg-red-500 p-1 rounded";

        buttonContainer.innerHTML = "";
        buttonContainer.appendChild(saveBtn);
        buttonContainer.appendChild(cancelBtn);

        saveBtn.addEventListener("click", async () => {
            const updatedBody = { id: task.id };
            let changed = false;

            cells.forEach(el => {
                const field = el.dataset.field;
                if (!field || field === "taskComplete" || el.disabled) return;

                const newValue = el.type === "checkbox" ? el.checked : el.value;

                if (original[field] !== newValue) {
                    updatedBody[field] = newValue;
                    changed = true;
                }
            });
            try {
                if (changed) {
                    await updateTaskBatch(updatedBody);
                } else {
                    console.log("Нет изменений для сохранения.");
                }
            } catch (e) {
                console.error(`Ошибка сохранения задачи ${task.id}.`, e);
                console.error("Batch update failed, restoring original values.", e);
            }
            exitEditMode(row, buttonContainer, editBtn, original);
        });
        cancelBtn.addEventListener("click", () => {
            exitEditMode(row, buttonContainer, editBtn, original);
        });
    });

    return buttonContainer;
}
function wrapCell(element) {
    const td = document.createElement("td");
    td.appendChild(element);
    return td;
}

function buildTextCell(value) {
    const span = document.createElement("span");
    span.textContent = value ?? "";
    return wrapCell(span);
}

function formatDate(value, formatType) {
    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date)) return value;

    switch(formatType) {
        case "MM dd yyyy":
            return `${String(date.getMonth() + 1).padStart(2,'0')} ${String(date.getDate()).padStart(2,'0')} ${date.getFullYear()}`;
        case "yyyy MMM":
            return `${date.getFullYear()} ${date.toLocaleString('en-US', { month: 'short' })}`;
        default:
            return value;
    }
}

//function buildEditableMonth(task, field) {
//    const input = document.createElement("input");
//    input.type = "month";
//    if(task[field]) {
//        const [year, monthName] = task[field].split(" ");
//        const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
//        input.value = `${year}-${String(monthNum).padStart(2,'0')}`;
//    }
//    input.dataset.field = field;
//    input.disabled = true;
//
//    return wrapCell(input);
//}
function buildEditableMonth(task, field) {
    const input = document.createElement("input");
    input.type = "month";

    if(task[field]) {
        const formattedDateString = formatDate(task[field], "yyyy MMM");

        const [year, monthName] = formattedDateString.split(" ");

        const dateMs = Date.parse(`${monthName} 1, ${year}`);

        if (!isNaN(dateMs)) {
            const date = new Date(dateMs);
            const monthNum = date.getMonth() + 1;
            input.value = `${year}-${String(monthNum).padStart(2,'0')}`;
        } else {
            input.value = "";
            console.warn(`Failed to parse the 'period' field: ${task[field]}. Expected format: "yyyy MMM"`);
        }
    }

    input.dataset.field = field;
    input.disabled = true;

    return wrapCell(input);
}