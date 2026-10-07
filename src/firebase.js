// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNi4HHGaZJrgxw37ILjv5ryaDvNenUMAI",
  authDomain: "to-do-app-e254c.firebaseapp.com",
  projectId: "to-do-app-e254c",
  storageBucket: "to-do-app-e254c.firebasestorage.app",
  messagingSenderId: "742250049220",
  appId: "1:742250049220:web:382d917ed53b61c4326391",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ===== AUTH =====
export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const watchAuth = (callback) => onAuthStateChanged(auth, callback);

// ===== PERFIL =====
export const getProfile = async (uid) => {
  const snap = await getDoc(doc(db, "profiles", uid));
  return snap.exists() ? snap.data() : null;
};

export const saveProfile = async (uid, data) => {
  await setDoc(doc(db, "profiles", uid), data, { merge: true });
};

// ===== FOTO (Base64, sin Storage) =====
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ===== CONTRASEÑA =====
export const changePassword = async (user, currentPass, newPass) => {
  const credential = EmailAuthProvider.credential(user.email, currentPass);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPass);
};

// ===== TASKS =====
export const createTask = (uid, text) =>
  addDoc(collection(db, "tasks"), {
    text,
    uid,
    done: false,
    important: false,
    createdAt: serverTimestamp(),
  });

export const getUserTasks = async (uid) => {
  const q = query(collection(db, "tasks"), where("uid", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateTask = (id, updates) =>
  updateDoc(doc(db, "tasks", id), updates);

export const deleteTask = (id) => deleteDoc(doc(db, "tasks", id));
