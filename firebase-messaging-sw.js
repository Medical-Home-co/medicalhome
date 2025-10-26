// --- firebase-messaging-sw.js ---
// ¡CÓDIGO CORREGIDO! Usa importScripts y la v9-compat

// 1. Importar los scripts de Firebase (estilo v9-compat)
importScripts("https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js");

// 2. Tu configuración web de Firebase (corregida)
const firebaseConfig = {
  apiKey: "AIzaSyBytSlZT9mY7e-As32G-1k7o65NqVrQ2PY",
  authDomain: "medicalhomeapp-1a68b.firebaseapp.com",
  projectId: "medicalhomeapp-1a68b",
  // Corregido: esta es la URL de storage correcta
  storageBucket: "medicalhomeapp-1a68b.firebasestorage.app",
  messagingSenderId: "312247676705",
  appId: "1:312247676705:web:afbb8f37376027621c9860"
};

// 3. Inicializar Firebase (usando la API compat)
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log("Service Worker (v9-compat) de Firebase Messaging registrado.");

// 4. Manejador para cuando la app está en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ', payload);

  // Personaliza la notificación que se mostrará
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Asegúrate que esta ruta sea correcta desde la raíz de tu sitio
    icon: '/medicalhome/assets/icons/icon-192x192.png', 
    badge: '/medicalhome/assets/icons/icon-72x72.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});