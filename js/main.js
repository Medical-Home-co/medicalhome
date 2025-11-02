/* --- js/main.js (Corregido) --- */
import { store } from './store.js';

// --- IMPORTACIONES DE FIREBASE ---
import { auth, db, messaging, googleProvider } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    signOut,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail
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

// --- NUEVA FUNCIÓN: Mostrar "Toast" (Aviso) ---
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
    }, 3000); // El aviso dura 3 segundos
}

// --- Lógica de Notificaciones FCM ---
async function registrarTokenFCM(userId) {
    try {
        console.log("Solicitando permiso para notificaciones...");
        const fcmToken = await getToken(messaging, { 
            vapidKey: "BFaLD8fCZUz7o_nSOOz4ioRlEpDAQpewlMOXs7r7ONdOx7O6NCxaZHhJDwLR5iWbwm3X1o3Z2JpYPzkkq71ul6I" 
        }); 

        if (fcmToken) {
            console.log("Token de dispositivo obtenido:", fcmToken);
            const tokenRef = doc(db, "users", userId, "fcmTokens", fcmToken);
            await setDoc(tokenRef, { registeredAt: new Date() });
            console.log("Token FCM guardado en Firestore exitosamente!");
        } else {
            console.log("No se pudo obtener el token. El usuario no dio permiso.");
        }
    } catch (err) {
        console.error("Error al obtener o guardar el token FCM:", err);
    }
}
// -------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    guestWarningModal = document.getElementById('guest-warning-modal');

    // ... (Lucide, appShell, etc. sin cambios) ...
    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    const appContent = document.getElementById('app-content');
    const splashScreen = document.getElementById('splash-screen');
    
    if (!body || !appShell || !appContent) { console.error("Elementos base de la UI faltan!"); return; }
    body.classList.remove('hidden');

    /* --- Lógica del Router --- */
    async function loadPage(page) {
        // --- CORRECCIÓN: Ruta 'login' eliminada ---
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
             // ... (lógica de carga de plantilla y script sin cambios) ...
             try {
                 const response = await fetch(`${route.template}?v=${Date.now()}`);
                 if (!response.ok) throw new Error(`Plantilla no encontrada: ${route.template}`);
                 const content = await response.text();
                 appContent.innerHTML = content;

                 if (route.script) {
                     try {
                         const pageModule = await import(`${route.script}?v=${Date.now()}`);
                         setTimeout(() => {
                            if (pageModule.init && typeof pageModule.init === 'function') {
                                pageModule.init();
                            }
                         }, 0);
                    } catch(importError) {
                        console.error(`Error al importar/ejecutar script ${page} (${route.script}):`, importError);
                    }
                 }
             } catch (fetchError) {
                 console.error(`Error al cargar plantilla ${page}:`, fetchError);
                 appContent.innerHTML = `<div class="page-container" style="text-align: center; padding: 2rem;"><h2 class="page-title">Error</h2><p>No se pudo cargar la sección '${page}'.</p></div>`;
             }
         }
         else if (page === 'logout') {
             // ... (lógica de logout sin cambios) ...
              console.log("Cerrando sesión...");
              localStorage.clear();
              sessionStorage.clear();
              try {
                  await signOut(auth);
                  console.log("Sesión de Firebase cerrada.");
              } catch (e) {
                  console.error("Error cerrando sesión de Firebase:", e);
              } finally {
                  window.location.hash = ''; // Ir a la raíz
                  window.location.reload();
              }
              return;
         }
         else {
             // ... (lógica de página no encontrada sin cambios) ...
             appContent.innerHTML = `<div class="page-container" style="text-align: center; padding: 2rem;"><h2 class="page-title">Página no encontrada</h2><p>La sección solicitada no existe.</p></div>`;
         }

        // ... (lógica de actualizar links activos sin cambios) ...
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${page}`) { link.classList.add('active'); }
        });

        // ... (Lucide sin cambios) ...
    }

    async function handleNavigation() {
        const user = auth.currentUser;
        let hash = window.location.hash.substring(1) || 'dashboard'; // Default
        
        // --- CORRECCIÓN: Simplificado. El control de auth lo hace onAuthStateChanged
        // Si no es usuario ni invitado, el modal de auth se mostrará
        // y esta función (handleNavigation) no se habrá llamado.
        // Si es invitado, puede ver 'dashboard'.
        // Si es usuario, puede ver todo.
        
        await loadPage(hash);
    }
    window.addEventListener('hashchange', handleNavigation);


    // ==========================================================
    // === INICIO: NUEVA LÓGICA DE AUTENTICACIÓN (en main.js) ===
    // ==========================================================
    
    // --- Referencias al nuevo Modal de Auth ---
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authLoginBtn = document.getElementById('auth-login-btn');
    const authRegisterLink = document.getElementById('auth-register-link');
    const authGoogleBtn = document.getElementById('auth-google-btn');
    const authGuestBtn = document.getElementById('auth-guest-btn');
    const authForgotBtn = document.getElementById('auth-forgot-btn');

    // --- Función para mostrar/ocultar modal de auth ---
    function showAuthModal(show = true) {
        if (show) {
            authError.classList.add('hidden');
            authForm.reset();
            authModal?.classList.remove('hidden');
        } else {
            authModal?.classList.add('hidden');
        }
    }
    
    // --- Función de error ---
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

    // --- Lógica de Login con Email ---
    async function handleEmailLogin(e) {
        e.preventDefault();
        authError.classList.add('hidden');
        try {
            const email = authEmail.value;
            const password = authPassword.value;
            await signInWithEmailAndPassword(auth, email, password);
            
            // Éxito: onAuthStateChanged se encargará, pero preparamos el aviso
            sessionStorage.setItem('loginSuccess', 'true');
            // Redirigimos a perfil y recargamos
            window.location.hash = '#perfil';
            window.location.reload(); 
            
        } catch (error) {
            console.error("Error en login:", error.code);
            authError.textContent = getFirebaseErrorMessage(error);
            authError.classList.remove('hidden');
        }
    }

    // --- Lógica de Login con Google ---
    async function handleGoogleLogin() {
        authError.classList.add('hidden');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // const user = result.user;
            
            // Comprobar si es usuario nuevo (requiere importar getAdditionalUserInfo)
            // Por ahora, solo redirigimos.
            
            // Éxito: preparamos el aviso
            sessionStorage.setItem('loginSuccess', 'true');
            
            // Si es nuevo, pedimos que complete el perfil
            // (Esta lógica la moveremos a perfil.js)
            // const isNewUser = getAdditionalUserInfo(result).isNewUser;
            // if(isNewUser) {
            sessionStorage.setItem('openProfileModal', 'true');
            // }

            window.location.hash = '#perfil';
            window.location.reload();
            
        } catch (error) {
            console.error("Error con Google:", error);
            authError.textContent = getFirebaseErrorMessage(error);
            authError.classList.remove('hidden');
        }
    }

    // --- Lógica de "Crear Usuario" (Link) ---
    authRegisterLink.addEventListener('click', () => {
        showAuthModal(false);
        sessionStorage.setItem('openProfileModal', 'true');
        // El hash #perfil ya está en el <a>, handleNavigation lo tomará
    });

    // --- Lógica de "Invitado" ---
    authGuestBtn.addEventListener('click', () => {
        showAuthModal(false);
        store.loadGuestData(); // Carga datos de invitado
        handleNavigation(); // Carga la app en modo invitado
        updateSidebarProfile(); // Actualiza el sidebar a "Invitado"
    });
    
    // --- Lógica "Olvidé Contraseña" ---
    authForgotBtn.addEventListener('click', async () => {
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

    // --- Asignar evento al formulario de login ---
    authForm.addEventListener('submit', handleEmailLogin);
    authGoogleBtn.addEventListener('click', handleGoogleLogin);

    // ==========================================================
    // === FIN: NUEVA LÓGICA DE AUTENTICACIÓN ===
    // ==========================================================

    /* --- Lógica Modal Bienvenida (ELIMINADA) --- */
    // La lógica de welcome-modal fue eliminada y reemplazada por auth-modal

    /* --- Lógica Otros Modales y Sidebar (Sin cambios) --- */
    // ... (toda la lógica de aboutModal, reportModal, collapseBtn, etc., sigue igual) ...
    const aboutModal = document.getElementById('about-modal');
    /* ... */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    /* ... */
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    /* ... */
    async function handleLogout() {
        if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
             localStorage.clear(); // Limpiar todo, no solo session
             sessionStorage.clear();
             try {
                 await signOut(auth);
                 console.log("Sesión de Firebase cerrada.");
             } catch (e) {
                 console.error("Error cerrando sesión de Firebase:", e);
             } finally {
                 window.location.hash = ''; // Ir a la raíz
                 window.location.reload();
             }
        }
    }
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    });

    /* --- Delegación de Eventos en Body (Sin cambios) --- */
    document.body.addEventListener('click', async (e) => {
        /* ... (lógica de aboutBtn, reportBtn, accordionToggle, shareLink, etc.) ... */
        const guestWarningCreateBtn = e.target.closest('#guest-warning-create-btn');
        if (guestWarningCreateBtn) {
            console.log("Cambiando de Invitado a Crear Usuario...");
            hideGuestWarningModal();
            sessionStorage.setItem('openProfileModal', 'true'); // Preparar perfil
            window.location.hash = '#perfil'; // Redirigir a la página de perfil
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
                // Usuario logueado CON perfil local
                if (sidebarAvatar) sidebarAvatar.src = profile.avatar || 'images/avatar.png';
                if (sidebarUsername) sidebarUsername.textContent = `Hola, ${profile.fullName ? profile.fullName.split(' ')[0] : 'Usuario'}`;
            } else if (user && !profile) {
                // Usuario logueado SIN perfil local (ej. Google)
                if (sidebarAvatar) sidebarAvatar.src = user.photoURL || 'images/avatar.png';
                if (sidebarUsername) sidebarUsername.textContent = `Hola, ${user.displayName ? user.displayName.split(' ')[0] : 'Usuario'}`;
            } else {
                // Invitado
                if (sidebarAvatar) sidebarAvatar.src = 'images/avatar.png';
                if (sidebarUsername) sidebarUsername.textContent = 'Hola, Invitado';
            }
        } catch (e) {
            console.error("Error al actualizar sidebar:", e);
        }
    }
    // (Se llama a updateSidebarProfile dentro de onAuthStateChanged)


    // -----------------------------------------------------------------
    // --- CARGA INICIAL Y LISTENER DE AUTH (MODIFICADO) ---
    // -----------------------------------------------------------------
    
    onAuthStateChanged(auth, async (user) => {
        updateSidebarProfile(); // Actualizar el sidebar siempre
        
        if (user) {
            // Usuario ha iniciado sesión
            console.log("Auth state changed: Usuario logueado", user.uid);
            showAuthModal(false); // Ocultar modal de login
            
            // REGISTRAMOS EL TOKEN FCM
            await registrarTokenFCM(user.uid);
            
            // --- NUEVO: Mostrar aviso de "Inicio exitoso" ---
            if (sessionStorage.getItem('loginSuccess') === 'true') {
                showToast("¡Inicio de sesión exitoso!");
                sessionStorage.removeItem('loginSuccess');
            }
            
            // Cargar la página solicitada (o dashboard)
            await handleNavigation();
            
        } else {
            // Usuario ha cerrado sesión o no está logueado
            console.log("Auth state changed: Usuario deslogueado");
            
            // Si está en modo invitado, permitir navegación
            if (store.isGuestMode()) {
                await handleNavigation();
            } else {
                // Si no es invitado, mostrar el modal de autenticación
                appContent.innerHTML = ''; // Limpiar contenido principal
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