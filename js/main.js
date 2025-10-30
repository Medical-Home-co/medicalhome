/* --- js/main.js --- */
import { store } from './store.js';

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

document.addEventListener('DOMContentLoaded', async () => {
    guestWarningModal = document.getElementById('guest-warning-modal'); // Asignar aquí

    // Intenta cargar Lucide Icons si está disponible
    if (window.lucide) { try { lucide.createIcons(); } catch(e){ console.warn("Lucide no pudo crear iconos:", e); } }

    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    const appContent = document.getElementById('app-content');
    const splashScreen = document.getElementById('splash-screen');

    if (!body || !appShell || !appContent) { console.error("Elementos base de la UI faltan!"); return; }
    body.classList.remove('hidden'); // Mostrar cuerpo una vez que JS cargue

    /* --- Lógica del Router --- */
    async function loadPage(page) {
        // Objeto de rutas actualizado
        const routes = {
            // --- AÑADIR RUTA DE LOGIN ---
            'login':        { template: 'templates/login.html', script: './pages/login.js' },
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
                     try {
                         const pageModule = await import(`${route.script}?v=${Date.now()}`);
                         setTimeout(() => {
                            if (pageModule.init && typeof pageModule.init === 'function') {
                                pageModule.init();
                            }
                         }, 0);
                    } catch(importError) {
                        console.error(`Error al importar/ejecutar script ${page} (${route.script}):`, importError);
                        appContent.innerHTML += `<div style="padding:1rem; color: red;">Error al cargar la funcionalidad de esta página.</div>`;
                    }
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
              // Importar auth solo para el logout de Firebase
              import('./firebase-config.js').then(async (firebase) => {
                  try {
                      await firebase.auth.signOut();
                      console.log("Sesión de Firebase cerrada.");
                  } catch (e) {
                      console.error("Error cerrando sesión de Firebase:", e);
                  } finally {
                      window.location.hash = '';
                      window.location.reload();
                  }
              });
              return;
         }
         else {
             const pageTitle = page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ');
             appContent.innerHTML = `<div class="page-container" style="text-align: center; padding: 2rem;"><h2 class="page-title">Página ${pageTitle} no encontrada</h2><p>La sección solicitada no existe.</p></div>`;
         }

        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${page}`) {
                link.classList.add('active');
                 const parentAccordion = link.closest('.nav-item-accordion');
                 if (parentAccordion && !parentAccordion.classList.contains('open')) {
                     parentAccordion.classList.add('open');
                 }
            }
        });

        if (window.lucide) { setTimeout(() => { try { lucide.createIcons(); } catch(e){} }, 50); }
    }

    async function handleNavigation() {
        // --- LÓGICA DE PROTECCIÓN DE RUTAS ---
        // Importar auth aquí para verificar el estado de inicio de sesión
        const { auth } = await import('./firebase-config.js');
        const user = auth.currentUser;
        let hash = window.location.hash.substring(1) || 'dashboard'; // Default

        const guestPages = ['login', 'dashboard', 'about', 'report']; // Páginas que un invitado puede ver

        if (!user && !store.isGuestMode()) {
            // No hay usuario Y no es invitado
            if (hash !== 'login' && !guestPages.includes(hash)) {
                // Si intenta acceder a una página protegida (ej. #perfil), redirigir a #login
                // Excepción: Si está en #perfil y viene de 'Crear Usuario', se le permite
                if (hash === 'perfil' && sessionStorage.getItem('openProfileModal') === 'true') {
                    // Permitir continuar a #perfil para registrarse
                } else if (hash === '') {
                    // Si está en la raíz, dejar que el modal de bienvenida decida
                }
                else {
                    console.log("Usuario no logueado, redirigiendo a login");
                    hash = 'login';
                    window.location.hash = '#login';
                }
            }
        } else if (user && hash === 'login') {
            // Usuario ya logueado, no dejarlo ver la página de login
            hash = 'dashboard';
            window.location.hash = '#dashboard';
        }

        // Si el hash por defecto es 'dashboard' y no hay usuario, mostrar 'login'
        if (hash === 'dashboard' && !user && !store.isGuestMode()) {
             hash = 'login';
             window.location.hash = '#login';
        }
        
        await loadPage(hash);
    }
    window.addEventListener('hashchange', handleNavigation);

    /* --- Lógica Modal Bienvenida --- */
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
        const guestBtn = document.getElementById('guest-btn');
        const createUserBtn = document.getElementById('create-user-btn');
        const dontShowAgainCheckbox = document.getElementById('dont-show-again');
        const welcomeModalShown = localStorage.getItem('welcomeModalShown');
        
        // (Lógica para determinar si hay datos reales)
        let hasRealUserData = false;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'theme' && key !== 'welcomeModalShown' && key !== 'medicalHome-userMode') {
                hasRealUserData = true; break;
            }
        }
        
        // Mostrar modal si no se ha mostrado Y no hay datos
        if (!welcomeModalShown && !hasRealUserData) {
            welcomeModal.classList.remove('hidden');
        } else {
            welcomeModal.classList.add('hidden');
        }

        function closeWelcomeModal(isGuestAction = false) {
            if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked && !isGuestAction) {
                try { localStorage.setItem('welcomeModalShown', 'true'); } catch (error) { console.error("Error localStorage:", error); }
            }
            welcomeModal.classList.add('hidden');
        }

        guestBtn?.addEventListener('click', () => {
            closeWelcomeModal(true);
            store.loadGuestData();
        });

        // --- CORREGIDO: "Crear Usuario" va a #perfil ---
        createUserBtn?.addEventListener('click', () => {
            closeWelcomeModal();
            localStorage.setItem('welcomeModalShown', 'true');
            sessionStorage.setItem('openProfileModal', 'true'); // Indicar a #perfil que abra el modal
            window.location.hash = '#perfil'; 
        });
    }

    /* --- Lógica Otros Modales (Acerca de, Reportar) y Sidebar --- */
    const aboutModal = document.getElementById('about-modal');
    const reportModal = document.getElementById('report-modal');

    function openModal(modal) { modal?.classList.remove('hidden'); }
    function closeModalOnClick(modal) { modal?.classList.add('hidden'); }

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalToClose = btn.closest('.modal-overlay');
            closeModalOnClick(modalToClose);
        });
    });

    const reportForm = document.getElementById('report-form');
    reportForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const textElement = document.getElementById('report-text');
        const text = textElement ? textElement.value : '';
        window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte MedicalHome&body=${encodeURIComponent(text)}`;
        closeModalOnClick(reportModal);
        reportForm.reset();
    });

    const collapseBtn = document.querySelector('.collapse-btn');
    collapseBtn?.addEventListener('click', () => {
        appShell?.classList.toggle('collapsed');
        const isCollapsed = appShell?.classList.contains('collapsed');
        collapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
    });

    /* --- Lógica Menú Móvil --- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuModal = document.getElementById('mobile-menu-modal');
    if (mobileMenuBtn && mobileMenuModal) {
        const mobileMenuContent = mobileMenuModal.querySelector('.mobile-menu-content');
        const desktopNav = document.querySelector('.sidebar-nav > .nav-links');
        const desktopFooter = document.querySelector('.sidebar-nav > .sidebar-footer');
        let isMobileMenuCloned = false;

        mobileMenuBtn.addEventListener('click', () => {
            if (!isMobileMenuCloned && mobileMenuContent && desktopNav && desktopFooter) {
                try {
                    const clonedNav = desktopNav.cloneNode(true);
                    const clonedFooter = desktopFooter.cloneNode(true);
                    mobileMenuContent.appendChild(clonedNav);
                    mobileMenuContent.appendChild(clonedFooter);

                    const mobileThemeToggle = clonedFooter.querySelector('#theme-toggle-desktop');
                    if (mobileThemeToggle) {
                        mobileThemeToggle.id = 'theme-toggle-mobile';
                        const label = clonedFooter.querySelector('label[for="theme-toggle-desktop"]');
                        if (label) label.htmlFor = 'theme-toggle-mobile';
                        mobileThemeToggle.checked = document.getElementById('theme-toggle-desktop').checked;
                        mobileThemeToggle.addEventListener('change', toggleTheme);
                    }
                    const mobileLogoutBtn = clonedFooter.querySelector('.logout-btn');
                    mobileLogoutBtn?.addEventListener('click', (e) => {
                         e.preventDefault();
                         handleLogout();
                         closeModalOnClick(mobileMenuModal);
                    });
                    isMobileMenuCloned = true;
                } catch (error) { console.error("Error clonando menú móvil:", error); }
            }
            mobileMenuModal.classList.toggle('hidden');
        });

        mobileMenuModal.addEventListener('click', (e) => { if (e.target === mobileMenuModal) closeModalOnClick(mobileMenuModal); });

        mobileMenuContent?.addEventListener('click', (e) => {
            if (e.target.closest('a.nav-link') && !e.target.closest('.accordion-toggle')) {
                 closeModalOnClick(mobileMenuModal);
            }
             const accordionToggle = e.target.closest('.accordion-toggle');
             if (accordionToggle) {
                 e.preventDefault();
                 accordionToggle.closest('.nav-item-accordion')?.classList.toggle('open');
             }
        });
    }

    /* --- Lógica Cambio de Tema --- */
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            if(themeToggleDesktop) themeToggleDesktop.checked = true;
            const mobileToggle = document.getElementById('theme-toggle-mobile');
            if(mobileToggle) mobileToggle.checked = true;
        } else {
            body.classList.remove('dark-theme');
            if(themeToggleDesktop) themeToggleDesktop.checked = false;
            const mobileToggle = document.getElementById('theme-toggle-mobile');
            if(mobileToggle) mobileToggle.checked = false;
        }
    }
    function toggleTheme() {
        const isDark = body.classList.toggle('dark-theme');
        const newTheme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }
    const currentTheme = localStorage.getItem('theme');
    applyTheme(currentTheme || 'light');
    themeToggleDesktop?.addEventListener('change', toggleTheme);

     /* --- Lógica Logout --- */
     function handleLogout() {
         if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
              // No borramos localStorage, solo cerramos sesión
              sessionStorage.clear();
              import('./firebase-config.js').then(async (firebase) => {
                  try {
                      await firebase.auth.signOut();
                      console.log("Sesión de Firebase cerrada.");
                  } catch (e) {
                      console.error("Error cerrando sesión de Firebase:", e);
                  } finally {
                      window.location.hash = '#login';
                      window.location.reload();
                  }
              });
         }
     }
     document.querySelectorAll('.logout-btn').forEach(btn => {
         btn.addEventListener('click', (e) => {
              e.preventDefault();
              handleLogout();
         });
     });

    /* --- Delegación de Eventos en Body --- */
    document.body.addEventListener('click', async (e) => {
        const aboutBtn = e.target.closest('#about-btn');
        const reportBtn = e.target.closest('#report-btn');
        if (aboutBtn) { e.preventDefault(); openModal(aboutModal); }
        if (reportBtn) { e.preventDefault(); openModal(reportModal); }

        const accordionToggle = e.target.closest('.sidebar-nav .accordion-toggle');
        if (accordionToggle) {
            e.preventDefault();
            accordionToggle.closest('.nav-item-accordion')?.classList.toggle('open');
        }

        const shareLink = e.target.closest('a[href="#share"]');
        if (shareLink) {
            e.preventDefault();
            const shareTitle = 'MedicalHome';
            const shareText = '¡Descubre MedicalHome, tu asistente de salud personal!';
            const shareUrl = window.location.origin + window.location.pathname;
            if (navigator.share) {
                try {
                    await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
                } catch (err) {
                    if (err.name !== 'AbortError') console.error('Error al compartir:', err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('¡Enlace de la app copiado al portapapeles!');
                } catch (err) {
                    console.error('No se pudo copiar el enlace:', err);
                    alert('No se pudo copiar el enlace.');
                }
            }
        }

        const guestWarningCreateBtn = e.target.closest('#guest-warning-create-btn');
        if (guestWarningCreateBtn) {
            console.log("Cambiando de Invitado a Crear Usuario...");
            hideGuestWarningModal();
            window.location.hash = '#perfil'; // Redirigir a la página de perfil
        }
    });

    /* --- Actualizar Sidebar con Datos del Perfil --- */
    try {
        const profile = store.getProfile();
        if (profile) {
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            const sidebarUsername = document.getElementById('sidebar-username');
            if (sidebarAvatar) sidebarAvatar.src = profile.avatar || 'images/avatar.png';
            if (sidebarUsername) sidebarUsername.textContent = `Hola, ${profile.fullName ? profile.fullName.split(' ')[0] : 'Usuario'}`;
        } else {
             const sidebarUsername = document.getElementById('sidebar-username');
             if (sidebarUsername) sidebarUsername.textContent = 'Hola, Invitado';
        }
    } catch (e) {
        console.error("Error al actualizar sidebar:", e);
    }

    // --- Carga Inicial ---
    await handleNavigation();

    // --- Ocultar Splash Screen ---
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 500);
    }
});