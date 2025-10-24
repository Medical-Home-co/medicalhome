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
        // SOLUCIÓN: Añadido 'ocular' a la lista de exclusión si ya está en fixedCards (o si se maneja aparte)
        // Por ahora, lo dejamos que se renderice si está en 'conditions'
        const data = await getSectionData(key);
        grid.innerHTML += createDashboardCard(key, data.length);
    }
    
    if(grid.innerHTML === '') {
        grid.innerHTML = `<p class="col-span-full">No hay secciones activas. Actualiza tu perfil para empezar.</p>`;
    }
    
    // SOLUCIÓN: La llamada a lucide.createIcons() se elimina, ya que ahora usamos <img>
}

/* --- SOLUCIÓN: Iconos y títulos actualizados para usar <img> --- */
function getCardDetails(key) {
    const details = {
        // Iconos basados en tu index.html
        medicamentos: { title: 'Medicamentos', subtitle: 'Recetados actualmente', icon: 'pill.svg' },
        citas: { title: 'Citas Médicas', subtitle: 'Próximos eventos', icon: 'calendar-days.svg' },
        terapias: { title: 'Terapias', subtitle: 'Sesiones registradas', icon: 'accessibility.svg' },
        agenda: { title: 'Agenda', subtitle: 'Contactos guardados', icon: 'book-user.svg' },
        renal: { title: 'Seguimiento Renal', subtitle: 'Registros BCM', icon: 'bean.svg' },
        artritis: { title: 'Seguimiento Artritis', subtitle: 'Registros de síntomas', icon: 'dumbbell.svg' },
        diabetes: { title: 'Seguimiento Diabetes', subtitle: 'Registros de glucosa', icon: 'candy.svg' },
        cardiaco: { title: 'Seguimiento Cardiaco', subtitle: 'Registros de presión', icon: 'heart.svg' },
        tea: { title: 'Seguimiento TEA', subtitle: 'Registros diarios', icon: 'puzzle.svg' },
        respiratorio: { title: 'Seguimiento Respiratorio', subtitle: 'Registros de síntomas', icon: 'wind.svg' },
        gastrico: { title: 'Seguimiento Gástrico', subtitle: 'Registros de síntomas', icon: 'hospital.svg' },
        ocular: { title: 'Seguimiento Ocular', subtitle: 'Evaluaciones', icon: 'scan-eye.svg' },
        general: { title: 'Seguimiento General', subtitle: 'Registros de síntomas', icon: 'clipboard-list.svg' },
    };
    return details[key] || { title: key.charAt(0).toUpperCase() + key.slice(1), subtitle: 'Registros', icon: 'clipboard-list.svg' }; // Icono por defecto
}

/* --- SOLUCIÓN: HTML de la tarjeta reescrito para usar .summary-card --- */
function createDashboardCard(key, count) {
    const details = getCardDetails(key);
    // Esta estructura usa .summary-card y los estilos en línea que ya usas en otras secciones
    return `
        <a href="#${key}" class="summary-card" style="padding: 1rem; text-decoration: none; display: block;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600;">${details.title}</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.25rem 0 0.75rem;">${details.subtitle}</p>
                    
                    <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">${count}</span>
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">Registros</span>
                    </div>
                </div>
                
                <div style="background-color: var(--bg-secondary); padding: 0.75rem; border-radius: 50%; flex-shrink: 0;">
                    <img src="images/icons/${details.icon}" alt="${details.title}" class="nav-icon-img" style="width: 20px; height: 20px; display: block;">
                </div>

            </div>
        </a>
    `;
}

/* --- SOLUCIÓN: HTML de la tarjeta de Agenda reescrito --- */
function createAgendaCard(data, profile) {
    const details = getCardDetails('agenda');
    const emergencyContact = profile.emergencyContactName || 'No definido';
    return `
        <a href="#agenda" class="summary-card" style="padding: 1rem; text-decoration: none; display: block;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600;">${details.title}</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.25rem 0 0.75rem;">${details.subtitle}</p>
                    
                    <div style="display: flex; align-items: baseline; gap: 0.5rem;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">${data.length}</span>
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">Contactos</span>
                    </div>
                </div>
                
                <div style="background-color: var(--bg-secondary); padding: 0.75rem; border-radius: 50%; flex-shrink: 0;">
                    <img src="images/icons/${details.icon}" alt="${details.title}" class="nav-icon-img" style="width: 20px; height: 20px; display: block;">
                </div>
            </div>
            
            <div style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 0.75rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                <img src="images/icons/shield-alert.svg" class="nav-icon-img" style="width: 16px; height: 16px;">
                <span>Emergencia: <strong>${emergencyContact}</strong></span>
            </div>
        </a>
    `;
}

export function init() {
    renderDashboard();
}