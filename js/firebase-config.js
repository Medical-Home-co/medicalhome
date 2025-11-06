/* --- js/firebase-config.js (SOLUCIÓN: AppCheck se mueve a main.js) --- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";
// NO importar initializeAppCheck ni ReCaptchaV3Provider aquí

// Tu configuración web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBytSlZT9mY7e-As32G-1k7o65NqVrQ2PY",
  authDomain: "medicalhomeapp-1a68b.firebaseapp.com",
  projectId: "medicalhomeapp-1a68b",
  storageBucket: "medicalhomeapp-1a68b.appspot.com",
  messagingSenderId: "312247676705",
  appId: "1:312247676705:web:afbb8f37376027621c9860"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// La inicialización de AppCheck se elimina de este archivo

// Exportar los servicios
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Exportar 'app' para que main.js pueda inicializar AppCheck
export { app, auth, db, messaging };