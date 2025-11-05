/* --- js/firebase-config.js (ACTUALIZADO CON APP CHECK) --- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app-check.js";

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

// --- INICIO: SOLUCIÓN DE APP CHECK ---
const appCheck = initializeAppCheck(app, {
  // 
  // Clave del sitio (Clave A) insertada:
  //
  provider: new ReCaptchaV3Provider('6LcSvgMsAAAAAOFRnKtJD7F0MK1ly1boz6sX0kUq'), 
  
  isTokenAutoRefreshEnabled: true
});
// --- FIN: SOLUCIÓN DE APP CHECK ---

// Exportar los servicios
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { app, auth, db, messaging, appCheck };