/* --- js/main.js (Corrección V5: AppCheck OFF, Menú Inteligente, Crear Usuario) --- */
import { store } from './store.js';
import { loadPage } from './router.js';
import { app, auth, db, messaging } from './firebase-config.js';
// 1. DESACTIVADO TEMPORALMENTE PARA ELIMINAR ERRORES 400
// import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app-check.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getToken } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/* --- NOTA DE SEGURIDAD ---
   App Check está comentado para permitir que la app funcione en producción 
   sin errores de validación de dominio/token.
   
   Si en el futuro se configura correctamente en la consola de Firebase, 
   se puede descomentar.
*/
/*
try {
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('TU_CLAVE_PUBLICA'),
        isTokenAutoRefreshEnabled: true
    });
} catch (e) { console.warn("AppCheck desactivado:", e.message); }
*/

// --- 2. Variables Globales de UI ---
const body = document.body;
const splashScreen = document.getElementById('splash-screen');
const authContainer = document.getElementById('auth-container');
const appShell = document.querySelector('.app-shell');
const mobileNav = document.querySelector('.mobile-nav');

// Modales
const aboutModal = document.getElementById('about-modal');
const reportModal = document.getElementById('report-modal');
const logoutModal = document.getElementById('logout-modal'); // Nuevo modal
const guestWarningModal = document.getElementById('guest-warning-modal');

// --- 3. Funciones Globales (Exponer a window) ---
window.openModal = (modal) => {
    if (modal) modal.classList.remove('hidden');
};

window.closeModal = (modal) => {
    if (modal) modal.classList.add('hidden');
};

window.showGuestWarningModal = () => {
    if (guestWarningModal) window.openModal(guestWarningModal);
};
window.hideGuestWarningModal = () => {
    if (guestWarningModal) window.closeModal(guestWarningModal);
};

// --- 4. Lógica del Menú Lateral (Condiciones Médicas) ---
function updateMainMenu() {
    const profile = store.getProfile();
    // Si no hay perfil (ej. nuevo usuario), asumimos array vacío
    const conditions = profile?.conditions || [];
    
    const allConditions = ['renal', 'cardiaco', 'diabetes', 'artritis', 'tea', 'respiratorio', 'gastrico', 'ocular', 'general'];
    let visibleCount = 0;

    // 1. Mostrar/Ocultar items individuales
    allConditions.forEach(condition => {
        const navLink = document.querySelector(`a[href="#${condition}"].sub-link`);
        if (navLink) {
            const listItem = navLink.closest('li');
            if (listItem) {
                if (conditions.includes(condition)) {
                    listItem.classList.remove('hidden');
                    listItem.style.display = 'block';
                    visibleCount++;
                } else {
                    listItem.classList.add('hidden');
                    listItem.style.display = 'none';
                }
            }
        }
    });

    // 2. Lógica del Acordeón (Padre)
    const accordionItem = document.querySelector('.nav-item-accordion');
    
    if (accordionItem) {
        if (visibleCount > 0) {
            accordionItem.style.display = 'block';
            
            // REGLA SOLICITADA:
            // Si son 3 o menos -> Desplegado (.open)
            // Si son 4 o más -> Plegado (sin .open)
            if (visibleCount <= 3) {
                accordionItem.classList.add('open');
            } else {
                accordionItem.classList.remove('open');
            }
        } else {
            accordionItem.style.display = 'none'; // Ocultar si no hay condiciones
        }
    }
}

// Actualizar info del usuario en sidebar
function updateSidebarProfile() {
    try {
        const profile = store.getProfile();
        const sidebarAvatar = document.getElementById('sidebar-avatar');
        const sidebarUsername = document.getElementById('sidebar-username');
        
        if (sidebarAvatar) sidebarAvatar.src = profile?.avatar || 'images/avatar.png';
        
        if (sidebarUsername) {
            if (profile && profile.fullName) {
                sidebarUsername.textContent = `Hola, ${profile.fullName.split(' ')[0]}`;
            } else {
                sidebarUsername.textContent = 'Hola, Usuario';
            }
        }
        updateMainMenu(); 
    } catch (e) { console.error("Error sidebar:", e); }
}

// --- 5. Registro FCM ---
async function registrarTokenFCM(userId) {
    if (!messaging) return;
    try {
        const isGitHub = window.location.hostname.includes('github.io');
        const swPath = isGitHub ? '/medicalhome/firebase-messaging-sw.js' : '/firebase-messaging-sw.js';
        const swScope = isGitHub ? '/medicalhome/' : '/';

        const swRegistration = await navigator.serviceWorker.register(swPath, { scope: swScope });
        
        const fcmToken = await getToken(messaging, { 
            vapidKey: "BFaLD8fCZUz7o_nSOOz4ioRlEpDAQpewlMOXs7r7ONdOx7O6NCxaZHhJDwLR5iWbwm3X1o3Z2JpYPzkkq71ul6I",
            serviceWorkerRegistration: swRegistration 
        }); 

        if (fcmToken) {
            const tokenRef = doc(db, "users", userId, "fcmTokens", fcmToken);
            await setDoc(tokenRef, { registeredAt: new Date(), platform: 'web' });
        }
    } catch (err) { 
        if (err.code !== 'messaging/permission-blocked') console.warn("FCM:", err.message); 
    }
}

// --- 6. Control de Sesión y Redirección ---
async function handleAuthState(user) {
    const isGuest = store.isGuestMode();
    const currentHash = window.location.hash.substring(1);
    const isCreatingUser = sessionStorage.getItem('openProfileModal') === 'true';

    if (user || isGuest) {
        // --- SESIÓN ACTIVA ---
        appShell.classList.remove('hidden');
        mobileNav.classList.remove('hidden');
        authContainer.classList.add('hidden');
        authContainer.innerHTML = ''; 

        updateSidebarProfile();

        if (user) registrarTokenFCM(user.uid);

        // Redirección: Ir a PERFIL por defecto si es login o raíz
        if (currentHash === 'login' || currentHash === '') {
            window.location.hash = '#perfil';
        } else {
            loadPage(currentHash);
        }

    } else {
        // --- NO LOGUEADO ---
        
        // EXCEPCIÓN CRÍTICA: Permitir estar en #perfil si se está creando usuario
        if (currentHash === 'perfil' && isCreatingUser) {
            console.log("Creando usuario: Acceso temporal a Perfil permitido.");
            appShell.classList.remove('hidden'); // Mostrar app para ver el formulario
            authContainer.classList.add('hidden'); // Ocultar login
            updateSidebarProfile(); // Cargar con datos vacíos/defecto
            loadPage('perfil');
            return; // DETENER aquí para no redirigir a login
        }

        // Si no es la excepción, mandar al Login
        appShell.classList.add('hidden');
        mobileNav.classList.add('hidden');
        authContainer.classList.remove('hidden');

        if (currentHash !== 'login') window.location.hash = '#login';
        else loadPage('login');
    }
}

// --- 7. Inicialización DOM ---
document.addEventListener('DOMContentLoaded', () => {
    
    onAuthStateChanged(auth, handleAuthState);

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        const isCreatingUser = sessionStorage.getItem('openProfileModal') === 'true';
        
        // Permitir navegación si hay usuario, es invitado, O está creando cuenta (solo a perfil)
        if (auth.currentUser || store.isGuestMode() || (hash === 'perfil' && isCreatingUser)) {
            loadPage(hash);
        } else {
            // Si intenta ir a otra cosa sin sesión, login
            if (hash !== 'login') window.location.hash = '#login';
            else loadPage('login');
        }
    });

    if (window.lucide) { try { lucide.createIcons(); } catch(e){} }

    body.classList.remove('hidden');
    if (splashScreen) setTimeout(() => splashScreen.classList.add('hidden'), 1000);

    /* --- Eventos de UI Globales (Delegación) --- */
    
    // 1. Click en Acordeón del Menú
    document.addEventListener('click', (e) => {
        const accordionToggle = e.target.closest('.accordion-toggle');
        if (accordionToggle) {
            e.preventDefault();
            const parent = accordionToggle.closest('.nav-item-accordion');
            if (parent) parent.classList.toggle('open');
        }
    });

    // 2. Colapso Sidebar
    const collapseBtn = document.querySelector('.collapse-btn');
    collapseBtn?.addEventListener('click', () => {
        appShell.classList.toggle('collapsed');
    });

    // 3. Manejo Global de Clics (Modales y Botones)
    document.body.addEventListener('click', (e) => {
        
        // Abrir Modales Info
        if (e.target.closest('#about-btn')) { e.preventDefault(); window.openModal(aboutModal); }
        if (e.target.closest('#report-btn')) { e.preventDefault(); window.openModal(reportModal); }
        
        // Cerrar Modales
        if (e.target.closest('.close-modal-btn')) {
            e.preventDefault();
            const modal = e.target.closest('.modal-overlay');
            window.closeModal(modal);
        }

        // Botón Logout Sidebar (Abre Modal Bonito)
        if (e.target.closest('.logout-btn')) {
            e.preventDefault();
            if (logoutModal) {
                window.openModal(logoutModal);
            } else {
                // Fallback si no existe el modal en el HTML aún
                if (confirm("¿Cerrar sesión?")) performLogout(); 
            }
        }

        // Botón "Confirmar Salida" (Dentro del Modal Logout)
        if (e.target.closest('#confirm-logout-btn')) {
            performLogout();
        }

        // Botón "Iniciar Sesión/Crear" en Advertencia Invitado
        if (e.target.closest('#guest-warning-login-btn')) {
            window.hideGuestWarningModal();
            performLogout(); // Cierra sesión de invitado y lleva al login
        }
    });

    // Lógica real de Logout
    async function performLogout() {
        localStorage.removeItem('medicalHome-userMode');
        sessionStorage.clear();
        
        // Cerrar modal si está abierto
        if (logoutModal) window.closeModal(logoutModal);
        
        await signOut(auth);
        window.location.hash = '#login';
        window.location.reload();
    }

    /* --- Formulario Reporte --- */
    const reportForm = document.getElementById('report-form');
    reportForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('report-text')?.value;
        window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte MedicalHome&body=${encodeURIComponent(text)}`;
        window.closeModal(reportModal);
        reportForm.reset();
    });

    /* --- Tema Oscuro --- */
    const themeToggle = document.getElementById('theme-toggle-desktop');
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-theme');
        if (themeToggle) themeToggle.checked = true;
    }
    themeToggle?.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
});