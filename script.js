// Utility
function formatTimestamp() {
    const now = new Date();
    return now.toLocaleString("en-US");
  }
  
  // Check if on landing page
  if (document.getElementById("userForm")) {
    const form = document.getElementById("userForm");
    const error = document.getElementById("error");
  
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && getAge(user.dob) > 10) {
      window.location.href = "app.html";
    }
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const dob = document.getElementById("dob").value;
  
      if (!name || !dob) {
        error.textContent = "All fields are required.";
        return;
      }
  
      const age = getAge(dob);
      if (age <= 10) {
        error.textContent = "You must be over 10 years old.";
        return;
      }
  
      localStorage.setItem("user", JSON.stringify({ name, dob }));
      window.location.href = "app.html";
    });
  
    function getAge(dob) {
      const birth = new Date(dob);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      return age;
    }
  }
  
  // Check if on app page
  if (document.getElementById("userName")) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) window.location.href = "index.html";
  
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
  
    document.getElementById("userName").textContent = user.name;
    document.getElementById("avatar").src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`;
  
    document.getElementById("signOut").onclick = () => {
      localStorage.clear();
      window.location.href = "index.html";
    };
  
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    }
  
    addTaskBtn.addEventListener("click", () => {
      const content = taskInput.value.trim();
      if (!content) return;
      tasks.push({ id: crypto.randomUUID(), content, stage: "todo", updatedAt: formatTimestamp() });
      taskInput.value = "";
      saveTasks();
    });
  
    function renderTasks() {
      const stages = ["todo", "completed", "archived"];
      stages.forEach(stage => {
        const list = document.getElementById(`${stage}Tasks`);
        const count = document.getElementById(`${stage}Count`);
        list.innerHTML = "";
        const filtered = tasks.filter(t => t.stage === stage);
        count.textContent = filtered.length;
        filtered.forEach(task => {
          const div = document.createElement("div");
          div.className = "task";
          div.innerHTML = `
            <p>${task.content}</p>
            <div class="timestamp">Last modified: ${task.updatedAt}</div>
          `;
          const actions = document.createElement("div");
  
          if (stage === "todo") {
            actions.innerHTML += `<button onclick="updateStage('${task.id}', 'completed')">Mark Completed</button>`;
            actions.innerHTML += `<button onclick="updateStage('${task.id}', 'archived')">Archive</button>`;
          } else if (stage === "completed") {
            actions.innerHTML += `<button onclick="updateStage('${task.id}', 'todo')">Move to Todo</button>`;
            actions.innerHTML += `<button onclick="updateStage('${task.id}', 'archived')">Archive</button>`;
          } else {
            actions.innerHTML += `<button onclick="updateStage('${task.id}', 'todo')">Move to Todo</button>`;
            actions.innerHTML += `<button onclick="updateStage('${task.id}', 'completed')">Move to Completed</button>`;
          }
  
          div.appendChild(actions);
          list.appendChild(div);
        });
      });
    }
  
    window.updateStage = (id, newStage) => {
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.stage = newStage;
        task.updatedAt = formatTimestamp();
        saveTasks();
      }
    };

    
  
    renderTasks();
  }
  