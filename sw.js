// Importar los scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// IMPORTANTE: Pega aquí el mismo objeto `firebaseConfig` que usaste en `js/firebase-config.js`
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
const messaging = firebase.messaging();

// Manejador para cuando la app está en segundo plano o cerrada
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/images/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
