import { getUserProfile, getSectionData } from '../storage.js';

async function renderDashboard() {
    const profile = await getUserProfile();
    const grid = document.getElementById('dashboard-grid');
    if (!grid) return;

    grid.innerHTML = ''; 

    if (!profile) {
        grid.innerHTML = `<p class="col-span-full">Crea tu perfil para empezar a ver tu resumen de salud.</p>`;
        return;
    }

    const fixedCards = ['medicamentos', 'citas', 'terapias', 'agenda'];
    for (const key of fixedCards) {
        const data = await getSectionData(key);
        grid.innerHTML += (key === 'agenda') ? createAgendaCard(data, profile) : createDashboardCard(key, data.length);
    }

    const dynamicSections = profile.conditions || [];
    for (const key of dynamicSections) {
        const data = await getSectionData(key);
        grid.innerHTML += createDashboardCard(key, data.length);
    }
    
    if(grid.innerHTML === '') {
        grid.innerHTML = `<p class="col-span-full">No hay secciones activas. Actualiza tu perfil para empezar.</p>`;
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function getCardDetails(key) {
    const details = {
        medicamentos: { title: 'Medicamentos', subtitle: 'Recetados actualmente', icon: 'pilcrow' },
        citas: { title: 'Citas Médicas', subtitle: 'Próximos eventos', icon: 'calendar-days' },
        terapias: { title: 'Terapias', subtitle: 'Sesiones registradas', icon: 'heart-pulse' },
        agenda: { title: 'Agenda', subtitle: 'Contactos guardados', icon: 'book-user' },
        renal: { title: 'Seguimiento Renal', subtitle: 'Registros BCM', icon: 'droplets' },
        artritis: { title: 'Seguimiento Artritis', subtitle: 'Registros de síntomas', icon: 'bone' },
        diabetes: { title: 'Seguimiento Diabetes', subtitle: 'Registros de glucosa', icon: 'activity' },
        cardiaco: { title: 'Seguimiento Cardiaco', subtitle: 'Registros de presión', icon: 'heart' },
        tea: { title: 'Seguimiento TEA', subtitle: 'Registros diarios', icon: 'brain-circuit' },
        respiratorio: { title: 'Seguimiento Respiratorio', subtitle: 'Registros de síntomas', icon: 'wind' },
        gastrico: { title: 'Seguimiento Gástrico', subtitle: 'Registros de síntomas', icon: 'stomach' },
        general: { title: 'Seguimiento General', subtitle: 'Registros de síntomas', icon: 'clipboard-list' },
    };
    return details[key] || { title: key.charAt(0).toUpperCase() + key.slice(1), subtitle: 'Registros', icon: 'file-text' };
}

function createDashboardCard(key, count) {
    const details = getCardDetails(key);
    return `
        <a href="#${key}" class="dashboard-card">
            <div class="card-header">
                <i data-lucide="${details.icon}"></i>
                <div class="card-title-group">
                    <h3 class="card-title">${details.title}</h3>
                    <p class="card-subtitle">${details.subtitle}</p>
                </div>
            </div>
            <div class="card-body">
                <div class="card-data">
                    <span class="data-value">${count}</span>
                    <span class="data-label">Registros</span>
                </div>
            </div>
        </a>
    `;
}

function createAgendaCard(data, profile) {
    const details = getCardDetails('agenda');
    const emergencyContact = profile.emergencyContactName || 'No definido';
    return `
        <a href="#agenda" class="dashboard-card agenda-card">
            <div class="card-header">
                 <i data-lucide="${details.icon}"></i>
                <div class="card-title-group">
                    <h3 class="card-title">${details.title}</h3>
                    <p class="card-subtitle">${details.subtitle}</p>
                </div>
            </div>
            <div class="card-body">
                <div class="card-data">
                    <span class="data-value">${data.length}</span>
                    <span class="data-label">Contactos</span>
                </div>
                <div class="emergency-contact-info">
                    <i data-lucide="shield-alert" class="emergency-icon"></i>
                    <span>Emergencia: <strong>${emergencyContact}</strong></span>
                </div>
            </div>
        </a>
    `;
}

export function init() {
    renderDashboard();
}