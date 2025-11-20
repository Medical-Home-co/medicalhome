/* --- pages/login.js (Versión Final - Google Activado) --- */
import { auth } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    signInWithPopup     
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { store } from '../store.js'; 

export function init() {
    console.log("Cargado js/pages/login.js (v3 - Full Auth)");

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const guestLoginBtn = document.getElementById('guest-login-btn');
    const createAccountBtn = document.getElementById('create-account-btn');

    // Verificación de elementos críticos. 
    // Nota: googleLoginBtn podría ser null si aún no actualizamos el HTML, 
    // pero el script no debe romperse por ello.
    if (!loginForm || !guestLoginBtn || !createAccountBtn) {
        console.error("Faltan elementos clave en login.html.");
        return;
    }

    // --- 1. Login con Email y Contraseña ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.elements.identifier.value;
        const password = loginForm.elements.password.value;
        
        if(loginError) loginError.classList.add('hidden'); 
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Verificando...";
        }

        try {
            console.log("Intentando iniciar sesión (Email)...");
            await signInWithEmailAndPassword(auth, email, password);
            handleLoginSuccess();
        } catch (error) {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Iniciar Sesión";
            }
            handleLoginError(error);
        }
    });

    // --- 2. Login con Google (ACTIVADO) ---
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            if(loginError) loginError.classList.add('hidden');
            const provider = new GoogleAuthProvider();
            try {
                console.log("Intentando iniciar sesión (Google)...");
                await signInWithPopup(auth, provider);
                handleLoginSuccess();
            } catch (error) {
                handleLoginError(error);
            }
        });
    }

    // --- 3. Entrar como Invitado ---
    guestLoginBtn.addEventListener('click', () => {
        if(confirm("El modo invitado cargará datos de demostración. ¿Continuar?")) {
            console.log("Cargando datos de invitado...");
            guestLoginBtn.disabled = true;
            guestLoginBtn.textContent = "Cargando...";
            store.loadGuestData(); // Carga los datos y recarga la página
        }
    });

    // --- 4. Ir a Crear Cuenta ---
    createAccountBtn.addEventListener('click', () => {
        // Limpiamos cualquier sesión previa para evitar mezclas
        console.log("Preparando creación de cuenta...");
        localStorage.clear();
        sessionStorage.clear();

        sessionStorage.setItem('openProfileModal', 'true'); // Bandera para abrir modal
        window.location.hash = '#perfil'; 
        window.location.reload(); 
    });
    
    // --- 5. Toggle de Contraseña ---
    document.querySelectorAll('.password-toggle-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const input = btn.closest('.input-with-icon').querySelector('input');
            const icon = btn.querySelector('img');
            if (!input || !icon) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.src = 'images/icons/eye-closed.svg'; 
            } else {
                input.type = 'password';
                icon.src = 'images/icons/eye.svg'; 
            }
        });
    });

    // --- Funciones de Ayuda ---
    function handleLoginSuccess() {
        console.log("¡Sesión iniciada correctamente!");
        // La redirección real la maneja main.js con onAuthStateChanged,
        // pero por seguridad limpiamos banderas y forzamos hash si es necesario.
        sessionStorage.removeItem('openProfileModal'); 
        // No recargamos aquí para dejar que main.js maneje la transición suave,
        // a menos que sea necesario forzar actualización de UI.
    }

    function handleLoginError(error) {
        console.error("Error en login:", error.code, error.message);
        if(loginError) {
            loginError.textContent = getFirebaseErrorMessage(error);
            loginError.classList.remove('hidden');
        } else {
            alert(getFirebaseErrorMessage(error));
        }
    }

    function getFirebaseErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email': return 'El correo electrónico no es válido.';
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password': return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
            case 'auth/popup-closed-by-user': return 'El inicio de sesión fue cancelado.';
            case 'auth/too-many-requests': return 'Demasiados intentos. Intenta más tarde.';
            default: return 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
        }
    }
}