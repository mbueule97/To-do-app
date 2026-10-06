// Referencias

const dateNumber = document.getElementById("dateNumber");
const dateText = document.getElementById("dateText");
const dateMonth = document.getElementById("dateMonth");
const dateYear = document.getElementById("dateYear");

const tasksContainer = document.getElementById("tasksContainer");
const taskForm = document.getElementById("taskForm");

const mainContent = document.getElementById("mainContent");

const motivationalCard =
  document.getElementById("motivationalCard");

const contextMenu =
  document.getElementById("contextMenu");

const btnMinimize =
  document.getElementById("btnMinimize");

let selectedTask = null;


// ===== FECHA =====

const setDate = () => {

  const date = new Date();

  dateNumber.textContent =
    date.toLocaleString("es", {
      day: "numeric"
    });

  dateText.textContent =
    date.toLocaleString("es", {
      weekday: "long"
    });

  dateMonth.textContent =
    date.toLocaleString("es", {
      month: "short"
    });

  dateYear.textContent =
    date.toLocaleString("es", {
      year: "numeric"
    });

};


// ===== TARJETA MOTIVACIONAL =====

const updateCardVisibility = () => {

  const hasTasks =
    tasksContainer.children.length > 0;

  motivationalCard.classList.toggle(
    "hidden",
    hasTasks
  );

};


// ===== CREAR TAREA =====

const createTaskElement = (text) => {

  const task =
    document.createElement("div");

  task.classList.add("task");


  task.innerHTML = `

    <div class="task-check">

      <iconify-icon
        icon="fluent:checkmark-20-filled">
      </iconify-icon>

    </div>

    <span class="task-text">
      ${text}
    </span>

    <iconify-icon
      class="task-star"
      icon="fluent:star-20-regular">
    </iconify-icon>

  `;


  // Completar tarea

  task
    .querySelector(".task-check")
    .addEventListener("click", (e) => {

      e.stopPropagation();

      task.classList.toggle("done");

      renderOrderedTasks();

    });


  // Marcar como importante

  task
    .querySelector(".task-star")
    .addEventListener("click", (e) => {

      e.stopPropagation();

      task.classList.toggle("important");

    });


  // Menú contextual

  task.addEventListener(
    "contextmenu",
    (e) => {

      e.preventDefault();

      selectedTask = task;

      showContextMenu(
        e.pageX,
        e.pageY
      );

    }
  );


  return task;

};


// ===== AGREGAR TAREA =====

const addNewTask = (event) => {

  event.preventDefault();

  const input =
    event.target.tasktext;

  const value =
    input.value.trim();


  if (!value) return;


  const task =
    createTaskElement(value);


  tasksContainer.prepend(task);

  event.target.reset();

  updateCardVisibility();

};


// ===== ORDENAR TAREAS =====

const order = () => {

  const done = [];

  const toDo = [];


  Array
    .from(tasksContainer.children)
    .forEach((el) => {

      el.classList.contains("done")
        ? done.push(el)
        : toDo.push(el);

    });


  return [
    ...toDo,
    ...done
  ];

};


const renderOrderedTasks = () => {

  order().forEach(
    (el) =>
      tasksContainer.appendChild(el)
  );

};


// ===== MENÚ CONTEXTUAL =====

const showContextMenu = (x, y) => {

  contextMenu.style.left =
    x + "px";

  contextMenu.style.top =
    y + "px";

  contextMenu.classList.add(
    "visible"
  );

};


const hideContextMenu = () => {

  contextMenu.classList.remove(
    "visible"
  );

  selectedTask = null;

};


// Acciones del menú contextual

contextMenu.addEventListener(
  "click",
  (e) => {

    const item =
      e.target.closest(
        ".context-item"
      );


    if (!item || !selectedTask)
      return;


    const action =
      item.dataset.action;


    if (action === "complete") {

      selectedTask.classList.toggle(
        "done"
      );

      renderOrderedTasks();

    }


    else if (action === "important") {

      selectedTask.classList.toggle(
        "important"
      );

    }


    else if (action === "delete") {

      selectedTask.remove();

      updateCardVisibility();

    }


    hideContextMenu();

  }
);


// Cerrar menú contextual

document.addEventListener(
  "click",
  (e) => {

    if (!contextMenu.contains(e.target)) {

      hideContextMenu();

    }

  }
);


document.addEventListener(
  "contextmenu",
  (e) => {

    if (!e.target.closest(".task")) {

      hideContextMenu();

    }

  }
);


// ===== EXPANDIR / RESTAURAR =====

btnMinimize.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "expanded"
    );

  }
);


// ===== INICIALIZAR =====

setDate();

taskForm.addEventListener(
  "submit",
  addNewTask
);