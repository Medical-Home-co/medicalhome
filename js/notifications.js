// --- js/notifications.js ---
// (Este es el SERVICIO para pedir permiso)

import { auth, db, messaging } from './firebase-config.js';
import { getToken } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/**
 * Solicita permiso para notificaciones push y guarda el token.
 */
export async function requestNotificationPermission() {
    if (!messaging) {
        console.log("Firebase Messaging no es soportado en este navegador.");
        alert("Las notificaciones push no son compatibles con este navegador.");
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Permiso de notificación concedido.');
            
            const vapidKey = 'BFaLD8fCZUz7o_nSOOz4ioRlEpDAQpewlMOXs7r7ONdOx7O6NCxaZHhJDwLR5iWbwm3X1o3Z2JpYPzkkq71ul6I'; 
            const token = await getToken(messaging, { vapidKey: vapidKey });

            if (token) {
                console.log('Token de FCM obtenido:', token);
                await saveTokenToFirestore(token);
                // Damos una alerta más sutil que no bloquee
                alert('¡Permiso de notificaciones activado!');
            } else {
                console.log('No se pudo obtener el token de registro (getToken).');
            }
        } else {
            console.log('No se concedió el permiso para notificaciones.');
        }
    } catch (error) {
        console.error('Error al obtener el token de FCM:', error);
    }
}

/**
 * Guarda el token del dispositivo en Firestore (SINTAXIS V9 CORREGIDA).
 * @param {string} token - El token de FCM del dispositivo.
 */
async function saveTokenToFirestore(token) {
    const user = auth.currentUser;
    if (!user) {
        console.log("No hay usuario autenticado para guardar el token.");
        // Si no hay usuario, no podemos guardar el token.
        // Podríamos guardar el token en localStorage y asociarlo después del login.
        return;
    }

    try {
        const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', token);
        await setDoc(tokenRef, {
            token: token,
            createdAt: serverTimestamp()
        });
        console.log("Token guardado en Firestore exitosamente.");
    } catch (error) {
        console.error("Error al guardar el token en Firestore:", error);
    }
}