/* --- js/main.js --- */
import { store } from './store.js';

document.addEventListener('DOMContentLoaded', async () => { // Convertido a async
    /* ... (Código inicial sin cambios: lucide, body, appShell, appContent) ... */
    if (window.lucide) { try { lucide.createIcons(); } catch(e){} }
    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    const appContent = document.getElementById('app-content');
    
    // --- INICIO: Corrección Splash Screen ---
    // Obtener referencia al splash screen
    const splashScreen = document.getElementById('splash-screen');
    // --- FIN: Corrección Splash Screen ---

    if (!body || !appShell || !appContent) { console.error("Elementos base faltan!"); return; }
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
                 // --- INICIO: Corrección Carga Resumen Dashboard ---
                 // Añadimos un cache-buster a los templates HTML
                 const response = await fetch(`${route.template}?v=${Date.now()}`);
                 // --- FIN: Corrección Carga Resumen Dashboard ---
                 if (!response.ok) throw new Error(`Plantilla no encontrada: ${route.template}`);
                 content = await response.text();
                 appContent.innerHTML = content; // Inyectar HTML

                 if (route.script) {
                     try {
                         const modulePath = route.script; 
                         // Añadimos cache-buster a los scripts también
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
    // --- ARREGLO: Mover Lógica de Modales a delegación de eventos ---
    const aboutModal = document.getElementById('about-modal'); 
    const reportModal = document.getElementById('report-modal'); 
    
    function openModal(modal) { modal?.classList.remove('hidden'); } 
    function closeModalOnClick(modal) { modal?.classList.add('hidden'); } 
    
    // Quitar listeners antiguos
    // const aboutBtn = document.getElementById('about-btn'); 
    // const reportBtn = document.getElementById('report-btn'); 
    // aboutBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(aboutModal); }); 
    // reportBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(reportModal); }); 
    
    document.querySelectorAll('.close-modal-btn').forEach(btn => { btn.addEventListener('click', () => { const modalToClose = btn.closest('.modal-overlay'); closeModalOnClick(modalToClose); }); }); 
    const reportForm = document.getElementById('report-form'); reportForm?.addEventListener('submit', (e) => { e.preventDefault(); const textElement = document.getElementById('report-text'); const text = textElement ? textElement.value : ''; window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte MedicalHome&body=${encodeURIComponent(text)}`; closeModalOnClick(reportModal); });
    const collapseBtn = document.querySelector('.collapse-btn'); if (collapseBtn) { collapseBtn.addEventListener('click', () => { appShell?.classList.toggle('collapsed'); const isCollapsed = appShell?.classList.contains('collapsed'); collapseBtn.setAttribute('aria-expanded', !isCollapsed); }); }
    
    // Quitar listener de accordion antiguo
    // document.body.addEventListener('click', (e) => { const accordionToggle = e.target.closest('.accordion-toggle'); if (accordionToggle) { e.preventDefault(); const parentItem = accordionToggle.closest('.nav-item-accordion'); parentItem?.classList.toggle('open'); } });
    
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
                    
                    // --- ARREGLO: Clonar también el Footer ---
                    const desktopFooter = document.querySelector('.sidebar-nav > .sidebar-footer');
                    if (desktopFooter) {
                        const clonedFooter = desktopFooter.cloneNode(true);
                        mobileMenuContent.appendChild(clonedFooter);
                        
                        // --- ARREGLO: Re-enganchar listener del theme toggle clonado ---
                        const mobileToggle = clonedFooter.querySelector('#theme-toggle-desktop');
                        if (mobileToggle) {
                            mobileToggle.id = 'theme-toggle-mobile'; // Darle un nuevo ID
                            mobileToggle.addEventListener('change', () => {
                                body.classList.toggle('dark-theme');
                                localStorage.setItem('theme', mobileToggle.checked ? 'dark' : 'light');
                            });
                        }
                    }
                    // --- FIN ARREGLO ---
                    
                    isMenuCloned = true; 
                } catch (error) { console.error("Error clonando menú:", error); } 
            } 
            mobileMenuModal.classList.toggle('hidden'); 
        }); 
        
        mobileMenuModal.addEventListener('click', (e) => { if (e.target === mobileMenuModal) mobileMenuModal.classList.add('hidden'); }); 
        
        if (mobileMenuContent) { 
            mobileMenuContent.addEventListener('click', (e) => { 
                // --- ARREGLO: No cerrar el modal si se hace click en un accordion ---
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
    
    // Quitar listener de share antiguo
    // document.querySelectorAll('a[href="#share"]').forEach(shareLink => { ... });

    // --- ARREGLO: Listener de BODY para delegación de eventos ---
    // Esto maneja clicks en botones de PC y Móvil (clonados)
    document.body.addEventListener('click', async (e) => {
        // 1. Lógica de Modales
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
        
        // 2. Lógica de Accordion
        const accordionToggle = e.target.closest('.accordion-toggle');
        if (accordionToggle) {
            e.preventDefault();
            const parentItem = accordionToggle.closest('.nav-item-accordion');
            parentItem?.classList.toggle('open');
        }

        // --- INICIO: Lógica de Compartir Mejorada ---
        const shareLink = e.target.closest('a[href="#share"]');
        if (shareLink) {
            e.preventDefault();
            
            const shareTitle = 'MedicalHome';
            const shareText = '¡Descubre MedicalHome, tu asistente de salud personal!';
            // Usamos window.location.origin para obtener la URL base (ej: https://app.medicalhome.com)
            // Y nos aseguramos de que no tenga un hash (#) al final
            const shareUrl = window.location.origin + window.location.pathname;


            if (navigator.share) {
                let imageFile = null;
                try {
                    // 1. Intentar cargar la imagen (Cambiado a la URL absoluta de GitHub)
                    const response = await fetch('https://github.com/Medical-Home-co/medicalhome/blob/main/images/social-preview.png?raw=true');
                    if (response.ok) {
                        const blob = await response.blob();
                        imageFile = new File([blob], 'social-preview.png', { type: 'image/png' });
                    } else {
                        throw new Error('Image fetch failed');
                    }
                } catch (fetchErr) {
                    console.warn("No se pudo cargar la imagen social-preview.png:", fetchErr);
                    imageFile = null;
                }

                try {
                    const shareData = {
                        title: shareTitle,
                        text: shareText,
                        url: shareUrl,
                    };

                    if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                        // 2. Intentar compartir con imagen
                        shareData.files = [imageFile];
                        await navigator.share(shareData);
                    } else {
                        // 3. Compartir solo texto (fallback si no se puede compartir archivos o falló la carga)
                        await navigator.share({
                            title: shareTitle,
                            text: shareText,
                            url: shareUrl
                        });
                    }
                } catch (err) {
                    // Ignorar errores AbortError (el usuario canceló)
                    if (err.name !== 'AbortError') {
                        console.error('Error al usar navigator.share:', err);
                    }
                }

            } else {
                // 4. Fallback para navegadores sin API de Share (ej. PC)
                try { 
                    await navigator.clipboard.writeText(shareUrl);
                    // NO USAR ALERT.
                    console.log('¡Enlace copiado al portapapeles!');
                } catch (err) { 
                    console.error('No se pudo copiar el enlace.'); 
                }
            }
        }
        // --- FIN: Lógica de Compartir Mejorada ---
    });
    // --- FIN ARREGLO ---

    
    // --- SOLUCIÓN: Actualizar Sidebar al Cargar ---
    try {
        const profile = store.getProfile();
        if (profile) {
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            const sidebarUsername = document.getElementById('sidebar-username');
            if (sidebarAvatar) {
                sidebarAvatar.src = profile.avatar || 'images/avatar.png';
            }
            if (sidebarUsername) {
                // Limitar el nombre si es muy largo (opcional, pero buena idea)
                const name = profile.fullName ? profile.fullName.split(' ')[0] : 'Invitado';
                sidebarUsername.textContent = `Hola, ${name}`;
            }
        }
    } catch (e) {
        console.error("Error al actualizar sidebar en main.js:", e);
    }
    // --- FIN SOLUCIÓN ---

    await handleNavigation(); // Carga inicial

    // --- INICIO: Corrección Splash Screen ---
    // Ocultar el splash DESPUÉS de que la navegación inicial se complete
    if (splashScreen) {
        // Damos un tiempo extra para que la animación de la barra se vea
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 500); // 500ms de retraso
    }
    // --- FIN: Corrección Splash Screen ---
});

