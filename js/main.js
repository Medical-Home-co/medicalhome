// --- js/main.js ---
import { store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    body.classList.remove('hidden');

    const appContent = document.getElementById('app-content');

    function createDynamicDashboard() {
        const summary = store.getSummaryData();
        let content = `
            <header class="content-header">
                <a href="#0" class="content-logo"><img src="images/logo.png" alt="Logo"><span>MedicalHome</span></a>
            </header>
            <div class="content-grid">`; // Consider using a more specific class like content-grid-dashboard if needed

        // Profile Card
        content += `
            <a href="#perfil" class="summary-card ${!summary.hasProfile ? 'card-highlight' : ''}">
                <h3 class="card-title">${summary.hasProfile ? `Hola, ${summary.profileName}` : '¡Crea tu Perfil!'}</h3>
                <p class="card-subtitle">${summary.hasProfile ? 'Revisa tu perfil y datos' : 'Empieza a gestionar tu salud'}</p>
            </a>`;

        // Meds Card
        content += `
            <a href="#medicamentos" class="summary-card">
                <h3 class="card-title">Medicamentos</h3>
                <p class="card-subtitle">${summary.hasMeds ? `Tienes ${summary.medsCount} medicamentos registrados.` : 'Añade tus medicamentos'}</p>
            </a>`;

        // Citas Card
        content += `
            <a href="#citas" class="summary-card">
                <h3 class="card-title">Próximas Citas</h3>
                <p class="card-subtitle">${summary.hasCitas ? `Tienes ${summary.citasCount} citas agendadas.` : 'Agenda tu próxima cita'}</p>
            </a>`;

        // Add more cards here following the pattern...

        content += '</div>';
        return content;
    }


    async function loadPage(page) {
        const routes = {
            'perfil':       { template: 'templates/perfil.html', script: './perfil.js' },
            'medicamentos': { template: 'templates/medicamentos.html', script: './pages/medicamentos.js' },
            'citas':        { template: 'templates/citas.html', script: './pages/citas.js' },
            'terapias':     { template: 'templates/terapias.html', script: './pages/terapias.js' },
            'renal':        { template: 'templates/renal.html', script: './pages/renal.js' },
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

        let content = '';
        const route = routes[page];

         if (page === 'dashboard') {
            content = createDynamicDashboard();
            appContent.innerHTML = content;
            if (window.lucide) lucide.createIcons(); // Recreate icons for dashboard if any
        } else if (route) {
            try {
                const response = await fetch(route.template);
                if (!response.ok) throw new Error(`Plantilla no encontrada: ${route.template}`);
                content = await response.text();
                appContent.innerHTML = content;

                if (route.script) {
                    // Determinar la ruta correcta relativa a main.js
                    const modulePath = route.script.startsWith('./pages/')
                        ? route.script // Ya es relativa a js/pages/
                        : `./${route.script}`; // Asume que está en js/
                    const pageModule = await import(modulePath);
                    if (pageModule.init && typeof pageModule.init === 'function') {
                        pageModule.init();
                    }
                }
                 if (window.lucide) lucide.createIcons(); // Recreate icons after loading content

            } catch (error) {
                console.error(`Error al cargar la página ${page}:`, error);
                appContent.innerHTML = `<div class="page-container"><h1 class="page-title">${page.charAt(0).toUpperCase() + page.slice(1)}</h1><p>Error al cargar el contenido.</p></div>`;
            }
        } else {
            const pageTitle = page.charAt(0).toUpperCase() + page.slice(1);
            appContent.innerHTML = `<div class="page-container"><h1 class="page-title">Página de ${pageTitle}</h1><p>Esta sección no tiene una ruta definida o está en construcción.</p></div>`;
        }


        // Update active class on links
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${page}`) {
                link.classList.add('active');
            }
        });
    }

    async function handleNavigation() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        await loadPage(hash);
    }

    window.addEventListener('hashchange', handleNavigation);
    handleNavigation(); // Initial page load

    // --- Welcome Modal Logic ---
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
        const guestBtn = document.getElementById('guest-btn');
        const createUserBtn = document.getElementById('create-user-btn');
        const dontShowAgainCheckbox = document.getElementById('dont-show-again');

        const welcomeModalShown = localStorage.getItem('welcomeModalShown');
        // Mostrar solo si la clave NO existe en localStorage
        if (!welcomeModalShown) {
            welcomeModal.classList.remove('hidden');
        }

        function closeModal() {
            // Guardar en localStorage SOLO si el checkbox está marcado
            if (dontShowAgainCheckbox && dontShowAgainCheckbox.checked) {
                try {
                    localStorage.setItem('welcomeModalShown', 'true');
                } catch (error) {
                    console.error("Error al guardar en localStorage:", error);
                }
            }
            welcomeModal.classList.add('hidden'); // Siempre ocultar al cerrar
        }

        guestBtn?.addEventListener('click', closeModal); // Added optional chaining
        createUserBtn?.addEventListener('click', () => { // Added optional chaining
            closeModal();
            sessionStorage.setItem('openProfileModal', 'true');
            window.location.hash = '#perfil';
        });
    } else {
        console.warn("El modal de bienvenida (#welcome-modal) no se encontró en index.html");
    }

    // --- About & Report Modals Logic ---
    // (No changes needed here, assuming IDs exist in index.html)
    const aboutBtn = document.getElementById('about-btn');
    const reportBtn = document.getElementById('report-btn');
    const aboutModal = document.getElementById('about-modal');
    const reportModal = document.getElementById('report-modal');

    function openModal(modal) { modal?.classList.remove('hidden'); }
    function closeModalOnClick(modal) { modal?.classList.add('hidden'); }

    aboutBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(aboutModal); });
    reportBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(reportModal); });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Find the closest modal parent and close it, more robust
            const modalToClose = btn.closest('.modal-overlay');
            closeModalOnClick(modalToClose);
        });
    });

    const reportForm = document.getElementById('report-form');
    reportForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const textElement = document.getElementById('report-text');
        const text = textElement ? textElement.value : '';
        window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte de Fallo - MedicalHome&body=${encodeURIComponent(text)}`;
        closeModalOnClick(reportModal);
    });

    // --- Sidebar Collapse Logic ---
    const collapseBtn = document.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            appShell?.classList.toggle('collapsed'); // Optional chaining for safety
            const isCollapsed = appShell?.classList.contains('collapsed');
            collapseBtn.setAttribute('aria-expanded', !isCollapsed);
        });
    }

    // --- Accordion Logic ---
    document.body.addEventListener('click', (e) => {
        const accordionToggle = e.target.closest('.accordion-toggle');
        if (accordionToggle) {
            e.preventDefault();
            const parentItem = accordionToggle.closest('.nav-item-accordion');
            parentItem?.classList.toggle('open');
        }
    });

    // --- Mobile Navigation Logic ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuModal = document.getElementById('mobile-menu-modal');
    if (mobileMenuBtn && mobileMenuModal) {
        const mobileMenuContent = document.querySelector('.mobile-menu-content');
        const desktopNav = document.querySelector('.sidebar-nav > .nav-links');
        if (mobileMenuContent && desktopNav && mobileMenuContent.children.length === 0) {
             try {
                 const clonedNav = desktopNav.cloneNode(true);
                 mobileMenuContent.appendChild(clonedNav);
             } catch (error) { console.error("Error clonando menú:", error); }
        }
        mobileMenuBtn.addEventListener('click', () => mobileMenuModal.classList.toggle('hidden'));
        mobileMenuModal.addEventListener('click', (e) => { if (e.target === mobileMenuModal) mobileMenuModal.classList.add('hidden'); });
         if (mobileMenuContent) {
            mobileMenuContent.addEventListener('click', (e) => { if (e.target.closest('a')) mobileMenuModal.classList.add('hidden'); });
        }
    }

    // --- Theme Switch Logic ---
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

     // --- Share App Logic ---
    document.querySelectorAll('a[href="#share"]').forEach(shareLink => {
        shareLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const shareData = { title: 'MedicalHome', text: '¡Descubre MedicalHome!', url: window.location.origin };
            if (navigator.share) {
                try { await navigator.share(shareData); } catch (err) { console.error('Error al compartir:', err); }
            } else {
                try { await navigator.clipboard.writeText(shareData.url); alert('¡Enlace copiado!'); } catch (err) { alert('No se pudo compartir.'); }
            }
        });
    });

}); // End DOMContentLoaded