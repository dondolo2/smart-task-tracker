const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

let deletedTasksStack = [];
let lastDeletedFromDoneList = false;

//Create a Done List
let doneList = document.createElement("ul");
doneList.id = "done-list";
document.getElementById("app").appendChild(doneList);

//Create List item
function createTaskItem(taskText) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  li.setAttribute("draggable", "true");

  const leftDiv = document.createElement("div");
  leftDiv.classList.add("task-left");

  //Create a Drag Handle icon
  const dragIcon = document.createElement("div");
  dragIcon.className = "drag-icon";
  leftDiv.appendChild(dragIcon);

  li.addEventListener("dragstart", (e) => {
    li.classList.add("dragging");

    //Set the empty drag image to remove default red icon
    // const img = new Image();
    // img.src = "";
    // e.dataTransfer.setDragImage(img, 0, 0)
  });

  li.addEventListener("dragend", (e) => {
    li.classList.remove("dragging");
  });

  //Create a CheckBox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = taskText;

  checkbox.addEventListener("change", () => {
    span.classList.toggle("completed");

    if (checkbox.checked) {
      doneList.appendChild(li);
    } else {
      taskList.appendChild(li);
    }

    const finishedHeading = document.getElementById("finished-heading");
    if (doneList.children.length > 0) {
      finishedHeading.style.display = "block";
    } else {
      finishedHeading.style.display = "none";
    }
  });

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(span);

  //Delete Button functionality
  const deleteBtn = document.createElement("div");
  deleteBtn.className = "delete-btn";

  deleteBtn.addEventListener("click", () => {
    const finishedHeading = document.getElementById("finished-heading");

    //Save deleted task info
    deletedTasksStack.push({
      element: li,
      text: span.textContent,
      wasInDoneList: doneList.contains(li),
    });

    deletedTasksStack = li;
    lastDeletedFromDoneList = doneList.contains(li);

    //Remove Task
    li.remove();

    //Add to bin
    addToBin(span.textContent, doneList.contains(li));

    //Show Undo button
    document.getElementById("undo-container").style.display = "block";

    //Hide finished heading if doneList is empty
    if (doneList.children.length === 0) {
      finishedHeading.style.display = "none";
    }
  });

  li.appendChild(leftDiv);
  li.appendChild(deleteBtn);

  //Add focus effect for mobile
  li.addEventListener("click", () => {
    document
      .querySelectorAll(".task-item")
      .forEach((item) => item.classList.remove("active"));
    li.classList.add("active");
  });

  return li;
}

//More Drag functionality
taskList.addEventListener("dragover", (e) => {
  e.preventDefault();

  const draggingItem = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(taskList, e.clientY);

  if (afterElement == null) {
    taskList.appendChild(draggingItem);
  } else {
    taskList.insertBefore(draggingItem, afterElement);
  }
});

//Helper function
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") return;

  const taskTextLower = taskText.toLowerCase();

  //check if task exists in the taskList and doneList
  const allTasks = document.querySelectorAll(".task-text");
  for (let task of allTasks) {
    if (task.textContent.toLowerCase() === taskTextLower) {
      alert("Task already exists!");
      return;
    }
  }

  const taskItem = createTaskItem(taskText);
  taskList.appendChild(taskItem);
  taskInput.value = "";
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

//Undo button
const undoBtn = document.getElementById("undo-btn");

undoBtn.addEventListener("click", () => {
  if (deletedTasksStack.length > 0) {
    const { element, text, wasInDoneList } = deletedTasksStack.pop();

    //Check if duplicate exists
    const allTasks = document.querySelectorAll(".task-text");
    const taskExists = Array.from(allTasks).some(
      (task) => task.textContent.toLowerCase() === text.toLowerCase()
    );

    if (taskExists) {
      //Skip and try undo next one in line
      if (deletedTasksStack.length === 0) {
        document.getElementById("undo-container").style.display = "none";
      }

      undoBtn.click(); //Recursive call
      return;
    }

    const restoredTask = createTaskItem(text);

    if (wasInDoneList) {
      doneList.appendChild(restoredTask);

      const checkbox = restoredTask.querySelector("input[type='checkbox']");
      checkbox.checked = true;
      restoredTask.querySelector(".task-text").classList.add("completed");
    } else {
      taskList.appendChild(restoredTask);
    }

    if (deletedTasksStack.length === 0) {
      document.getElementById("undo-container").style.display = "none";
    }

    if (doneList.children.length > 0) {
      document.getElementById("finished-heading").style.display = "block";
    }
  }
});

const recycleBin = document.getElementById("recycle-bin-btn");
const binSection = document.getElementById("bin-section");
const modalOverlay = document.getElementById("modal-overlay");
const binModal = document.getElementById("bin-modal");

recycleBin.addEventListener("click", (e) => {
  e.stopPropagation(); //prevents the overlay click from firing!

  if (modalOverlay.classList.contains("show")) {
    modalOverlay.classList.remove("show");
    binSection.classList.add("hidden");
  } else {
    modalOverlay.classList.add("show");
    binSection.classList.remove("hidden");
  }
});

//Close modal if there's outside click
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("show");
  }
});

function addToBin(taskText, wasInDoneList) {
  const binItem = document.createElement("li");
  binItem.classList.add("task-item");
  binItem.dataset.wasInDoneList = wasInDoneList;

  const span = document.createElement("span");
  span.textContent = taskText;
  binItem.appendChild(span);

  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.display = "flex";
  buttonsDiv.style.gap = "5px";
  buttonsDiv.style.marginLeft = "auto";

  //Restore button
  const restoreBtn = document.createElement("button");
  restoreBtn.textContent = "Restore";
  restoreBtn.style.border = "none";
  restoreBtn.style.color = "white";
  restoreBtn.style.backgroundColor = "#3498db";
  restoreBtn.style.padding = "5px 8px";
  restoreBtn.style.borderRadius = "4px";
  restoreBtn.style.cursor = "pointer";

  restoreBtn.addEventListener("click", () => {
    const restoredTask = createTaskItem(taskText);

    const wasInDoneList = binItem.dataset.wasInDoneList === "true";

    if (wasInDoneList) {
      const checkbox = restoredTask.querySelector('input[type="checkbox"]');
      const span = restoredTask.querySelector(".task-text");
      checkbox.checked = true;
      span.classList.add("completed");

      doneList.appendChild(restoredTask);
    } else {
      taskList.appendChild(restoredTask);
    }

    if (doneList.children.length > 0) {
      document.getElementById("finished-heading").style.display = "block";
    }

    //Remove from bin
    binItem.remove();
    checkIfBinEmpty();
  });

  //Delete Permanently button
  const deleteForeverBtn = document.createElement("button");
  deleteForeverBtn.textContent = "Delete";
  deleteForeverBtn.style.border = "none";
  deleteForeverBtn.style.backgroundColor = "#e74c3c";
  deleteForeverBtn.style.color = "white";
  deleteForeverBtn.style.padding = "5px 8px";
  deleteForeverBtn.style.borderRadius = "4px";
  deleteForeverBtn.style.cursor = "pointer";

  deleteForeverBtn.addEventListener("click", () => {
    binItem.remove();
    checkIfBinEmpty();
  });

  buttonsDiv.appendChild(restoreBtn);
  buttonsDiv.appendChild(deleteForeverBtn);
  binItem.appendChild(buttonsDiv);

  document.getElementById("bin-list").appendChild(binItem);
}

function checkIfBinEmpty() {
  const binList = document.getElementById("bin-list");
  if (binList.children.length === 0) {
    document.getElementById("bin-section").classList.add("hidden");
  }
}
