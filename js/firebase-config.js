// --- js/firebase-config.js (Corregido) ---
// ¡POR FAVOR REEMPLAZA TODO EL CONTENIDO DE ESTE ARCHIVO CON ESTE CÓDIGO!

// 1. Importar las funciones de Firebase (SDK v10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
// --- CORRECCIÓN: Importar GoogleAuthProvider ---
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";

// 2. Tu objeto de configuración
const firebaseConfig = {
  apiKey: "AIzaSyBytSlZT9mY7e-As32G-1k7o65NqVrQ2PY",
  authDomain: "medicalhomeapp-1a68b.firebaseapp.com",
  projectId: "medicalhomeapp-1a68b",
  storageBucket: "medicalhomeapp-1a68b.firebasestorage.app",
  messagingSenderId: "312247676705",
  appId: "1:312247676705:web:afbb8f37376027621c9860"
};

// 3. Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 4. Exportar los servicios que usaremos
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// --- CORRECCIÓN: Exportar el proveedor de Google ---
export const googleProvider = new GoogleAuthProvider();

console.log("Firebase (v10+) inicializado correctamente desde firebase-config.js");