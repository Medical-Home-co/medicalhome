/* --- js/router.js (Mapa de Rutas Completo) --- */

// 1. Mapa de Rutas: Define qué HTML y qué JS cargar para cada sección
const routes = {
    'login':        { template: 'templates/login.html', script: 'js/pages/login.js' },
    'dashboard':    { template: 'templates/dashboard.html', script: 'js/pages/dashboard.js' },
    'perfil':       { template: 'templates/perfil.html', script: 'js/pages/perfil.js' },
    'graficas':     { template: 'templates/graficas.html', script: 'js/pages/graficas.js' },
    'medicamentos': { template: 'templates/medicamentos.html', script: 'js/pages/medicamentos.js' },
    'citas':        { template: 'templates/citas.html', script: 'js/pages/citas.js' },
    'terapias':     { template: 'templates/terapias.html', script: 'js/pages/terapias.js' },
    'renal':        { template: 'templates/renal.html', script: 'js/pages/renal.js' },
    'ocular':       { template: 'templates/ocular.html', script: 'js/pages/ocular.js' },
    'cardiaco':     { template: 'templates/cardiaco.html', script: 'js/pages/cardiaco.js' },
    'diabetes':     { template: 'templates/diabetes.html', script: 'js/pages/diabetes.js' },
    'artritis':     { template: 'templates/artritis.html', script: 'js/pages/artritis.js' },
    'tea':          { template: 'templates/tea.html', script: 'js/pages/tea.js' },
    'respiratorio': { template: 'templates/respiratorio.html', script: 'js/pages/respiratorio.js' },
    'gastrico':     { template: 'templates/gastrico.html', script: 'js/pages/gastrico.js' },
    'general':      { template: 'templates/general.html', script: 'js/pages/general.js' },
    'agenda':       { template: 'templates/agenda.html', script: 'js/pages/agenda.js' },
    'asistente-ia': { template: 'templates/asistente.html', script: 'js/pages/asistente.js' },
    'bienestar':    { template: 'templates/bienestar.html', script: 'js/pages/bienestar.js' },
    'notificaciones':{ template: 'templates/notificaciones.html', script: 'js/pages/notificaciones.js' }
};

// 2. Función Principal de Carga
export async function loadPage(pageKey) {
    const appContent = document.getElementById('app-content');
    const authContainer = document.getElementById('auth-container');
    
    // Detección de entorno (GitHub Pages vs Local/Firebase)
    const isGitHub = window.location.hostname.includes('github.io');
    const basePath = isGitHub ? '/medicalhome/' : '/';

    // Normalizar rutas relativas
    const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

    // Validar ruta
    const route = routes[pageKey];
    if (!route && pageKey !== 'logout') {
        console.warn(`Ruta no encontrada: ${pageKey}`);
        if(appContent) appContent.innerHTML = `<div class="page-container"><h2 class="page-title">Página no encontrada</h2></div>`;
        return;
    }

    // Determinar contenedor destino (Login va a authContainer, el resto a appContent)
    const targetContainer = (pageKey === 'login') ? authContainer : appContent;
    
    // Mostrar indicador de carga
    if(targetContainer) targetContainer.innerHTML = '<div style="display:flex;justify-content:center;padding:2rem;"><p>Cargando...</p></div>';

    try {
        // A. Cargar HTML
        const templatePath = `${cleanBasePath}/${route.template}?v=${Date.now()}`; // Cache busting
        const response = await fetch(templatePath);
        if (!response.ok) throw new Error(`No se pudo cargar ${templatePath}`);
        const html = await response.text();
        
        if(targetContainer) targetContainer.innerHTML = html;

        // B. Cargar y Ejecutar JS
        if (route.script) {
            const scriptPath = `${cleanBasePath}/${route.script}?v=${Date.now()}`;
            try {
                // Importación dinámica del módulo
                const pageModule = await import(scriptPath);
                
                // Ejecutar función init() si existe
                if (pageModule && typeof pageModule.init === 'function') {
                    pageModule.init();
                }
            } catch (scriptError) {
                console.error(`Error ejecutando script ${scriptPath}:`, scriptError);
            }
        }

        // C. Actualizar Menú Activo
        updateActiveMenu(pageKey);

        // D. Reinicializar Iconos (si usas Lucide)
        if (window.lucide) {
             setTimeout(() => lucide.createIcons(), 50);
        }

    } catch (error) {
        console.error("Error fatal en router:", error);
        if(targetContainer) targetContainer.innerHTML = `<p style="color:red;text-align:center;">Error cargando la sección. Revisa tu conexión.</p>`;
    }
}

// 3. Actualizar estado visual del menú sidebar/mobile
function updateActiveMenu(pageKey) {
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${pageKey}`) {
            link.classList.add('active');
            
            // Abrir acordeón si está dentro de uno
            const accordion = link.closest('.nav-item-accordion');
            if (accordion) accordion.classList.add('open');
        }
    });
}