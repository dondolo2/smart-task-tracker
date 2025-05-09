document.addEventListener("DOMContentLoaded", () => {
  const taskList = document.getElementById("task-list");
  const doneList = document.getElementById("done-list");
  const binList = document.getElementById("bin-list");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const body = document.body;

  // Load saved tasks and preferences
  loadTasks();
  loadDarkMode();

  // Save to localStorage
  function saveTasks() {
    const tasks = {
      taskList: [...taskList.children].map(
        (li) => li.querySelector(".task-text").textContent
      ),
      doneList: [...doneList.children].map(
        (li) => li.querySelector(".task-text").textContent
      ),
      binList: [...binList.children].map(
        (li) => li.querySelector(".task-text").textContent
      ),
    };
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function saveDarkMode() {
    localStorage.setItem("darkMode", body.classList.contains("dark-mode"));
  }

  // Load from localStorage
  function loadTasks() {
    const saved = JSON.parse(localStorage.getItem("tasks"));
    if (!saved) return;

    saved.taskList.forEach((text) => {
      const item = createTaskItem(text);
      taskList.appendChild(item);
    });

    saved.doneList.forEach((text) => {
      const item = createTaskItem(text);
      item.querySelector("input").checked = true;
      item.querySelector(".task-text").classList.add("completed");
      doneList.appendChild(item);
    });

    saved.binList.forEach((text) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="task-text">${text}</span>`;
      binList.appendChild(li);
    });
  }

  function loadDarkMode() {
    if (localStorage.getItem("darkMode") === "true") {
      body.classList.add("dark-mode");
    }
  }

  // Toggle dark mode
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      saveDarkMode();
    });
  }

  // Utility: create task item
  function createTaskItem(text) {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox">
      <span class="task-text">${text}</span>
      <!-- Add delete/restore buttons if needed -->
    `;
    return li;
  }

  // Hook saveTasks to relevant events (customize based on your app)
  window.addEventListener("beforeunload", saveTasks);
});
