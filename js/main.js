document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) {
        lucide.createIcons();
    }

    const body = document.body;
    const appShell = document.querySelector('.app-shell');
    body.classList.remove('hidden');

    // --- Lógica del Router (Simulado) ---
    const appContent = document.getElementById('app-content');
    const mainContentTemplate = appContent.innerHTML; // Guardar el dashboard inicial

    async function loadPage(page) {
        // Simula la carga de página
        // En una implementación real, aquí se usaría fetch() para cargar plantillas
        const pageTitle = page.charAt(0).toUpperCase() + page.slice(1);
        
        let content = `<h1 class="page-title">Página de ${pageTitle}</h1>`;
        
        if (page === 'dashboard') {
            // Re-generar el dashboard para que los enlaces funcionen
            content = `
                <header class="content-header">
                    <a href="#0" class="content-logo">
                        <img src="images/logo.png" alt="Logo">
                        <span>MedicalHome</span>
                    </a>
                    <div class="notifications">
                        <span class="badge">1</span>
                        <i data-lucide="bell"></i>
                    </div>
                </header>
                <div class="content-grid">
                    <a href="#medicamentos" class="summary-card">
                        <h3 class="card-title">Medicamentos</h3>
                        <ul class="card-item-list">
                            <li><span class="item-name">Lisinopril 10mg</span><span class="item-detail">1 vez/día - 08:00 AM</span></li>
                            <li><span class="item-name">Metformina 850mg</span><span class="item-detail">2 veces/día - 09:00 AM, 09:00 PM</span></li>
                        </ul>
                    </a>
                    <a href="#citas" class="summary-card"><h3 class="card-title">Próximas Citas</h3><ul class="card-item-list"><li><span class="item-name">Control Cardiología</span><span class="item-detail">Mañana, 10:30 AM</span></li></ul></a>
                    <a href="#terapias" class="summary-card"><h3 class="card-title">Terapias</h3></a>
                    <a href="#renal" class="summary-card"><h3 class="card-title">Seguimiento Renal</h3></a>
                    <a href="#cardiaco" class="summary-card"><h3 class="card-title">Seguimiento Cardiaco</h3></a>
                    <a href="#diabetes" class="summary-card"><h3 class="card-title">Seguimiento Diabetes</h3></a>
                    <a href="#artritis" class="summary-card"><h3 class="card-title">Seguimiento Artritis</h3></a>
                    <a href="#tea" class="summary-card"><h3 class="card-title">Seguimiento TEA</h3></a>
                    <a href="#respiratorio" class="summary-card"><h3 class="card-title">Seguimiento Respiratorio</h3></a>
                    <a href="#gastrico" class="summary-card"><h3 class="card-title">Seguimiento Gástrico</h3></a>
                    <a href="#general" class="summary-card"><h3 class="card-title">Seguimiento General</h3></a>
                    <a href="#agenda" class="summary-card"><h3 class="card-title">Agenda</h3></a>
                    <a href="#asistente-ia" class="summary-card"><h3 class="card-title">Asistente Virtual</h3></a>
                    <a href="#bienestar" class="summary-card"><h3 class="card-title">Bienestar</h3></a>
                </div>
            `;
        }
        
        appContent.innerHTML = content;
        
        // Actualizar el estado 'active' de los enlaces
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${page}`) {
                link.classList.add('active');
            }
        });
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function handleNavigation() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        loadPage(hash);
    }

    window.addEventListener('hashchange', handleNavigation);
    handleNavigation(); // Carga inicial


    // --- Lógica del Modal de Bienvenida ---
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

    // --- Lógica de Modales "Quiénes somos" y "Reportar" ---
    const aboutBtn = document.getElementById('about-btn');
    const reportBtn = document.getElementById('report-btn');
    const aboutModal = document.getElementById('about-modal');
    const reportModal = document.getElementById('report-modal');

    function openModal(modal) {
        if (modal) modal.classList.remove('hidden');
    }

    function closeModalOnClick(modal) {
        if (modal) modal.classList.add('hidden');
    }
    
    aboutBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(aboutModal); });
    reportBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(reportModal); });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModalOnClick(aboutModal);
            closeModalOnClick(reportModal);
        });
    });
    
    const reportForm = document.getElementById('report-form');
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('report-text').value;
        window.location.href = `mailto:viviraplicaciones@gmail.com?subject=Reporte de Fallo - MedicalHome&body=${encodeURIComponent(text)}`;
        closeModalOnClick(reportModal);
    });


    // --- Lógica del Menú Lateral (Escritorio) ---
    const collapseBtn = document.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            appShell.classList.toggle('collapsed');
            const isCollapsed = appShell.classList.contains('collapsed');
            collapseBtn.setAttribute('aria-expanded', !isCollapsed);
        });
    }
    
    // --- Lógica del Acordeón ---
    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const parentItem = button.closest('.nav-item-accordion');
            parentItem.classList.toggle('open');
        });
    });

    // --- Lógica de Navegación Móvil ---
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

    // --- Lógica del Switch de Tema ---
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