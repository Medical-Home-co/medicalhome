/* --- js/main.js (Corregido) --- */
import { store } from './store.js';

// --- IMPORTACIONES DE FIREBASE ---
import { auth, db, messaging, googleProvider } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signOut,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    // SOLUCIÓN (Item 2): Importar el controlador de persistencia
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getToken } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --- Funciones Globales Modal Invitado ---
let guestWarningModal;
window.showGuestWarningModal = () => {
    if (!guestWarningModal) guestWarningModal = document.getElementById('guest-warning-modal');
    guestWarningModal?.classList.remove('hidden');
}
window.hideGuestWarningModal = () => {
    if (!guestWarningModal) guestWarningModal = document.getElementById('guest-warning-modal');
    guestWarningModal?.classList.add('hidden');
}

// --- Función "Toast" (Aviso) ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('exiting');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 2000); // 2 segundos
}
window.showToast = showToast; // Exponer para perfil.js

// --- Lógica de Notificaciones FCM ---
async function requestAndRegisterToken(userId) {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return 'denied';
        const fcmToken = await getToken(messaging, { 
            vapidKey: "BFaLD8fCZUz7o_nSOOz4ioRlEpDAQpewlMOXs7r7ONdOx7O6NCxaZHhJDwLR5iWbwm3X1o3Z2JpYPzkkq71ul6I" 
        }); 
        if (fcmToken) {
            const tokenRef = doc(db, "users", userId, "fcmTokens", fcmToken);
            await setDoc(tokenRef, { registeredAt: new Date() });
            return 'granted';
        }
        return 'default';
    } catch (err) {
        console.error("Error al obtener o guardar el token FCM:", err);
        return 'error';
    }
}
window.requestAndRegisterToken = requestAndRegisterToken; // Exponer para perfil.js
// -------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    guestWarningModal = document.getElementById('guest-warning-modal');
    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    const appContent = document.getElementById('app-content');
    const splashScreen = document.getElementById('splash-screen');
    
    if (!body || !appShell || !appContent) { console.error("Elementos base de la UI faltan!"); return; }
    body.classList.remove('hidden');

    /* --- Lógica del Router --- */
    async function loadPage(page) {
        const routes = {
            'dashboard':    { template: 'templates/dashboard.html', script: './pages/dashboard.js' },
            'perfil':       { template: 'templates/perfil.html', script: './pages/perfil.js' },
            'graficas':     { template: 'templates/graficas.html', script: './pages/graficas.js' },
            'medicamentos': { template: 'templates/medicamentos.html', script: './pages/medicamentos.js' },
            'citas':        { template: 'templates/citas.html', script: './pages/citas.js' },
            'terapias':     { template: 'templates/terapias.html', script: './pages/terapias.js' },
            'renal':        { template: 'templates/renal.html', script: './pages/renal.js' },
            'ocular':       { template: 'templates/ocular.html', script: './pages/ocular.js' },
            'cardiaco':     { template: 'templates/cardiaco.html', script: './pages/cardiaco.js' },
            'diabetes':     { template: 'templates/diabetes.html', script: './pages/diabetes.js' },
            'artritis':     { template: 'templates/artritis.html', script: './pages/artritis.js' },
            'tea':          { template: 'templates/tea.html', script: './pages/tea.js' },
            'respiratorio': { template: 'templates/respiratorio.html', script: './pages/respiratorio.js' },
            'gastrico':     { template: 'templates/gastrico.html', script: './pages/gastrico.js' },
            'general':      { template: 'templates/general.html', script: './pages/general.js' },
            'agenda':       { template: 'templates/agenda.html', script: './pages/agenda.js' },
            'asistente-ia': { template: 'templates/asistente.html', script: './pages/asistente.js' },
            'bienestar':    { template: 'templates/bienestar.html', script: './pages/bienestar.js' },
            'notificaciones':{ template: 'templates/notificaciones.html', script: './pages/notificaciones.js' }
        };

        const route = routes[page];
        appContent.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-secondary);">Cargando...</p>';

         if (route) {
             try {
                 const response = await fetch(`${route.template}?v=${Date.now()}`);
                 if (!response.ok) throw new Error(`Plantilla no encontrada: ${route.template}`);
                 const content = await response.text();
                 appContent.innerHTML = content;
                 if (route.script) {
                     const pageModule = await import(`${route.script}?v=${Date.now()}`);
                     setTimeout(() => {
                        if (pageModule.init && typeof pageModule.init === 'function') pageModule.init();
                     }, 0);
                 }
             } catch (fetchError) {
                 console.error(`Error al cargar plantilla ${page}:`, fetchError);
                 appContent.innerHTML = `<div class="page-container" style="text-align: center; padding: 2rem;"><h2 class="page-title">Error</h2><p>No se pudo cargar la sección '${page}'.</p></div>`;
             }
         }
         else if (page === 'logout') {
              console.log("Cerrando sesión...");
              localStorage.clear();
              sessionStorage.clear();
              try { await signOut(auth); } catch (e) { console.error("Error cerrando sesión de Firebase:", e); } 
              finally { window.location.hash = ''; window.location.reload(); }
              return;
         }
         else {
             appContent.innerHTML = `<div class="page-container" style="text-align: center; padding: 2rem;"><h2 class="page-title">Página no encontrada</h2><p>La sección solicitada no existe.</p></div>`;
         }
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${page}`) { link.classList.add('active'); }
        });
    }

    async function handleNavigation() {
        let hash = window.location.hash.substring(1) || 'dashboard';
        await loadPage(hash);
    }
    window.addEventListener('hashchange', handleNavigation);

    // --- LÓGICA DE AUTENTICACIÓN (en main.js) ---
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authRegisterLink = document.getElementById('auth-register-link');
    const authGoogleBtn = document.getElementById('auth-google-btn');
    const authGuestBtn = document.getElementById('auth-guest-btn');
    const authForgotBtn = document.getElementById('auth-forgot-btn');

    function showAuthModal(show = true) {
        if (show) {
            authError.classList.add('hidden');
            if (authForm) authForm.reset();
            authModal?.classList.remove('hidden');
        } else {
            authModal?.classList.add('hidden');
        }
    }
    
    function getFirebaseErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email': return 'El correo electrónico no es válido.';
            case 'auth/invalid-credential': return 'Credenciales incorrectas.';
            case 'auth/user-not-found': return 'Credenciales incorrectas.';
            case 'auth/wrong-password': return 'Credenciales incorrectas.';
            case 'auth/email-already-in-use': return 'Este correo electrónico ya está en uso.';
            case 'auth/weak-password': return 'La contraseña es muy débil (mín. 6 caracteres).';
            default: return 'Ocurrió un error. Intenta de nuevo.';
        }
    }

    async function handleEmailLogin(e) {
        e.preventDefault();
        authError.classList.add('hidden');
        try {
            // SOLUCIÓN (Item 2): Establecer persistencia LOCAL (recordar sesión)
            await setPersistence(auth, browserLocalPersistence);
            
            const email = authEmail.value;
            const password = authPassword.value;
            await signInWithEmailAndPassword(auth, email, password);
            
            sessionStorage.setItem('loginSuccess', 'true');
            window.location.hash = '#perfil'; // Redirigir a perfil
            window.location.reload(); 
            
        } catch (error) {
            console.error("Error en login:", error.code);
            authError.textContent = getFirebaseErrorMessage(error);
            authError.classList.remove('hidden');
        }
    }

    async function handleGoogleLogin() {
        authError.classList.add('hidden');
        try {
            // SOLUCIÓN (Item 2): Establecer persistencia LOCAL (recordar sesión)
            await setPersistence(auth, browserLocalPersistence);
            
            await signInWithPopup(auth, googleProvider);
            
            sessionStorage.setItem('loginSuccess', 'true');
            sessionStorage.setItem('openProfileModal', 'true'); 

            window.location.hash = '#perfil';
            window.location.reload();
            
        } catch (error) {
            console.error("Error con Google:", error);
            authError.textContent = getFirebaseErrorMessage(error);
            authError.classList.remove('hidden');
        }
    }

    authRegisterLink?.addEventListener('click', () => {
        showAuthModal(false);
        sessionStorage.setItem('openProfileModal', 'true');
    });

    authGuestBtn?.addEventListener('click', () => {
        showAuthModal(false);
        store.loadGuestData();
        handleNavigation();
        updateSidebarProfile();
    });
    
    authForgotBtn?.addEventListener('click', async () => {
        const email = authEmail.value;
        if (!email) {
            authError.textContent = 'Ingresa tu email para restablecer la contraseña.';
            authError.classList.remove('hidden');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            authError.classList.add('hidden');
            alert(`Se envió un enlace para restablecer tu contraseña a ${email}.`);
        } catch (error) {
            authError.textContent = getFirebaseErrorMessage(error);
            authError.classList.remove('hidden');
        }
    });

    authForm?.addEventListener('submit', handleEmailLogin);
    authGoogleBtn?.addEventListener('click', handleGoogleLogin);

    // ... (Lógica Otros Modales y Sidebar) ...
    const aboutModal = document.getElementById('about-modal');
    /* ... */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    /* ... */
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    /* ... */
    async function handleLogout() {
        if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
             localStorage.clear();
             sessionStorage.clear();
             try {
                 await signOut(auth);
                 console.log("Sesión de Firebase cerrada.");
             } catch (e) {
                 console.error("Error cerrando sesión de Firebase:", e);
             } finally {
                 window.location.hash = '';
                 window.location.reload();
             }
        }
    }
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    });

    document.body.addEventListener('click', async (e) => {
        /* ... (lógica de aboutBtn, reportBtn, accordionToggle, shareLink) ... */
        // (La lógica de 'shareLink' ya fue corregida en la respuesta anterior)
        const shareLink = e.target.closest('a[href="#share"]');
        if (shareLink) {
            e.preventDefault();
            const shareUrl = "https://medicalhomeapp-1a68b.web.app/";
            if (navigator.share) {
                await navigator.share({ title: 'MedicalHome', text: '¡Descubre MedicalHome, tu asistente de salud personal!', url: shareUrl });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                showToast('¡Enlace de la app copiado!');
            }
        }
        
        const guestWarningCreateBtn = e.target.closest('#guest-warning-create-btn');
        if (guestWarningCreateBtn) {
            hideGuestWarningModal();
            sessionStorage.setItem('openProfileModal', 'true');
            window.location.hash = '#perfil';
        }
    });

    /* --- Actualizar Sidebar con Datos del Perfil --- */
    function updateSidebarProfile() {
        try {
            const user = auth.currentUser;
            const profile = store.getProfile();
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            const sidebarUsername = document.getElementById('sidebar-username');

            if (user && profile) {
                if (sidebarAvatar) sidebarAvatar.src = profile.avatar || 'images/avatar.png';
                if (sidebarUsername) sidebarUsername.textContent = `Hola, ${profile.fullName ? profile.fullName.split(' ')[0] : 'Usuario'}`;
            } else if (user && !profile) {
                if (sidebarAvatar) sidebarAvatar.src = user.photoURL || 'images/avatar.png';
                if (sidebarUsername) sidebarUsername.textContent = `Hola, ${user.displayName ? user.displayName.split(' ')[0] : 'Usuario'}`;
            } else {
                if (sidebarAvatar) sidebarAvatar.src = 'images/avatar.png';
                if (sidebarUsername) sidebarUsername.textContent = 'Hola, Invitado';
            }
        } catch (e) {
            console.error("Error al actualizar sidebar:", e);
        }
    }

    // --- CARGA INICIAL Y LISTENER DE AUTH (MANEJA LA PERSISTENCIA) ---
    onAuthStateChanged(auth, async (user) => {
        updateSidebarProfile();
        
        if (user) {
            // SOLUCIÓN (Item 2): El usuario ESTÁ logueado (persistencia funcionó)
            console.log("Auth state changed: Usuario logueado", user.uid);
            showAuthModal(false);
            
            await requestAndRegisterToken(user.uid);
            
            if (sessionStorage.getItem('loginSuccess') === 'true') {
                showToast("¡Inicio de sesión exitoso!");
                sessionStorage.removeItem('loginSuccess');
            }
            
            await handleNavigation();
            
        } else {
            // SOLUCIÓN (Item 1): El usuario NO está logueado
            console.log("Auth state changed: Usuario deslogueado");
            
            if (store.isGuestMode()) {
                await handleNavigation();
            } else {
                // Muestra el modal de autenticación (que tiene todos los botones)
                appContent.innerHTML = '';
                showAuthModal(true);
            }
        }
    });

    // --- Ocultar Splash Screen ---
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 500);
    }
});