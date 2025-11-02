/* --- pages/login.js (Corregido) --- */
import { auth } from '../firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"; // <-- CORREGIDO

export function init() {
    console.log("Cargado js/pages/login.js");

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (!loginForm) {
        console.error("No se encontró el formulario de login.");
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.elements.identifier.value;
        const password = loginForm.elements.password.value;
        loginError.classList.add('hidden'); // Ocultar error previo

        try {
            console.log("Intentando iniciar sesión...");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("¡Sesión iniciada!", userCredential.user);
            
            // Éxito: Redirigir al dashboard y recargar
            sessionStorage.removeItem('openProfileModal'); // Limpiar por si acaso
            window.location.hash = '#dashboard';
            window.location.reload(); // Forzar recarga para actualizar todo el estado (sidebar, etc.)
            
        } catch (error) {
            console.error("Error en login:", error.code, error.message);
            loginError.textContent = getFirebaseErrorMessage(error);
            loginError.classList.remove('hidden');
        }
    });

    // Función para traducir errores de Firebase
    function getFirebaseErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'El correo electrónico no es válido.';
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
            default:
                return 'Ocurrió un error. Intenta de nuevo.';
        }
    }
}