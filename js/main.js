/* --- js/main.js --- */
import { store } from './store.js';

// Convertimos el listener principal en async para poder usar 'await'
document.addEventListener('DOMContentLoaded', async () => {
    /* ... (Código inicial sin cambios: lucide) ... */
    if (window.lucide) { try { lucide.createIcons(); } catch(e){} }
    
    // Referencias a elementos clave
    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    const appContent = document.getElementById('app-content');
    
    // ===== INICIO: Modificación Splash Screen =====
    // Obtenemos la referencia al splash screen
    const splashScreen = document.getElementById('splash-screen');
    // ===== FIN: Modificación Splash Screen =====

    if (!body || !appShell || !appContent) { console.error("Elementos base faltan!"); return; }
    
    // Esta línea es la original tuya, la dejamos.
    // Quita el .hidden del body, lo que muestra el splash (que está en z-index alto)
    // y la app (que está detrás del splash).
    body.classList.remove('hidden');

    /* --- Lógica del Router (BASADA EN TU ARCHIVO FUNCIONAL) --- */
    async function loadPage(page) {
        /* Asumiendo que 'pages' es una subcarpeta de 'js' */
        const routes = {
            'dashboard':    { template: 'templates/dashboard.html', script: './pages/dashboard.js' },
            'perfil':       { template: 'templates/perfil.html', script: './pages/perfil.js' },
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

        let content = ''; const route = routes[page]; appContent.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-secondary);">Cargando...</p>';
        
         if (route) {
             try {
                 const response = await fetch(route.template);
                 if (!response.ok) throw new Error(`Plantilla no encontrada: ${route.template}`);
                 content = await response.text();
                 appContent.innerHTML = content; // Inyectar HTML

                 if (route.script) {
                     try {
                         const modulePath = route.script; 
                         const pageModule = await import(modulePath + `?v=${Date.now()}`);
                         
                         setTimeout(() => {
                            if (pageModule.init && typeof pageModule.init === 'function') {
                                pageModule.init();
                            } else {
                                console.warn(`Script ${modulePath} no tiene función 'init'.`);
                            }
                         }, 0);

                    } catch(importError) {
                        console.error(`Error import/exec script ${page} (${route.script}):`, importError);
                        appContent.innerHTML += `<div style="padding:1rem;...">${importError.message}</div>`;
                    }
                 }
             } catch (error) {
                 console.error(`Error cargar plantilla ${page}:`, error);
                 appContent.innerHTML = `<div class="page-container"><h1 class="page-title">...</h1><p>Error plantilla...</p></div>`;
             }
         }
         else {
             const pageTitle = page.charAt(0).toUpperCase() + page.slice(1);
             appContent.innerHTML = `<div class="page-container"><h1 class="page-title">Página ${pageTitle}</h1><p>Sección no definida.</p></div>`;
         }
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === `#${page}`) { link.classList.add('active'); } });
        if (window.lucide) { setTimeout(() => { try { lucide.createIcons(); } catch(e){} }, 0); }
    }
    async function handleNavigation() { const hash = window.location.hash.substring(1) || 'dashboard'; await loadPage(hash); }
    window.addEventListener('hashchange', handleNavigation);

    /* --- Lógica Modales (Bienvenida, etc.) --- */
    /* ... (código modal bienvenida sin cambios) ... */
    const welcomeModal = document.getElementById('welcome-modal'); if (welcomeModal) { const guestBtn = document.getElementById('guest-btn'); const createUserBtn = document.getElementById('create-user-btn'); const dontShowAgainCheckbox = document.getElementById('dont-show-again'); const welcomeModalShown = localStorage.getItem('welcomeModalShown'); let hasUserData = false; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key !== 'theme' && key !== 'welcomeModalShown') { hasUserData = true; break; } } if (!welcomeModalShown && !hasUserData) { welcomeModal.classList.remove('hidden'); } else { welcomeModal.classList.add('hidden'); } function closeModal(isGuestAction = false) { if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked && !isGuestAction) { try { localStorage.setItem('welcomeModalShown', 'true'); } catch (error) { console.error("Error localStorage:", error); } } welcomeModal.classList.add('hidden'); } guestBtn?.addEventListener('click', () => { closeModal(true); store.loadGuestData(); window.location.hash = '#dashboard'; handleNavigation(); }); createUserBtn?.addEventListener('click', () => { closeModal(); const theme = localStorage.getItem('theme'); localStorage.clear(); if (theme) localStorage.setItem('theme', theme); localStorage.setItem('welcomeModalShown', 'true'); sessionStorage.setItem('openProfileModal', 'true'); window.location.hash = '#perfil'; handleNavigation(); }); } else { console.warn("#welcome-modal no encontrado"); }
    
    /* --- (Resto de listeners sin cambios) --- */
    /* ... (código idéntico al anterior) ... */
    const aboutModal = document.getElementById('about-modal'); 
    const reportModal = document.getElementById('report-modal'); 
    
    function openModal(modal) { modal?.classList.remove('hidden'); } 
    function closeModalOnClick(modal) { modal?.classList.add('hidden'); } 
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => { btn.addEventListener('click', () => { const modalToClose = btn.closest('.modal-overlay'); closeModalOnClick(modalToClose); }); }); 
    const reportForm = document.getElementById('report-form'); reportForm?.addEventListener('submit', (e) => { e.preventDefault(); const textElement = document.getElementById('report-text'); const text = textElement ? textElement.value : ''; window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte MedicalHome&body=${encodeURIComponent(text)}`; closeModalOnClick(reportModal); });
    const collapseBtn = document.querySelector('.collapse-btn'); if (collapseBtn) { collapseBtn.addEventListener('click', () => { appShell?.classList.toggle('collapsed'); const isCollapsed = appShell?.classList.contains('collapsed'); collapseBtn.setAttribute('aria-expanded', !isCollapsed); }); }
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn'); 
    const mobileMenuModal = document.getElementById('mobile-menu-modal'); 
    
    if (mobileMenuBtn && mobileMenuModal) { 
        const mobileMenuContent = document.querySelector('.mobile-menu-content'); 
        const desktopNav = document.querySelector('.sidebar-nav > .nav-links'); 
        let isMenuCloned = false; 
        
        mobileMenuBtn.addEventListener('click', () => { 
            if (!isMenuCloned && mobileMenuContent && desktopNav) { 
                try { 
                    const clonedNav = desktopNav.cloneNode(true); 
                    mobileMenuContent.appendChild(clonedNav); 
                    
                    const desktopFooter = document.querySelector('.sidebar-nav > .sidebar-footer');
                    if (desktopFooter) {
                        const clonedFooter = desktopFooter.cloneNode(true);
                        mobileMenuContent.appendChild(clonedFooter); 
                        
                        const mobileToggle = clonedFooter.querySelector('#theme-toggle-desktop');
                        if (mobileToggle) {
                            mobileToggle.id = 'theme-toggle-mobile'; 
                            mobileToggle.addEventListener('change', () => {
                                body.classList.toggle('dark-theme');
                                localStorage.setItem('theme', mobileToggle.checked ? 'dark' : 'light');
                            });
                        }
                    }
                    
                    isMenuCloned = true; 
                } catch (error) { console.error("Error clonando menú:", error); } 
            } 
            mobileMenuModal.classList.toggle('hidden'); 
        }); 
        
        mobileMenuModal.addEventListener('click', (e) => { if (e.target === mobileMenuModal) mobileMenuModal.classList.add('hidden'); }); 
        
        if (mobileMenuContent) { 
            mobileMenuContent.addEventListener('click', (e) => { 
                if (e.target.closest('a') && !e.target.closest('.accordion-toggle')) {
                    mobileMenuModal.classList.add('hidden'); 
                }
            }); 
        } 
    }
    
    const themeToggle = document.getElementById('theme-toggle-desktop'); 
    if (themeToggle) { 
        const currentTheme = localStorage.getItem('theme'); 
        if (currentTheme === 'dark') { 
            body.classList.add('dark-theme'); 
            themeToggle.checked = true; 
        } 
        themeToggle.addEventListener('change', () => { 
            body.classList.toggle('dark-theme'); 
            localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light'); 
        }); 
    }
    
    document.body.addEventListener('click', async (e) => {
        const aboutBtn = e.target.closest('#about-btn');
        const reportBtn = e.target.closest('#report-btn');

        if (aboutBtn) {
            e.preventDefault();
            openModal(aboutModal);
        }
        
        if (reportBtn) {
            e.preventDefault();
            openModal(reportModal);
        }
        
        const accordionToggle = e.target.closest('.accordion-toggle');
        if (accordionToggle) {
            e.preventDefault();
            const parentItem = accordionToggle.closest('.nav-item-accordion');
            parentItem?.classList.toggle('open');
        }

        const shareLink = e.target.closest('a[href="#share"]');
        if (shareLink) {
            e.preventDefault();
            const shareData = { title: 'MedicalHome', text: '¡Descubre MedicalHome!', url: window.location.origin };
            if (navigator.share) {
                try { await navigator.share(shareData); } 
                catch (err) { console.error('Error share:', err); }
            } else {
                try { 
                    await navigator.clipboard.writeText(shareData.url); 
                    console.log('¡Enlace copiado!'); 
                } catch (err) { 
                    console.error('No se pudo compartir.'); 
                }
            }
        }
    });

    
    try {
        const profile = store.getProfile();
        if (profile) {
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            const sidebarUsername = document.getElementById('sidebar-username');
            if (sidebarAvatar) {
                sidebarAvatar.src = profile.avatar || 'images/avatar.png';
            }
            if (sidebarUsername) {
                const name = profile.fullName ? profile.fullName.split(' ')[0] : 'Invitado';
                sidebarUsername.textContent = `Hola, ${name}`;
            }
        }
    } catch (e) {
        console.error("Error al actualizar sidebar en main.js:", e);
    }


    // ===== INICIO: Modificación Splash Screen =====
    // Reemplazamos la llamada original 'handleNavigation();' por esta lógica.
    try {
        // 1. Esperamos a que la navegación inicial (cargar dashboard) termine.
        await handleNavigation(); 
    } catch (e) {
        console.error("Error en la carga inicial:", e);
        // Ocultamos el splash igualmente para no bloquear al usuario.
    } finally {
        // 2. Una vez cargado, ocultamos el splash.
        // Damos un breve retraso para que la animación de la barra sea visible.
        setTimeout(() => {
            if (splashScreen) {
                splashScreen.classList.add('hidden');
                // Opcional: Eliminar el splash del DOM después de la transición
                splashScreen.addEventListener('transitionend', () => {
                    try {
                        splashScreen.remove();
                    } catch(e) {
                        // El elemento podría no existir, ignorar error.
                    }
                }, { once: true });
            }
        }, 1000); // 1 segundo de retraso. Ajusta este valor si quieres.
    }
    // ===== FIN: Modificación Splash Screen =====

});

