/* --- pages/login.js (Versión Final - Google On, Invitado Rápido) --- */
import { auth } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    signInWithPopup     
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { store } from '../store.js'; 

export function init() {
    console.log("Cargado js/pages/login.js (v4 - Google + Invitado Rápido)");

    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const guestLoginBtn = document.getElementById('guest-login-btn');
    const createAccountBtn = document.getElementById('create-account-btn');

    // Verificación de elementos críticos
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
            // El éxito se maneja en main.js via onAuthStateChanged
            console.log("Login correcto, esperando redirección...");
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
            
            // Feedback visual inmediato
            const originalText = googleLoginBtn.querySelector('span').textContent;
            googleLoginBtn.querySelector('span').textContent = "Conectando...";
            googleLoginBtn.disabled = true;

            const provider = new GoogleAuthProvider();
            try {
                console.log("Intentando iniciar sesión (Google)...");
                await signInWithPopup(auth, provider);
                // Éxito: main.js redirigirá
            } catch (error) {
                console.error("Error Google:", error);
                handleLoginError(error);
                // Restaurar botón
                googleLoginBtn.querySelector('span').textContent = originalText;
                googleLoginBtn.disabled = false;
            }
        });
    }

    // --- 3. Entrar como Invitado (INMEDIATO) ---
    guestLoginBtn.addEventListener('click', () => {
        // CORRECCIÓN SOLICITADA: Sin confirmación, entrada directa.
        console.log("Entrando como invitado (directo)...");
        
        // Feedback visual
        guestLoginBtn.disabled = true;
        guestLoginBtn.textContent = "Cargando...";
        
        // Carga datos y recarga la página (redirección en main.js)
        store.loadGuestData(); 
    });

    // --- 4. Ir a Crear Cuenta ---
    createAccountBtn.addEventListener('click', () => {
        console.log("Navegando a crear cuenta...");
        // Limpiamos sesión previa para evitar estados mixtos
        localStorage.clear();
        sessionStorage.clear();

        // Bandera para que main.js abra el modal de perfil al cargar
        sessionStorage.setItem('openProfileModal', 'true');
        
        // Forzamos recarga para limpiar memoria y router
        window.location.hash = '#perfil'; 
        window.location.reload(); 
    });
    
    // --- 5. Toggle de Contraseña (Ojo) ---
    document.querySelectorAll('.password-toggle-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Evita envío del form
            e.preventDefault();
            
            const btn = e.currentTarget;
            const input = btn.closest('.input-with-icon')?.querySelector('input');
            const icon = btn.querySelector('img');
            
            if (!input || !icon) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.src = 'images/icons/eye-closed.svg'; // Asegúrate que este icono exista
            } else {
                input.type = 'password';
                icon.src = 'images/icons/eye.svg'; 
            }
        });
    });

    // --- Funciones de Ayuda ---
    function handleLoginError(error) {
        console.error("Error detallado login:", error.code, error.message);
        const msg = getFirebaseErrorMessage(error);
        
        if(loginError) {
            loginError.textContent = msg;
            loginError.classList.remove('hidden');
        } else {
            alert(msg);
        }
    }

    function getFirebaseErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email': return 'El correo electrónico no es válido.';
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password': return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
            case 'auth/popup-closed-by-user': return 'El inicio de sesión fue cancelado.';
            case 'auth/popup-blocked': return 'El navegador bloqueó la ventana emergente. Permítela e intenta de nuevo.';
            case 'auth/too-many-requests': return 'Demasiados intentos. Espera unos minutos.';
            case 'auth/network-request-failed': return 'Error de conexión. Verifica tu internet.';
            default: return 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
        }
    }
}