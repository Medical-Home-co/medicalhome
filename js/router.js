// js/router.js

// Mapeo de rutas: hash -> plantilla HTML -> script JS
const routes = {
    'dashboard': {
        template: 'templates/dashboard.html',
        script: 'js/dashboard.js'
    },
    // --- Aquí agregaremos las otras 11 secciones ---
    // 'perfil': {
    //     template: 'templates/perfil.html',
    //     script: 'js/perfil.js'
    // },
};

const appContent = document.getElementById('app-content');
let currentPageModule = null; // Para guardar el módulo JS de la página actual

async function loadPage(pageKey) {
    // 1. Obtener la ruta o usar 'dashboard' por defecto
    const route = routes[pageKey] || null;

    // Si la ruta no existe, mostrar un "En construcción"
    if (!route) {
        appContent.innerHTML = `
            <div class="page-header">
                <div>
                    <h2 class="page-title">${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)}</h2>
                    <p class="page-subtitle">Esta sección está en construcción.</p>
                </div>
            </div>`;
        return;
    }

    try {
        // 2. Cargar el contenido HTML de la plantilla
        const response = await fetch(route.template);
        if (!response.ok) throw new Error('Plantilla no encontrada');
        const html = await response.text();
        
        // 3. Inyectar el HTML en el <main>
        appContent.innerHTML = html;

        // 4. Cargar dinámicamente el módulo JS de la página
        // Usamos un 'cache-buster' (la fecha) para asegurar que se carga el script nuevo en desarrollo
        const modulePath = `${route.script}?v=${new Date().getTime()}`;
        currentPageModule = await import(`../${modulePath}`);
        
        // 5. Ejecutar la función 'init' de ese módulo
        if (currentPageModule && typeof currentPageModule.init === 'function') {
            currentPageModule.init();
        }

    } catch (error) {
        console.error('Error al cargar la página:', error);
        appContent.innerHTML = `<p>Error al cargar el contenido. Intenta de nuevo.</p>`;
    }
}

function handleNavigation() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    loadPage(hash);

    // Actualizar el estado 'active' de los enlaces
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
        // Usamos startsWith para que los sub-menús también activen al padre (si quisiéramos)
        // Por ahora, usamos href === para coincidencia exacta
        if (link.getAttribute('href') === `#${hash}`) {
            link.classList.add('active');
        }
    });
}

export function initRouter() {
    window.addEventListener('hashchange', handleNavigation);
    handleNavigation(); // Carga inicial
}