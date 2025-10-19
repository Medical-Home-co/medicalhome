document.addEventListener('DOMContentLoaded', () => {
    // Código inicial para configurar el body, app-shell, etc.
    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    body.classList.remove('hidden');

    // --- Lógica del Router (Versión Modular) ---
    const appContent = document.getElementById('app-content');

    async function loadPage(page) {
        // Mapa de rutas: Asocia cada 'hash' con su plantilla y script
        const routes = {
            'perfil': {
                template: 'templates/perfil.html',
                script: './perfil.js'
            },
            'medicamentos': {
                template: 'templates/medicamentos.html',
                script: './pages/medicamentos.js'
            },
            'citas': { // <-- RUTA NUEVA AÑADIDA
                template: 'templates/citas.html',
                script: './pages/citas.js'
            },
            // Aquí agregaremos las otras secciones en el futuro
	'terapias': {     template: 'templates/terapias.html',
    script: './pages/terapias.js'
}
        };

        const route = routes[page];
        let content = '';

        if (route) {
            // Si la página está en nuestro mapa, la cargamos
            try {
                const response = await fetch(route.template);
                if (!response.ok) throw new Error('Plantilla no encontrada');
                content = await response.text();
            } catch (error) {
                console.error(`Error al cargar la plantilla para ${page}:`, error);
                content = '<p>Error al cargar la sección.</p>';
            }
        } else if (page === 'dashboard') {
            // Mantenemos el dashboard simulado por ahora
            content = `
                <div class="page-header">
                    <div>
                        <h2 class="page-title">Resumen de Salud</h2>
                        <p class="page-subtitle">Una vista general de tu información más reciente.</p>
                    </div>
                </div>
                <div id="dashboard-grid" class="dashboard-grid">
                     <p>El dashboard dinámico se implementará aquí.</p>
                </div>
            `;
        } else {
            // Para cualquier otra página, mostramos "En construcción"
            const pageTitle = page.charAt(0).toUpperCase() + page.slice(1);
            content = `<h1 class="page-title">Página de ${pageTitle}</h1><p>En construcción...</p>`;
        }
        
        // 1. Inyectamos el HTML
        appContent.innerHTML = content;
        
        // 2. Si la ruta tiene un script, lo importamos y ejecutamos su función 'init'
        if (route && route.script) {
            try {
                const pageModule = await import(route.script);
                if (pageModule.init && typeof pageModule.init === 'function') {
                    pageModule.init();
                }
            } catch (error) {
                console.error(`Error al cargar o ejecutar el script para ${page}:`, error);
            }
        }
        
        // 3. Actualizamos el estado 'active' en los menús
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
    handleNavigation(); // Carga inicial

    // --- LÓGICA DE MODALES Y MENÚS (SIN CAMBIOS) ---

    // Modal de Bienvenida
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
            if (dontShowAgainCheckbox.checked) {
                localStorage.setItem('welcomeModalShown', 'true');
            }
            welcomeModal.classList.add('hidden');
        }

        guestBtn.addEventListener('click', closeModal);
        createUserBtn.addEventListener('click', () => {
            closeModal();
            window.location.hash = '#perfil';
        });
    }

    // Modales "Quiénes somos" y "Reportar"
    const aboutBtn = document.getElementById('about-btn');
    const reportBtn = document.getElementById('report-btn');
    const aboutModal = document.getElementById('about-modal');
    const reportModal = document.getElementById('report-modal');

    function openModal(modal) { if (modal) modal.classList.remove('hidden'); }
    function closeModalOnClick(modal) { if (modal) modal.classList.add('hidden'); }
    
    aboutBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(aboutModal); });
    reportBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(reportModal); });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModalOnClick(aboutModal);
            closeModalOnClick(reportModal);
        });
    });
    
    const reportForm = document.getElementById('report-form');
    if(reportForm) {
        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('report-text').value;
            window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte - MedicalHome&body=${encodeURIComponent(text)}`;
            closeModalOnClick(reportModal);
        });
    }

    // Menú Lateral (Escritorio)
    const collapseBtn = document.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            appShell.classList.toggle('collapsed');
            collapseBtn.setAttribute('aria-expanded', !appShell.classList.contains('collapsed'));
        });
    }
    
    // Acordeón del Menú
    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const parentItem = button.closest('.nav-item-accordion');
            parentItem.classList.toggle('open');
        });
    });

    // Menú Móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuModal = document.getElementById('mobile-menu-modal');
    
    if (mobileMenuBtn && mobileMenuModal) {
        const mobileMenuContent = document.querySelector('.mobile-menu-content');
        const desktopNav = document.querySelector('.sidebar-nav > .nav-links');

        if (mobileMenuContent && desktopNav && mobileMenuContent.children.length === 0) {
            const clonedNav = desktopNav.cloneNode(true);
            mobileMenuContent.appendChild(clonedNav);
        }

        mobileMenuBtn.addEventListener('click', () => mobileMenuModal.classList.toggle('hidden'));
        mobileMenuModal.addEventListener('click', (e) => {
            if (e.target === mobileMenuModal) mobileMenuModal.classList.add('hidden');
        });
        if (mobileMenuContent) {
            mobileMenuContent.addEventListener('click', (e) => {
                if(e.target.closest('a')) mobileMenuModal.classList.add('hidden');
            });
        }
    }

    // Switch de Tema
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
});
