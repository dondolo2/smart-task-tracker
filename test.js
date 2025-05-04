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

  //Make a task item EDITABLE on click
  span.addEventListener("click", () => {
    //Create an input field with the task text as the default value
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;

    //Replace span with input
    span.replaceWith(input);
    input.focus();

    input.addEventListener("blur", () => {
      const newText = input.value.trim();

      if (newText) {
        span.textContent = newText; //Updates the span text with new value
        input.replaceWith(span); //Replaces input with updated span
      } else {
        input.replaceWith(span); //Just replace with span if input is empty
      }
    });

    //Allow the user to press 'Enter' to save the changes
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur(); //Trigger blur to save the new text
      }
    });
  });

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

    if (!taskExists) {
      const restoredTask = createTaskItem(text);

      if (wasInDoneList) {
        doneList.appendChild(restoredTask);

        const checkbox = restoredTask.querySelector("input[type='checkbox']");
        checkbox.checked = true;
        restoredTask.querySelector(".task-text").classList.add("completed");
      } else {
        taskList.appendChild(restoredTask);
      }
    }

    // Hide the Undo button if the stack is empty
    if (deletedTasksStack.length === 0) {
      document.getElementById("undo-container").style.display = "none";
    }

    // Show the heading if the doneList has tasks
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

  const binList = document.getElementById("bin-list");

  // Check if task already exists in the bin
  const existingBinItems = binList.querySelectorAll("li span");
  for (let span of existingBinItems) {
    if (span.textContent.toLowerCase() === taskText.toLowerCase()) {
      return; // Item already in bin, do not add again
    }
  }

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
    let taskText, wasInDoneList;

    // Try to retrieve the most recently deleted task from the stack
    if (deletedTasksStack.length > 0) {
      const popped = deletedTasksStack.pop();
      taskText = popped.text;
      wasInDoneList = popped.wasInDoneList;
    } else if (binItem) {
      // If the stack is empty, fall back to getting data from the DOM element in the bin
      taskText = binItem.querySelector("span").textContent;
      wasInDoneList = binItem.dataset.wasInDoneList === "true";
    } else {
      // If there is nothing to restore, exit the function
      return;
    }

    // Check if the task already exists in either the taskList or the doneList
    const allTasks = document.querySelectorAll(".task-text");
    const taskExists = Array.from(allTasks).some(
      (task) => task.textContent.toLowerCase() === taskText.toLowerCase()
    );

    if (taskExists) {
      // If the task already exists, remove it from the bin and stop
      binItem.remove();
      return;
    }

    // Create a new task item element using the text
    const restoredTask = createTaskItem(taskText);

    if (wasInDoneList) {
      // If the task was originally in the done list, mark it as completed and append to doneList
      const checkbox = restoredTask.querySelector('input[type="checkbox"]');
      const span = restoredTask.querySelector(".task-text");
      checkbox.checked = true;
      span.classList.add("completed");
      doneList.appendChild(restoredTask);
    } else {
      // Otherwise, append it back to the active taskList
      taskList.appendChild(restoredTask);
    }

    // Remove the task item from the bin
    binItem.remove();

    // If there are any tasks in the done list, show the "finished" heading
    if (doneList.children.length > 0) {
      document.getElementById("finished-heading").style.display = "block";
    }
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
  });

  buttonsDiv.appendChild(restoreBtn);
  buttonsDiv.appendChild(deleteForeverBtn);
  binItem.appendChild(buttonsDiv);

  document.getElementById("bin-list").appendChild(binItem);
}
