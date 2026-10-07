// login.js
import { registerUser, loginUser, watchAuth } from "./firebase.js";

// Tabs
const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".auth-form");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    forms.forEach((f) => f.classList.remove("active"));
    tab.classList.add("active");
    document
      .getElementById(
        tab.dataset.tab === "login" ? "loginForm" : "registerForm",
      )
      .classList.add("active");
  });
});

// Redirigir si ya está logueado
watchAuth((user) => {
  if (user) window.location.href = "index.html";
});

// ===== TOGGLE VISIBILIDAD DE CONTRASEÑA =====
const setupPasswordToggle = (inputId, toggleId) => {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(toggleId);

  btn.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.innerHTML = isHidden
      ? '<iconify-icon icon="fluent:eye-off-20-regular"></iconify-icon>'
      : '<iconify-icon icon="fluent:eye-20-regular"></iconify-icon>';
  });
};

setupPasswordToggle("loginPassword", "toggleLoginPass");
setupPasswordToggle("regPassword", "toggleRegPass");

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  const btn = e.target.querySelector(".auth-btn");

  btn.disabled = true;
  try {
    await loginUser(email, password);
  } catch (err) {
    errorEl.textContent = translateError(err.code);
    btn.disabled = false;
  }
});

// Register
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const errorEl = document.getElementById("regError");
    const btn = e.target.querySelector(".auth-btn");

    btn.disabled = true;
    try {
      await registerUser(email, password);
    } catch (err) {
      errorEl.textContent = translateError(err.code);
      btn.disabled = false;
    }
  });

function translateError(code) {
  const map = {
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/invalid-email": "Correo inválido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  };
  return map[code] || "Ocurrió un error. Intenta de nuevo.";
}
