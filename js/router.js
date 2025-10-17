import { getUserProfile } from './storage.js';

const appContent = document.getElementById('app-content');
const pageScripts = {};

async function loadPage(page) {
    if (page === 'logout') return;
    
    try {
        const response = await fetch(`templates/${page}.html`);
        if (!response.ok) throw new Error('Página no encontrada');
        
        appContent.innerHTML = await response.text();

        if (!pageScripts[page]) {
             try {
                const module = await import(`./pages/${page}.js`);
                pageScripts[page] = module;
            } catch (error) {
                console.log(`No se encontró script para la página: ${page}`);
                pageScripts[page] = { init: () => {} };
            }
        }
        pageScripts[page].init();

        if (window.lucide) {
            lucide.createIcons();
        }
        updateNavProfile();

    } catch (error) {
        console.error('Error al cargar la página:', error);
        appContent.innerHTML = `<h2>Error 404</h2><p>Página no encontrada.</p>`;
    }
}

async function updateNavProfile() {
    const profile = await getUserProfile();
    const navProfileName = document.getElementById('nav-profile-name');
    if (profile && navProfileName) {
        navProfileName.textContent = profile.fullName || 'Usuario';
    }
}

export function router() {
    const path = window.location.hash.substring(1) || 'dashboard';
    loadPage(path);
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.hash === `#${path}` || (link.classList.contains('accordion-toggle') && document.querySelector(`.sub-link[href="#${path}"]`)));
    });
}

export function setupAccordion() {
    document.querySelectorAll('.accordion-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const parentItem = button.closest('.nav-item-accordion');
            parentItem.classList.toggle('open');
        });
    });
}

export function closeNavOnLinkClick() {
     document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && !link.classList.contains('accordion-toggle')) {
                document.getElementById('main-nav').classList.remove('active');
            }
        });
    });
}