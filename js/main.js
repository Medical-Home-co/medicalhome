// --- js/main.js ---
import { store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
    // ... (Código inicial sin cambios: lucide, body, appShell, appContent) ...
    if (window.lucide) { try { lucide.createIcons(); } catch(e){} }
    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    const appContent = document.getElementById('app-content');
    if (!body || !appShell || !appContent) { console.error("Elementos base faltan!"); return; }
    body.classList.remove('hidden');

    // --- (createDynamicDashboard ahora leerá los datos de invitado) ---
    function createDynamicDashboard() { /* ... código idéntico ... */
        const summary = store.getSummaryData(); // Leerá profile, meds, citas (incluidos los de invitado)
        let content = `<header class="content-header"><a href="#0" class="content-logo"><img src="images/logo.png" alt="Logo"><span>MedicalHome</span></a></header><div class="content-grid-dashboard">`;
        // Tarjeta Perfil (mostrará "Usuario Invitado")
        content += `<a href="#perfil" class="summary-card-full ${!summary.hasProfile ? 'card-highlight' : ''}"><div class="card-icon"><img src="images/icons/user.svg" class="nav-icon-img" alt=""></div><div class="card-content"><h3 class="card-title">${summary.hasProfile ? `Hola, ${summary.profileName}` : '¡Crea tu Perfil!'}</h3><p class="card-subtitle">${summary.hasProfile ? 'Revisa tu perfil y datos' : 'Empieza a gestionar tu salud'}</p></div><img src="images/icons/chevron-right.svg" class="card-arrow nav-icon-img" alt=""></a>`;
        // Tarjeta Medicamentos (mostrará datos de invitado)
        const meds = store.getMeds();
        content += `<a href="#medicamentos" class="summary-card-full"><div class="card-icon"><img src="images/icons/pill.svg" class="nav-icon-img" alt=""></div><div class="card-content"><h3 class="card-title">Medicamentos</h3>${meds.length > 0 ? `<div class="card-data-list">${meds.slice(0, 2).map(med => `<p class="card-data">${med.name || 'Medicamento'} / ${med.dose || '?'} ${med.notify ? '<span class="status-dot-active" title="Recordatorio activo"></span>' : ''}</p>`).join('')} ${meds.length > 2 ? `<p class="card-subtitle">+ ${meds.length - 2} más...</p>` : ''}</div>` : `<p class="card-subtitle">No hay medicamentos</p>`}</div><img src="images/icons/chevron-right.svg" class="card-arrow nav-icon-img" alt=""></a>`;
        // Tarjeta Citas (mostrará datos de invitado)
        content += `<a href="#citas" class="summary-card-full"><div class="card-icon"><img src="images/icons/calendar-days.svg" class="nav-icon-img" alt=""></div><div class="card-content"><h3 class="card-title">Próximas Citas</h3><p class="card-subtitle">${summary.hasCitas ? `Tienes ${summary.citasCount} citas agendadas.` : 'Agenda tu próxima cita'}</p></div><img src="images/icons/chevron-right.svg" class="card-arrow nav-icon-img" alt=""></a>`;
        // --- AÑADIR TARJETAS PARA LAS OTRAS SECCIONES ---
        // Ejemplo Tarjeta Terapias
        const terapias = store.getTerapias(); // Cargar datos
        content += `<a href="#terapias" class="summary-card-full"><div class="card-icon"><img src="images/icons/heart-pulse.svg" class="nav-icon-img" alt=""></div><div class="card-content"><h3 class="card-title">Terapias</h3><p class="card-subtitle">${terapias.length > 0 ? `${terapias.length} sesión(es) programada(s)` : 'No hay terapias'}</p></div><img src="images/icons/chevron-right.svg" class="card-arrow nav-icon-img" alt=""></a>`;
         // Ejemplo Tarjeta BCM
         const bcmData = store.getBcmData();
         content += `<a href="#renal" class="summary-card-full"><div class="card-icon"><img src="images/icons/bean.svg" class="nav-icon-img" alt=""></div><div class="card-content"><h3 class="card-title">BCM (Renal)</h3><p class="card-subtitle">${bcmData.currentWeight ? `Peso actual: ${bcmData.currentWeight} kg` : 'Registra tu peso'}</p></div><img src="images/icons/chevron-right.svg" class="card-arrow nav-icon-img" alt=""></a>`;
         // Ejemplo Tarjeta Ocular
         const ocularData = store.getOcularData();
         content += `<a href="#ocular" class="summary-card-full"><div class="card-icon"><img src="images/icons/eye.svg" class="nav-icon-img" alt=""></div><div class="card-content"><h3 class="card-title">Ocular</h3><p class="card-subtitle">${ocularData.length > 0 ? `${ocularData.length} evaluación(es)` : 'Registra evaluación'}</p></div><img src="images/icons/chevron-right.svg" class="card-arrow nav-icon-img" alt=""></a>`;
        // ... Añade tarjetas similares para Artritis, Diabetes, Agenda, etc. ...
        content += '</div>'; // Cierre content-grid-dashboard
        return content;
    }


    // --- (loadPage y handleNavigation sin cambios) ---
    async function loadPage(page) { /* ... código idéntico ... */



        const routes = { 'perfil': { template: 'templates/perfil.html', script: './pages/perfil.js' }, 'medicamentos': { template: 'templates/medicamentos.html', script: 'pages/medicamentos.js' }, 'citas': { template: 'templates/citas.html', script: 'pages/citas.js' }, 'terapias': { template: 'templates/terapias.html', script: 'pages/terapias.js' }, 'renal': { template: 'templates/renal.html', script: 'pages/renal.js' }, 'ocular': { template: 'templates/ocular.html', script: 'pages/ocular.js' }, 'cardiaco': { template: 'templates/cardiaco.html', script: 'pages/cardiaco.js' }, 'diabetes': { template: 'templates/diabetes.html', script: 'pages/diabetes.js' }, 'artritis': { template: 'templates/artritis.html', script: 'pages/artritis.js' }, 'tea': { template: 'templates/tea.html', script: 'pages/tea.js' }, 'respiratorio': { template: 'templates/respiratorio.html', script: 'pages/respiratorio.js' }, 'gastrico': { template: 'templates/gastrico.html', script: 'pages/gastrico.js' }, 'general': { template: 'templates/general.html', script: 'pages/general.js' }, 'agenda': { template: 'templates/agenda.html', script: 'pages/agenda.js' }, 'asistente-ia': { template: 'templates/asistente.html', script: 'pages/asistente.js' }, 'bienestar': { template: 'templates/bienestar.html', script: 'pages/bienestar.js' }, 'notificaciones':{ template: 'templates/notificaciones.html', script: 'pages/notificaciones.js' } };
        let content = ''; const route = routes[page]; appContent.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-secondary);">Cargando...</p>';
         if (page === 'dashboard') { content = createDynamicDashboard(); appContent.innerHTML = content; }
         else if (route) { try { const response = await fetch(route.template); if (!response.ok) throw new Error(`Plantilla no encontrada: ${route.template}`); content = await response.text(); appContent.innerHTML = content; if (route.script) { try { const modulePath = `./${route.script}`; const pageModule = await import(modulePath + `?v=${Date.now()}`); if (pageModule.init && typeof pageModule.init === 'function') { pageModule.init(); } else { console.warn(`Script ${modulePath} no tiene función 'init'.`); } } catch(importError) { console.error(`Error import/exec script ${page} (${route.script}):`, importError); appContent.innerHTML += `<div style="padding:1rem; color:var(--danger-color); border:1px solid var(--danger-color); margin-top:1rem; border-radius:8px;"><strong>Error script:</strong> ${importError.message}.<br>Ruta: ${route.script}. Consola detalla.</div>`; } } } catch (error) { console.error(`Error cargar plantilla ${page}:`, error); appContent.innerHTML = `<div class="page-container"><h1 class="page-title">${page.charAt(0).toUpperCase() + page.slice(1)}</h1><p style="color:var(--danger-color);">Error plantilla: ${error.message}. Consola detalla.</p></div>`; } }
         else { const pageTitle = page.charAt(0).toUpperCase() + page.slice(1); appContent.innerHTML = `<div class="page-container"><h1 class="page-title">Página ${pageTitle}</h1><p>Sección no definida.</p></div>`; }
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => { link.classList.remove('active'); if (link.getAttribute('href') === `#${page}`) { link.classList.add('active'); } });
        if (window.lucide) { setTimeout(() => { try { lucide.createIcons(); } catch(e){} }, 0); }
    }
    async function handleNavigation() { const hash = window.location.hash.substring(1) || 'dashboard'; await loadPage(hash); }
    window.addEventListener('hashchange', handleNavigation);

    // --- Lógica Modales (Bienvenida, About, Reportar) ---
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
        const guestBtn = document.getElementById('guest-btn');
        const createUserBtn = document.getElementById('create-user-btn');
        const dontShowAgainCheckbox = document.getElementById('dont-show-again');
        const welcomeModalShown = localStorage.getItem('welcomeModalShown');
        if (!welcomeModalShown) {
            welcomeModal.classList.remove('hidden');
        }

        function closeModal() {
            if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
                try { localStorage.setItem('welcomeModalShown', 'true'); } catch (error) { console.error("Error localStorage:", error); }
            }
            welcomeModal.classList.add('hidden');
        }

        /* === INICIO SOLUCIÓN: Modificar botón Invitado === */
        guestBtn?.addEventListener('click', () => {
            closeModal(); // Cierra el modal
            store.loadGuestData(); // Carga los datos de ejemplo en localStorage
            window.location.hash = '#dashboard'; // Navega al dashboard
            handleNavigation(); // Forzar recarga del dashboard con nuevos datos
        });
        /* === FIN SOLUCIÓN === */

        createUserBtn?.addEventListener('click', () => {
            closeModal();
            // Limpiar datos de invitado si existieran
            localStorage.clear(); // O borrar claves específicas si prefieres
            sessionStorage.setItem('openProfileModal', 'true');
            window.location.hash = '#perfil';
            handleNavigation(); // Cargar página perfil
        });
    } else {
        console.warn("#welcome-modal no encontrado");
    }
    // ... (Resto de listeners sin cambios: About, Reportar, Menús, Tema, Compartir) ...
    const aboutBtn = document.getElementById('about-btn'); const reportBtn = document.getElementById('report-btn'); const aboutModal = document.getElementById('about-modal'); const reportModal = document.getElementById('report-modal'); function openModal(modal) { modal?.classList.remove('hidden'); } function closeModalOnClick(modal) { modal?.classList.add('hidden'); } aboutBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(aboutModal); }); reportBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(reportModal); }); document.querySelectorAll('.close-modal-btn').forEach(btn => { btn.addEventListener('click', () => { const modalToClose = btn.closest('.modal-overlay'); closeModalOnClick(modalToClose); }); }); const reportForm = document.getElementById('report-form'); reportForm?.addEventListener('submit', (e) => { e.preventDefault(); const textElement = document.getElementById('report-text'); const text = textElement ? textElement.value : ''; window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte MedicalHome&body=${encodeURIComponent(text)}`; closeModalOnClick(reportModal); });
    const collapseBtn = document.querySelector('.collapse-btn'); if (collapseBtn) { collapseBtn.addEventListener('click', () => { appShell?.classList.toggle('collapsed'); const isCollapsed = appShell?.classList.contains('collapsed'); collapseBtn.setAttribute('aria-expanded', !isCollapsed); }); }
    document.body.addEventListener('click', (e) => { const accordionToggle = e.target.closest('.accordion-toggle'); if (accordionToggle) { e.preventDefault(); const parentItem = accordionToggle.closest('.nav-item-accordion'); parentItem?.classList.toggle('open'); } });
    const mobileMenuBtn = document.getElementById('mobile-menu-btn'); const mobileMenuModal = document.getElementById('mobile-menu-modal'); if (mobileMenuBtn && mobileMenuModal) { const mobileMenuContent = document.querySelector('.mobile-menu-content'); const desktopNav = document.querySelector('.sidebar-nav > .nav-links'); let isMenuCloned = false; mobileMenuBtn.addEventListener('click', () => { if (!isMenuCloned && mobileMenuContent && desktopNav) { try { const clonedNav = desktopNav.cloneNode(true); mobileMenuContent.appendChild(clonedNav); isMenuCloned = true; } catch (error) { console.error("Error clonando menú:", error); } } mobileMenuModal.classList.toggle('hidden'); }); mobileMenuModal.addEventListener('click', (e) => { if (e.target === mobileMenuModal) mobileMenuModal.classList.add('hidden'); }); if (mobileMenuContent) { mobileMenuContent.addEventListener('click', (e) => { if (e.target.closest('a')) mobileMenuModal.classList.add('hidden'); }); } }
    const themeToggle = document.getElementById('theme-toggle-desktop'); if (themeToggle) { const currentTheme = localStorage.getItem('theme'); if (currentTheme === 'dark') { body.classList.add('dark-theme'); themeToggle.checked = true; } themeToggle.addEventListener('change', () => { body.classList.toggle('dark-theme'); localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light'); }); }
    document.querySelectorAll('a[href="#share"]').forEach(shareLink => { shareLink.addEventListener('click', async (e) => { e.preventDefault(); const shareData = { title: 'MedicalHome', text: '¡Descubre MedicalHome!', url: window.location.origin }; if (navigator.share) { try { await navigator.share(shareData); } catch (err) { console.error('Error share:', err); } } else { try { await navigator.clipboard.writeText(shareData.url); alert('¡Enlace copiado!'); } catch (err) { alert('No se pudo compartir.'); } } }); });


    // Carga inicial (ya se llama handleNavigation)
    // handleNavigation(); <<-- No es necesario llamarla dos veces

}); // Fin DOMContentLoaded
