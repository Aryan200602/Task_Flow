// DOM Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskListContainers = {
  todo: document.getElementById("todoList"),
  completed: document.getElementById("completedList"),
  archived: document.getElementById("archivedList"),
};
const logoutBtn = document.getElementById("logoutBtn");
const globalTracker = document.getElementById("globalProgressBar");
const darkModeToggle = document.getElementById("darkModeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

if (localStorage.getItem("dark-mode") === "true") {
  document.body.classList.add("dark-mode");
}
updateToggleIcon();

// Event Listeners
addTaskBtn.addEventListener("click", addTask);
logoutBtn.addEventListener("click", logout);
darkModeToggle.addEventListener("click", toggleDarkMode);

// Add new task
function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.push({
    id: Date.now(),
    title,
    status: "todo",
    subtasks: [],
    modified: new Date().toISOString(),
    progress: 0,
  });

  taskInput.value = "";
  saveAndRender();
}

// Save tasks to localStorage and render
function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateGlobalProgress();
}

// Render tasks in columns
function renderTasks() {
  Object.values(taskListContainers).forEach(c => c.innerHTML = "");

  tasks.forEach(task => {
    const li = document.createElement("li");

    const header = document.createElement("div");
    header.className = "task-header";
    header.innerHTML = `
      <span>${task.title}</span>
      <span class="task-progress">${task.progress || 0}%</span>
    `;

    const timestamp = document.createElement("small");
    timestamp.textContent = `Last modified: ${formatTimestamp(task.modified)}`;

    const subtasksDiv = document.createElement("div");
    subtasksDiv.className = "subtasks";
    task.subtasks.forEach((sub, idx) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = sub.done;
      checkbox.addEventListener("change", () => {
        sub.done = checkbox.checked;
        updateProgress(task);
        saveAndRender();
      });

      const label = document.createElement("label");
      label.textContent = sub.text;
      label.prepend(checkbox);
      subtasksDiv.appendChild(label);
    });

    const subtaskRow = document.createElement("div");
    subtaskRow.style.display = "flex";
    subtaskRow.style.alignItems = "center";
    subtaskRow.style.marginTop = "10px";

    const subInput = document.createElement("input");
    subInput.placeholder = "Add subtask";
    subInput.style.flex = "1";
    subInput.style.padding = "12px";
    subInput.style.fontSize = "14px";
    subInput.style.borderRadius = "16px";
    subInput.style.border = "1px solid #ddd";
    subInput.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";

    const subBtn = document.createElement("button");
    subBtn.textContent = "+";
    subBtn.style.marginLeft = "16px";
    subBtn.style.padding = "0 16px";
    subBtn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
    subBtn.style.color = "white";
    subBtn.style.fontSize = "20px";
    subBtn.style.border = "none";
    subBtn.style.borderRadius = "4px";
    subBtn.style.cursor = "pointer";

    subBtn.addEventListener("click", () => {
      const val = subInput.value.trim();
      if (val) {
        task.subtasks.push({ text: val, done: false });
        subInput.value = "";
        updateProgress(task);
        saveAndRender();
      }
    });

    subtaskRow.appendChild(subInput);
    subtaskRow.appendChild(subBtn);

    const btns = document.createElement("div");
    btns.className = "task-buttons";

    if (task.status === "todo") {
      btns.appendChild(makeButton("Mark as Completed", () => moveTask(task.id, "completed")));
      btns.appendChild(makeButton("Archive", () => moveTask(task.id, "archived")));
    } else if (task.status === "completed") {
      btns.appendChild(makeButton("Move to Todo", () => moveTask(task.id, "todo")));
      btns.appendChild(makeButton("Archive", () => moveTask(task.id, "archived")));
    } else if (task.status === "archived") {
      btns.appendChild(makeButton("Move to Todo", () => moveTask(task.id, "todo")));
      btns.appendChild(makeButton("Move to Completed", () => moveTask(task.id, "completed")));
    }

    li.appendChild(header);
    li.appendChild(timestamp);
    li.appendChild(subtasksDiv);
    li.appendChild(subtaskRow);
    li.appendChild(btns);

    taskListContainers[task.status].appendChild(li);
  });
}

// Task movement
function moveTask(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.status = newStatus;
  task.modified = new Date().toISOString();
  if (newStatus === "completed") task.progress = 100;
  saveAndRender();
}

// Subtask completion tracking
function updateProgress(task) {
  const total = task.subtasks.length;
  const completed = task.subtasks.filter(t => t.done).length;
  task.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  task.modified = new Date().toISOString();
}

// Global progress bar
function updateGlobalProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "completed").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  globalTracker.style.width = `${percent}%`;
  globalTracker.textContent = `${percent}%`;
}

// Create button element
function makeButton(label, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

// Format ISO timestamp
function formatTimestamp(isoStr) {
  const date = new Date(isoStr);
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Dark mode toggle
function updateToggleIcon() {
  const isDark = document.body.classList.contains("dark-mode");
  darkModeToggle.checked = isDark;
  const modeLabel = document.getElementById("modeLabel");
  modeLabel.textContent = isDark ? "🌙 Dark" : "🌞 Light";
}


function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("dark-mode", isDark);
  updateToggleIcon();
}

// Set Avatar from UI Avatars API
function setAvatar() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name) {
    const avatarImg = document.getElementById("avatar");
    avatarImg.src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`;
  }
}

// Load avatar after DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  setAvatar();
});

// Load DummyJSON Todos if tasks are empty
if (tasks.length === 0) {
  fetch("https://dummyjson.com/todos")
    .then(res => res.json())
    .then(data => {
      tasks = data.todos.map(todo => ({
        id: Date.now() + Math.random(),
        title: todo.todo,
        status: "todo",
        subtasks: [],
        modified: new Date().toISOString(),
        progress: 0
      }));
      saveAndRender();
    })
    .catch(err => console.error("Failed to load dummy todos:", err));
} else {
  saveAndRender();
}

/* =============================
   Section Toggle Functionality
============================= */
const toggleButtons = document.querySelectorAll(".toggle-btn");
const sections = document.querySelectorAll(".section");

toggleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-section");

    toggleButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach(section => {
      if (section.getAttribute("data-section") === target) {
        section.style.display = "block";
      } else {
        section.style.display = "none";
      }
    });
  });
});
