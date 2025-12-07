import { canEdit } from"./authUtils.js";
import {updateTaskField, updateTaskCheckbox, deleteTask} from "./tableApi.js";

const TASK_TYPE_VALUES = ["ONE_TIME", "POST_BILL", "POST_PAYMENT", "MATCH_BANK", "RECONCILE_BANK", "POST_JOURNAL"];

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
    row.appendChild(buildEditableCheckbox(task, "taskComplete"));
    row.appendChild(buildEditableEnum(task, "taskType", TASK_TYPE_VALUES));
    row.appendChild(buildEditableInput(task, "dueDate", "date"));
    row.appendChild(buildEditableInput(task, "period", "month"));
    row.appendChild(buildTextCell(task.completionDate));
    row.appendChild(buildTextCell(task.daysOverdue));
    row.appendChild(buildEditableInput(task, "taskDescription", "text"));
    row.appendChild(buildTextCell(task.taskSetBy));
    row.appendChild(buildTextCell(task.responsiblePerson));
    row.appendChild(buildEditableInput(task, "directManagerNote", "text"));
    row.appendChild(buildEditableInput(task, "responsiblePersonNote", "text"));

    const editCell = wrapCell(buildEditButtons(row, task));
    row.appendChild(editCell);

    row.appendChild(buildDeleteButton(task));

    return row;
}

function buildEditableInput(task, field, type) {
    const input = document.createElement("input");
    input.type = type;
    input.value = task[field] ?? "";
    input.disabled = !canEdit(field, task);
    input.dataset.field = field;
    return wrapCell(input);
}

function buildEditButtons(row, task) {
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";

    editBtn.addEventListener("click", () => {
        const cells = row.querySelectorAll("input, select");
        const original = {};
//        cells.forEach(el => {
//            if (!el.dataset.field || el.dataset.field === "taskComplete") return;
//            el.disabled = false;
//            original[el.dataset.field] = el.value ?? el.checked;
//        });

          cells.forEach(el => {
                if (!el.dataset.field) return;
                // taskComplete не редактируется через edit, есть отдельный запрос
                if (el.dataset.field === "taskComplete") return;

                // включаем только если canEdit возвращает true
                if (canEdit(el.dataset.field, task)) {
                    el.disabled = false;
                    original[el.dataset.field] = el.value ?? el.checked;
                }
            });

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "💾";
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "❌";

        const parent = editBtn.parentElement;
        parent.innerHTML = "";
        parent.appendChild(saveBtn);
        parent.appendChild(cancelBtn);

        saveBtn.addEventListener("click", async () => {
            const updated = { taskId: task.id };
            cells.forEach(el => {
                if (!el.dataset.field || el.dataset.field === "taskComplete") return;
                updated[el.dataset.field] = el.type === "checkbox" ? el.checked : el.value;
            });
            await updateTaskField(task.id, updated);
            cells.forEach(el => el.disabled = true);
            parent.innerHTML = "";
            parent.appendChild(editBtn);
        });

        cancelBtn.addEventListener("click", () => {
            cells.forEach(el => {
                if (!el.dataset.field || el.dataset.field === "taskComplete") return;
                if (el.type === "checkbox") el.checked = original[el.dataset.field];
                else el.value = original[el.dataset.field];
                el.disabled = true;
            });
            parent.innerHTML = "";
            parent.appendChild(editBtn);
        });
    });

    return editBtn;
}

function wrapCell(element) {
    const td = document.createElement("td");
    td.appendChild(element);
    return td;
}

function buildTextCell(value) {
    const span = document.createElement("span");
    span.textContent = (typeof value === "object" && value !== null) ? JSON.stringify(value) : value ?? "";
    return wrapCell(span);
}

function buildEditableText(task, field, isEditable = true) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task[field] ?? "";
    isEditable = canEdit(field, task);
    input.disabled = !isEditable;

    input.addEventListener("change", () => updateTaskField(task.id, field, input.value));

    return wrapCell(input);
}

function buildEditableCheckbox(task, field, isEditable = true) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = task[field] ?? false;
    isEditable = canEdit(field, task);
//    input.disabled = !isEditable || task[field] === true;
    input.disabled = !isEditable;

        input.addEventListener("change", async () => {

            if (!input.checked) {
                input.checked = true;
                return;
            }

            try {
                await updateTaskCheckbox(task.id, input.checked);
                console.log(`Task ${task.id} marked complete`);
            } catch (e) {
                console.error("Failed to update task checkbox", e);
                input.checked = false;
            }
    });

    return wrapCell(input);
}

function buildEditableDate(task, field, isEditable = true) {
    const input = document.createElement("input");
    input.type = "date";
    input.value = task[field] ?? "";
    isEditable = canEdit(field, task);
    input.disabled = !isEditable;

    input.addEventListener("change", () => updateTaskField(task.id, field, input.value));

    return wrapCell(input);
}

function buildEditablePeriod (task, field, isEditable = true) {
    const input = document.createElement("input");
    input.type = "month";
    input.value = task[field] ?? "";
    isEditable = canEdit(field, task);
    input.disabled = !isEditable;

    input.addEventListener("change", () => updateTaskField(task.id, field, input.value));

    return wrapCell(input);
}

// ENUM
function buildEditableEnum(task, field, options = [], isEditable = true) {
    const select = document.createElement("select");
    isEditable = canEdit(field, task);
    select.disabled = !isEditable;

    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        if (task[field] === opt) option.selected = true;
        select.appendChild(option);
    });

    select.addEventListener("change", () => updateTaskField(task.id, field, select.value));

    return wrapCell(select);
}
function buildDeleteButton(task) {
    const btn = document.createElement("button");
    btn.textContent = "❌️";
    btn.title = "Delete task";
    btn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        const token = localStorage.getItem("token");
        try {
            await deleteTask(task.id);;
            btn.closest("tr").remove();
        } catch (e) {
            console.error("Failed to delete task", e);
        }
    });
    return wrapCell(btn);
}