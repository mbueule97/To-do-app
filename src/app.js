// app.js
import {
  watchAuth,
  logoutUser,
  createTask,
  getUserTasks,
  updateTask,
  deleteTask,
  getProfile,
  saveProfile,
  fileToBase64,
  changePassword,
} from "./firebase.js";

// Referencias
const dateNumber = document.getElementById("dateNumber");
const dateText = document.getElementById("dateText");
const dateMonth = document.getElementById("dateMonth");
const dateYear = document.getElementById("dateYear");
const tasksContainer = document.getElementById("tasksContainer");
const taskForm = document.getElementById("taskForm");
const mainContent = document.getElementById("mainContent");
const motivationalCard = document.getElementById("motivationalCard");
const contextMenu = document.getElementById("contextMenu");

// Perfil
const profileTrigger = document.getElementById("profileTrigger");
const profileDropdown = document.getElementById("profileDropdown");
const profileImg = document.getElementById("profileImg");
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");

// Modales
const profileModal = document.getElementById("profileModal");
const passwordModal = document.getElementById("passwordModal");
const modalProfileImg = document.getElementById("modalProfileImg");
const profileNameInput = document.getElementById("profileName");
const profileEmailInput = document.getElementById("profileEmail");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const profileError = document.getElementById("profileError");
const currentPassInput = document.getElementById("currentPassword");
const newPassInput = document.getElementById("newPassword");
const confirmPassInput = document.getElementById("confirmPassword");
const passwordError = document.getElementById("passwordError");

let currentUser = null;
let selectedTask = null;
let selectedPhotoFile = null;

// ===== FECHA =====

const setDate = () => {
  const date = new Date();

  dateNumber.textContent = date.toLocaleString("es", {
    day: "numeric",
  });

  dateText.textContent = date.toLocaleString("es", {
    weekday: "long",
  });

  dateMonth.textContent = date.toLocaleString("es", {
    month: "short",
  });

  dateYear.textContent = date.toLocaleString("es", {
    year: "numeric",
  });
};

// ===== AUTH =====

watchAuth(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  userEmailEl.textContent = user.email;

  let profile = await getProfile(user.uid);

  // Si el usuario todavía no tiene perfil
  if (!profile) {
    await saveProfile(user.uid, {
      name: user.email.split("@")[0],
      email: user.email,
      updatedAt: new Date().toISOString(),
    });

    profile = {
      name: user.email.split("@")[0],
      email: user.email,
    };
  }

  // Mostrar nombre
  userNameEl.textContent = profile.name;

  // Avatar por defecto
  profileImg.src = "aset/default-avatar.svg";
  modalProfileImg.src = "aset/default-avatar.svg";

  // Si el usuario tiene una foto guardada,
  // utilizar esa foto
  if (profile.photoURL) {
    profileImg.src = profile.photoURL;
    modalProfileImg.src = profile.photoURL;
  }

  await loadTasks(user.uid);
});

// ===== DROPDOWN PERFIL =====

profileTrigger.addEventListener("click", (e) => {
  e.stopPropagation();

  profileDropdown.classList.toggle("visible");
});

document.addEventListener("click", () => {
  profileDropdown.classList.remove("visible");
});

document.getElementById("btnMyProfile").addEventListener("click", () => {
  profileDropdown.classList.remove("visible");

  profileNameInput.value = userNameEl.textContent;

  profileEmailInput.value = currentUser?.email || "";

  profileError.textContent = "";

  profileModal.classList.add("visible");
});

document.getElementById("btnChangePassword").addEventListener("click", () => {
  profileDropdown.classList.remove("visible");

  currentPassInput.value = "";
  newPassInput.value = "";
  confirmPassInput.value = "";

  passwordError.textContent = "";

  passwordModal.classList.add("visible");
});

document.getElementById("btnLogout").addEventListener("click", () => {
  profileDropdown.classList.remove("visible");

  logoutUser();
});

// ===== TOGGLE VISIBILIDAD DE CONTRASEÑA =====

const setupPasswordToggle = (input, toggleBtn) => {
  toggleBtn.addEventListener("click", () => {
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    toggleBtn.innerHTML = isHidden
      ? '<iconify-icon icon="fluent:eye-off-20-regular"></iconify-icon>'
      : '<iconify-icon icon="fluent:eye-20-regular"></iconify-icon>';
  });
};

setupPasswordToggle(
  currentPassInput,
  document.getElementById("toggleCurrentPass"),
);

setupPasswordToggle(newPassInput, document.getElementById("toggleNewPass"));

setupPasswordToggle(
  confirmPassInput,
  document.getElementById("toggleConfirmPass"),
);

// ===== MODALES =====

document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.close).classList.remove("visible");
  });
});

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("visible");
    }
  });
});

// ===== SELECCIONAR FOTO =====

profilePhotoInput.addEventListener("change", (e) => {
  selectedPhotoFile = e.target.files[0] || null;

  if (selectedPhotoFile) {
    const reader = new FileReader();

    reader.onload = (ev) => {
      // Vista previa en el modal
      modalProfileImg.src = ev.target.result;

      // Actualizar también el avatar del sidebar
      profileImg.src = ev.target.result;
    };

    reader.readAsDataURL(selectedPhotoFile);
  }
});

// ===== GUARDAR PERFIL =====

document
  .getElementById("btnSaveProfile")
  .addEventListener("click", async () => {
    if (!currentUser) return;

    const name = profileNameInput.value.trim();

    if (!name) {
      profileError.textContent = "El nombre no puede estar vacío.";

      return;
    }

    let photoURL = "";

    // Si el usuario seleccionó una nueva foto
    if (selectedPhotoFile) {
      photoURL = await fileToBase64(selectedPhotoFile);
    }

    // Obtener perfil actual
    const existing = await getProfile(currentUser.uid);

    const data = {
      name,
      email: currentUser.email,
      updatedAt: new Date().toISOString(),
    };

    // Nueva foto
    if (photoURL) {
      data.photoURL = photoURL;
    }

    // Mantener foto anterior si no seleccionó una nueva
    else if (existing?.photoURL) {
      data.photoURL = existing.photoURL;
    }

    await saveProfile(currentUser.uid, data);

    // Actualizar nombre
    userNameEl.textContent = name;

    // Actualizar foto inmediatamente
    if (data.photoURL) {
      profileImg.src = data.photoURL;
      modalProfileImg.src = data.photoURL;
    } else {
      profileImg.src = "aset/default-avatar.svg";
      modalProfileImg.src = "aset/default-avatar.svg";
    }

    profileModal.classList.remove("visible");

    selectedPhotoFile = null;

    // Limpiar input
    profilePhotoInput.value = "";
  });

// ===== CAMBIAR CONTRASEÑA =====

document
  .getElementById("btnSavePassword")
  .addEventListener("click", async () => {
    const current = currentPassInput.value;
    const newPass = newPassInput.value;
    const confirm = confirmPassInput.value;

    if (!current || !newPass || !confirm) {
      passwordError.textContent = "Completa todos los campos.";

      return;
    }

    if (newPass.length < 6) {
      passwordError.textContent =
        "La nueva contraseña debe tener al menos 6 caracteres.";

      return;
    }

    if (newPass !== confirm) {
      passwordError.textContent = "Las contraseñas no coinciden.";

      return;
    }

    try {
      await changePassword(currentUser, current, newPass);

      passwordError.textContent = "";

      passwordModal.classList.remove("visible");
    } catch (err) {
      passwordError.textContent = translateAuthError(err.code);
    }
  });

// ===== TAREAS =====

const loadTasks = async (uid) => {
  const tasks = await getUserTasks(uid);

  tasksContainer.innerHTML = "";

  tasks.forEach((task) => {
    const el = createTaskElement(task.text, task.done, task.important);

    el.dataset.id = task.id;

    tasksContainer.appendChild(el);
  });

  updateCardVisibility();
};

const createTaskElement = (text, done = false, important = false) => {
  const task = document.createElement("div");

  task.classList.add("task");

  if (done) {
    task.classList.add("done");
  }

  if (important) {
    task.classList.add("important");
  }

  task.innerHTML = `
    <div class="task-check">
      <iconify-icon icon="fluent:checkmark-20-filled"></iconify-icon>
    </div>

    <span class="task-text">${text}</span>

    <iconify-icon
      class="task-star"
      icon="fluent:star-20-regular"
    ></iconify-icon>
  `;

  task.querySelector(".task-check").addEventListener("click", async (e) => {
    e.stopPropagation();

    const isDone = task.classList.toggle("done");

    await updateTask(task.dataset.id, {
      done: isDone,
    });

    renderOrderedTasks();
  });

  task.querySelector(".task-star").addEventListener("click", async (e) => {
    e.stopPropagation();

    const isImportant = task.classList.toggle("important");

    await updateTask(task.dataset.id, {
      important: isImportant,
    });
  });

  task.addEventListener("contextmenu", (e) => {
    e.preventDefault();

    selectedTask = task;

    showContextMenu(e.pageX, e.pageY);
  });

  return task;
};

const addNewTask = async (event) => {
  event.preventDefault();

  const input = event.target.tasktext;

  const value = input.value.trim();

  if (!value || !currentUser) return;

  await createTask(currentUser.uid, value);

  input.value = "";

  await loadTasks(currentUser.uid);
};

// ===== ORDENAR =====

const order = () => {
  const done = [];
  const toDo = [];

  Array.from(tasksContainer.children).forEach((el) => {
    el.classList.contains("done") ? done.push(el) : toDo.push(el);
  });

  return [...toDo, ...done];
};

const renderOrderedTasks = () => {
  order().forEach((el) => {
    tasksContainer.appendChild(el);
  });
};

const updateCardVisibility = () => {
  motivationalCard.classList.toggle(
    "hidden",
    tasksContainer.children.length > 0,
  );
};

// ===== CONTEXT MENU =====

const showContextMenu = (x, y) => {
  contextMenu.style.left = x + "px";

  contextMenu.style.top = y + "px";

  contextMenu.classList.add("visible");
};

const hideContextMenu = () => {
  contextMenu.classList.remove("visible");

  selectedTask = null;
};

contextMenu.addEventListener("click", async (e) => {
  const item = e.target.closest(".context-item");

  if (!item || !selectedTask) return;

  const action = item.dataset.action;

  const id = selectedTask.dataset.id;

  if (action === "complete") {
    const isDone = selectedTask.classList.toggle("done");

    await updateTask(id, {
      done: isDone,
    });

    renderOrderedTasks();
  } else if (action === "important") {
    const isImportant = selectedTask.classList.toggle("important");

    await updateTask(id, {
      important: isImportant,
    });
  } else if (action === "delete") {
    selectedTask.remove();

    await deleteTask(id);

    updateCardVisibility();
  }

  hideContextMenu();
});

document.addEventListener("click", (e) => {
  if (!contextMenu.contains(e.target)) {
    hideContextMenu();
  }
});

// ===== MINIMIZAR / EXPANDIR =====

document.getElementById("btnMinimize").addEventListener("click", () => {
  document.body.classList.toggle("expanded");
});

// ===== HELPERS =====

function translateAuthError(code) {
  const map = {
    "auth/wrong-password": "Contraseña actual incorrecta.",

    "auth/invalid-credential": "Credenciales inválidas.",

    "auth/too-many-requests": "Demasiados intentos.",
  };

  return map[code] || "Ocurrió un error.";
}

// ===== INIT =====

setDate();

taskForm.addEventListener("submit", addNewTask);
