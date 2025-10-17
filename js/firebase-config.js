// IMPORTANTE: Reemplaza este objeto con el `firebaseConfig` que copiaste de tu consola de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyBytSlZT9mY7e-As32G-1k7o65NqVrQ2PY",
  authDomain: "medicalhomeapp-1a68b.firebaseapp.com",
  projectId: "medicalhomeapp-1a68b",
  storageBucket: "medicalhomeapp-1a68b.appspot.com",
  messagingSenderId: "312247676705",
  appId: "1:312247676705:web:afbb8f37376027621c9860"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar los servicios que usaremos en otras partes de la aplicación
export const auth = firebase.auth();
export const db = firebase.firestore();