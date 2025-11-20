/* --- js/main.js (Corrección Errores Consola + Modales) --- */
import { store } from './store.js';
import { loadPage } from './router.js';
import { app, auth, db, messaging } from './firebase-config.js';
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app-check.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getToken } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// --- 1. Inicialización de App Check (CORREGIDO PARA LOCALHOST) ---
// Esto soluciona el error 400 Bad Request en consola
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    console.log("Modo Debug de AppCheck activado para Localhost.");
}

try {
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6Lc5IgMsAAAAACF0FMXvJD7F0MKtly1boz6sX0KOKUq'),
        isTokenAutoRefreshEnabled: true
    });
} catch (e) {
    if (e.code !== 'appCheck/already-initialized') {
        console.warn("Nota AppCheck:", e.message);
    }
}

// --- 2. Variables Globales de UI ---
const body = document.body;
const splashScreen = document.getElementById('splash-screen');
const authContainer = document.getElementById('auth-container');
const appShell = document.querySelector('.app-shell');
const mobileNav = document.querySelector('.mobile-nav');
const aboutModal = document.getElementById('about-modal');
const reportModal = document.getElementById('report-modal');

// --- 3. Funciones Auxiliares de UI ---
function openModal(modal) {
    if (modal) modal.classList.remove('hidden');
}

function closeModal(modal) {
    if (modal) modal.classList.add('hidden');
}

// Función para actualizar el Sidebar según las condiciones del perfil
function updateMainMenu() {
    const profile = store.getProfile();
    const conditions = profile?.conditions || [];
    
    // Lista de IDs de condiciones en el HTML
    const allConditions = ['renal', 'cardiaco', 'diabetes', 'artritis', 'tea', 'respiratorio', 'gastrico', 'ocular', 'general'];
    let hasVisibleConditions = false;

    allConditions.forEach(condition => {
        // Buscar el enlace en el sidebar
        const navLink = document.querySelector(`a[href="#${condition}"].sub-link`);
        if (navLink) {
            const listItem = navLink.closest('li');
            if (listItem) {
                if (conditions.includes(condition)) {
                    listItem.classList.remove('hidden');
                    listItem.style.display = 'block'; // Forzar visualización
                    hasVisibleConditions = true;
                } else {
                    listItem.classList.add('hidden');
                    listItem.style.display = 'none'; // Forzar ocultamiento
                }
            }
        }
    });

    // Mostrar/Ocultar el acordeón padre si no hay condiciones
    const accordion = document.querySelector('.nav-item-accordion');
    if (accordion) {
        accordion.style.display = hasVisibleConditions ? 'block' : 'none';
        // Abrir acordeón por defecto si hay condiciones
        if (hasVisibleConditions) accordion.classList.add('open');
    }
}

// Función para actualizar avatar y nombre en el sidebar
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
                sidebarUsername.textContent = 'Hola, Invitado';
            }
        }
        // Actualizar el menú de condiciones cada vez que actualizamos perfil
        updateMainMenu();
    } catch (e) { console.error("Error al actualizar sidebar:", e); }
}

// --- 4. Registro de Notificaciones (FCM) ---
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
        // Silenciar errores de permiso bloqueado para no molestar
        if (err.code !== 'messaging/permission-blocked') {
            console.warn("FCM info:", err.message); 
        }
    }
}

// --- 5. Control de Sesión ---
async function handleAuthState(user) {
    const isGuest = store.isGuestMode();
    const currentHash = window.location.hash.substring(1);

    if (user || isGuest) {
        // Usuario Autenticado o Invitado
        appShell.classList.remove('hidden');
        mobileNav.classList.remove('hidden');
        authContainer.classList.add('hidden');
        authContainer.innerHTML = ''; 

        updateSidebarProfile(); // Esto también actualiza el menú

        if (user) registrarTokenFCM(user.uid);

        // Redirección inicial
        if (currentHash === 'login' || currentHash === '') {
            if(sessionStorage.getItem('openProfileModal') === 'true') {
                 window.location.hash = '#perfil';
            } else {
                 window.location.hash = '#dashboard';
            }
        } else {
            loadPage(currentHash);
        }

    } else {
        // No Autenticado
        appShell.classList.add('hidden');
        mobileNav.classList.add('hidden');
        authContainer.classList.remove('hidden');

        if (currentHash !== 'login') window.location.hash = '#login';
        else loadPage('login');
    }
}

// --- 6. Inicialización DOM y Eventos ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Listener Auth
    onAuthStateChanged(auth, handleAuthState);

    // Listener Router
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (auth.currentUser || store.isGuestMode() || hash === 'login') {
            loadPage(hash);
        } else {
            window.location.hash = '#login';
        }
    });

    // Inicializar Iconos
    if (window.lucide) { try { lucide.createIcons(); } catch(e){} }

    // Mostrar cuerpo
    body.classList.remove('hidden');
    if (splashScreen) setTimeout(() => splashScreen.classList.add('hidden'), 1000);

    /* --- MANEJO DE SIDEBAR Y MENU MOVIL --- */
    const collapseBtn = document.querySelector('.collapse-btn');
    collapseBtn?.addEventListener('click', () => {
        appShell.classList.toggle('collapsed');
    });

    /* --- MANEJO DE MODALES GLOBALES (About / Report) --- */
    // Usamos delegación de eventos en document.body para asegurar que funcionen
    // incluso si el DOM cambia.
    document.body.addEventListener('click', (e) => {
        // Abrir "Quiénes Somos"
        if (e.target.closest('#about-btn')) {
            e.preventDefault();
            openModal(aboutModal);
        }
        
        // Abrir "Reportar Fallo"
        if (e.target.closest('#report-btn')) {
            e.preventDefault();
            openModal(reportModal);
        }

        // Cerrar cualquier modal con botón .close-modal-btn
        if (e.target.closest('.close-modal-btn')) {
            e.preventDefault();
            const modal = e.target.closest('.modal-overlay');
            closeModal(modal);
        }

        // Botón Logout
        if (e.target.closest('.logout-btn')) {
            e.preventDefault();
            if (confirm("¿Cerrar sesión?")) {
                localStorage.removeItem('medicalHome-userMode');
                sessionStorage.clear();
                signOut(auth).then(() => window.location.reload());
            }
        }

        // Compartir App
        if (e.target.closest('a[href="#share"]')) {
            e.preventDefault();
            if (navigator.share) {
                navigator.share({ title: 'MedicalHome', url: window.location.href });
            } else {
                alert('URL copiada al portapapeles');
                navigator.clipboard.writeText(window.location.href);
            }
        }
    });

    /* --- Formulario de Reporte --- */
    const reportForm = document.getElementById('report-form');
    reportForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('report-text')?.value;
        window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte MedicalHome&body=${encodeURIComponent(text)}`;
        closeModal(reportModal);
        reportForm.reset();
    });

    /* --- Tema Oscuro --- */
    const themeToggle = document.getElementById('theme-toggle-desktop');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
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