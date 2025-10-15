// Global array to store all tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditId = null; // To track which task is currently being edited

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const pendingTasksList = document.getElementById('pending-tasks-list');
const completedTasksList = document.getElementById('completed-tasks-list');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');

/**
 * Saves the current tasks array to LocalStorage.
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Renders all tasks into the Pending or Completed lists.
 */
function renderTasks() {
    pendingTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    const pending = tasks.filter(task => !task.completed);
    const completed = tasks.filter(task => task.completed);

    pending.forEach(task => pendingTasksList.appendChild(createTaskElement(task)));
    completed.forEach(task => completedTasksList.appendChild(createTaskElement(task)));

    // Update counts
    pendingCount.textContent = `(${pending.length})`;
    completedCount.textContent = `(${completed.length})`;
}

/**
 * Creates the HTML list item element for a single task.
 * @param {object} task - The task object.
 * @returns {HTMLLIElement} The list item element.
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    if (task.completed) {
        li.classList.add('completed');
    }

    // Task content (Title, Description, Dates)
    li.innerHTML = `
        <div class="task-info">
            <div class="task-title-display">${task.title}</div>
            <div class="task-description-display">${task.description}</div>
            <div class="task-date">Added: ${new Date(task.addedAt).toLocaleString()}</div>
            ${task.completed ? `<div class="task-date">Completed: ${new Date(task.completedAt).toLocaleString()}</div>` : ''}
        </div>
        <div class="task-actions">
            <button class="btn-complete" onclick="toggleComplete(${task.id})">
                ${task.completed ? 'Uncomplete' : 'Complete'}
            </button>
            <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
            <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
        </div>
    `;
    return li;
}

/**
 * Handles the submission of the new task form.
 * @param {Event} e - The form submission event.
 */
function addTask(e) {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();

    if (!title) {
        alert('Please enter a task title.');
        return;
    }

    const newTask = {
        id: Date.now(), // Use timestamp as a simple unique ID
        title: title,
        description: description,
        completed: false,
        addedAt: new Date().toISOString(),
        completedAt: null
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // Clear the form
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
}

/**
 * Toggles the 'completed' status of a task.
 * @param {number} id - The ID of the task to toggle.
 */
function toggleComplete(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        saveTasks();
        renderTasks();
    }
}

/**
 * Deletes a task from the list.
 * @param {number} id - The ID of the task to delete.
 */
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

/**
 * Switches a task list item into edit mode.
 * @param {number} id - The ID of the task to edit.
 */
function editTask(id) {
    // If another task is being edited, prevent simultaneous edits
    if (currentEditId !== null && currentEditId !== id) {
        alert('Please save or cancel the current edit before starting a new one.');
        return;
    }

    const taskElement = document.querySelector(`[data-id="${id}"]`);
    const task = tasks.find(t => t.id === id);

    if (!taskElement || !task) return;

    // Toggle edit mode class
    taskElement.classList.toggle('edit-mode');
    currentEditId = taskElement.classList.contains('edit-mode') ? id : null;

    // If entering edit mode
    if (currentEditId === id) {
        // Replace display elements with input fields
        taskElement.querySelector('.task-info').innerHTML = `
            <input type="text" class="edit-title" value="${task.title}">
            <textarea class="edit-description">${task.description}</textarea>
            <div class="task-date">Added: ${new Date(task.addedAt).toLocaleString()}</div>
            ${task.completed ? `<div class="task-date">Completed: ${new Date(task.completedAt).toLocaleString()}</div>` : ''}
        `;

        // Change actions to Save/Cancel
        taskElement.querySelector('.task-actions').innerHTML = `
            <button class="btn-complete" onclick="toggleComplete(${task.id})">
                ${task.completed ? 'Uncomplete' : 'Complete'}
            </button>
            <button class="btn-edit save-edit" onclick="saveEdit(${task.id})">Save</button>
            <button class="btn-delete cancel-edit" onclick="cancelEdit(${task.id})">Cancel</button>
        `;
    } else {
        // If exiting edit mode (happens on save or cancel, which re-renders)
        // This 'else' block is mainly for safety, as saveEdit and cancelEdit re-render.
        renderTasks();
    }
}

/**
 * Saves the edited task content.
 * @param {number} id - The ID of the task to save.
 */
function saveEdit(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex > -1 && taskElement) {
        const newTitle = taskElement.querySelector('.edit-title').value.trim();
        const newDescription = taskElement.querySelector('.edit-description').value.trim();

        if (!newTitle) {
            alert('Title cannot be empty.');
            return;
        }

        tasks[taskIndex].title = newTitle;
        tasks[taskIndex].description = newDescription;

        currentEditId = null;
        saveTasks();
        renderTasks(); // Re-render to update the display
    }
}

/**
 * Cancels the edit mode and reverts to the original content.
 * @param {number} id - The ID of the task to cancel editing for.
 */
function cancelEdit(id) {
    currentEditId = null;
    renderTasks(); // Simply re-render from the current state
}

// Event Listeners
taskForm.addEventListener('submit', addTask);

// Initial call to display any tasks stored in localStorage
renderTasks();