import { auth, db, messaging } from './firebase-config.js';

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
            
            // Obtenemos el VAPID key de la configuración de Firebase
            const vapidKey = 'BFaLD8fCZUz7o_nSOOz4ioRlEpDAQpewlMOXs7r7ONdOx7O6NCxaZHhJDwLR5iWbwm3X1o3Z2JpYPzkkq71ul6I'; // Clave VAPID integrada
            const token = await messaging.getToken({ vapidKey: vapidKey });

            if (token) {
                console.log('Token de FCM obtenido:', token);
                await saveTokenToFirestore(token);
                alert('¡Notificaciones activadas exitosamente!');
            } else {
                console.log('No se pudo obtener el token de registro.');
            }
        } else {
            console.log('No se concedió el permiso para notificaciones.');
        }
    } catch (error) {
        console.error('Error al obtener el token de FCM:', error);
    }
}

/**
 * Guarda el token del dispositivo en Firestore, asociado al usuario actual.
 * @param {string} token - El token de FCM del dispositivo.
 */
async function saveTokenToFirestore(token) {
    const user = auth.currentUser;
    if (!user) return;

    const tokensRef = db.collection('users').doc(user.uid).collection('fcmTokens').doc(token);
    await tokensRef.set({
        token: token,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}
