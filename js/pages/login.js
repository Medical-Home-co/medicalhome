/* --- pages/login.js (Actualizado y Condensado) --- */
import { auth } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword,
    GoogleAuthProvider, // Importar proveedor de Google
    signInWithPopup     // Importar login con PopUp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { store } from '../store.js'; // Importar store para modo invitado

export function init() {
    console.log("Cargado js/pages/login.js (v2 con Google e Invitado)");

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const guestLoginBtn = document.getElementById('guest-login-btn');
    const createAccountBtn = document.getElementById('create-account-btn');

    if (!loginForm || !googleLoginBtn || !guestLoginBtn || !createAccountBtn) {
        console.error("Faltan elementos clave en login.html.");
        return;
    }

    // --- 1. Login con Email y Contraseña ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.elements.identifier.value;
        const password = loginForm.elements.password.value;
        loginError.classList.add('hidden'); 

        try {
            console.log("Intentando iniciar sesión (Email)...");
            await signInWithEmailAndPassword(auth, email, password);
            handleLoginSuccess();
        } catch (error) {
            handleLoginError(error);
        }
    });

    // --- 2. Login con Google ---
    googleLoginBtn.addEventListener('click', async () => {
        loginError.classList.add('hidden');
        const provider = new GoogleAuthProvider();
        try {
            console.log("Intentando iniciar sesión (Google)...");
            await signInWithPopup(auth, provider);
            handleLoginSuccess();
        } catch (error) {
            handleLoginError(error);
        }
    });

    // --- 3. Entrar como Invitado ---
    guestLoginBtn.addEventListener('click', () => {
        console.log("Cargando datos de invitado...");
        store.loadGuestData(); // Carga los datos de muestra
        window.location.hash = '#dashboard';
        window.location.reload(); // Recargar para actualizar todo
    });

    // --- 4. Ir a Crear Cuenta ---
    createAccountBtn.addEventListener('click', () => {
        sessionStorage.setItem('openProfileModal', 'true'); // Indicar a #perfil que abra el modal
        window.location.hash = '#perfil'; 
    });
    
    // --- 5. Toggle de Contraseña (copiado de perfil.js) ---
    document.querySelectorAll('.password-toggle-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const input = btn.closest('.input-with-icon').querySelector('input');
            const icon = btn.querySelector('img');
            if (!input || !icon) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.src = 'images/icons/eye-closed.svg';
                icon.alt = 'Ocultar contraseña';
            } else {
                input.type = 'password';
                icon.src = 'images/icons/eye.svg';
                icon.alt = 'Mostrar contraseña';
            }
        });
    });

    // --- Funciones de Ayuda ---
    function handleLoginSuccess() {
        console.log("¡Sesión iniciada!");
        sessionStorage.removeItem('openProfileModal'); 
        window.location.hash = '#dashboard';
        window.location.reload(); 
    }

    function handleLoginError(error) {
        console.error("Error en login:", error.code, error.message);
        loginError.textContent = getFirebaseErrorMessage(error);
        loginError.classList.remove('hidden');
    }

    function getFirebaseErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email': return 'El correo electrónico no es válido.';
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password': return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
            case 'auth/popup-closed-by-user': return 'El inicio de sesión fue cancelado.';
            default: return 'Ocurrió un error. Intenta de nuevo.';
        }
    }
}