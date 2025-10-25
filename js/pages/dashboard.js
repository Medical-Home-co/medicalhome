/* --- js/pages/dashboard.js --- */

import { store } from '../store.js';

/**
 * SOLUCIÓN: Función 'getStoreData' actualizada.
 * Ahora calcula correctamente el total de notificaciones.
 */
function getStoreData(key) {
    switch (key) {
        case 'medicamentos': return store.getMeds() || [];
        case 'citas': return store.getCitas() || [];
        case 'terapias': return store.getTerapias() || [];
        case 'agenda': return store.getAgenda() || [];
        case 'renal': return store.getBcmData() || null;
        case 'cardiaco': return store.getCardiacoData() || [];
        case 'diabetes': return store.getDiabetesData() || [];
        case 'artritis': return store.getArtritisData() || [];
        case 'tea': return store.getTeaData() || [];
        case 'respiratorio': return store.getRespiratorioData() || [];
        case 'gastrico': return store.getGastricoData() || [];
        case 'ocular': return store.getOcularData() || [];
        case 'general': return store.getGeneralData() || [];
        
        // --- INICIO SOLUCIÓN NOTIFICACIONES ---
        case 'notificaciones': 
            try {
                // Obtenemos los datos de las fuentes de notificaciones
                const meds = store.getMeds() || [];
                const citas = store.getCitas() || [];
                const terapias = store.getTerapias() || [];
                const bcmData = store.getBcmData() || {};

                // Contamos cuántos tienen 'notify: true' (o no está definido, que asume true)
                const medCount = meds.filter(item => item.notify !== false).length;
                const citaCount = citas.filter(item => item.notify !== false).length;
                const terapiaCount = terapias.filter(item => item.notify !== false).length;
                
                // Contamos las citas BCM que tienen 'notify: true'
                const bcmAppointments = bcmData.dryWeightAppointments || [];
                const bcmCount = bcmAppointments.filter(item => item.notify !== false).length;

                // Devolvemos un array FALSO que solo contiene el CONTEO TOTAL.
                // Usamos .fill() para crear un array de esa longitud.
                return new Array(medCount + citaCount + terapiaCount + bcmCount).fill(true);

            } catch (e) {
                console.error("Error calculando notificaciones:", e);
                return []; // Devolver 0 si falla
            }
        // --- FIN SOLUCIÓN NOTIFICACIONES ---
            
        default: return [];
    }
}

async function renderDashboard() {
    const profile = store.getProfile(); 
    const grid = document.getElementById('dashboard-grid');
    if (!grid) return;

    grid.innerHTML = ''; 

    if (!profile) {
        grid.innerHTML = `<p class="col-span-full">Crea tu perfil para empezar a ver tu resumen de salud.</p>`;
        return;
    }

    const allCards = [
        'medicamentos', 'citas', 'terapias', 'agenda',
        'renal', 'cardiaco', 'diabetes', 'artritis',
        'tea', 'respiratorio', 'gastrico', 'ocular',
        'general', 'notificaciones' 
    ];

    for (const key of allCards) {
        const data = getStoreData(key);
        if (key === 'agenda') {
            grid.innerHTML += createAgendaCard(data, profile);
        } else {
            grid.innerHTML += createDashboardCard(key, data);
        }
    }
    
    if(grid.innerHTML === '') {
        grid.innerHTML = `<p class="col-span-full">No hay secciones activas.</p>`;
    }
}

function getCardDetails(key) {
    const details = {
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
        notificaciones: { title: 'Notificaciones', subtitle: 'Alertas y recordatorios', icon: 'bell.svg' },
    };
    return details[key] || { title: key.charAt(0).toUpperCase() + key.slice(1), subtitle: 'Registros', icon: 'clipboard-list.svg' };
}

function createCardDataSummary(key, data) {
    const listStyle = "list-style: none; padding: 0; margin: 0.75rem 0 0 0;";
    const itemStyle = "font-size: 0.9rem; color: var(--text-primary); font-weight: 500; margin-top: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
    const itemSubStyle = "font-size: 0.85rem; color: var(--text-secondary);";
    const moreStyle = "font-size: 0.85rem; color: var(--primary-blue); margin-top: 0.5rem; font-weight: 500;";
    const noRecordStyle = `<p style="${itemStyle} color: var(--text-secondary); font-weight: 400;">No hay registros.</p>`;

    if (key === 'medicamentos' || key === 'citas' || key === 'terapias') {
        if (!Array.isArray(data) || data.length === 0) {
            return noRecordStyle;
        }
        
        const sortedData = data[0]?.date 
            ? [...data].sort((a, b) => new Date(a.date) - new Date(b.date)) 
            : [...data];
        
        let itemsHtml = '';
        switch (key) {
            case 'medicamentos':
                itemsHtml = sortedData.slice(0, 2).map(med => {
                    const time = (med.schedules && med.schedules.length > 0) ? ` • ${med.schedules[0]}` : '';
                    return `<li style="${itemStyle}" title="${med.name}${time}">${med.name || 'Medicamento'}<span style="${itemSubStyle}">${time}</span></li>`;
                }).join('');
                break;
            case 'citas':
                itemsHtml = sortedData.slice(0, 2).map(cita => {
                    let date = 'Fecha inválida';
                    try { date = new Date(cita.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }); } catch(e) {}
                    return `<li style="${itemStyle}">${cita.name || 'Cita'} <span style="${itemSubStyle}"> • ${date} ${cita.time || ''}</span></li>`;
                }).join('');
                break;
            case 'terapias':
                itemsHtml = sortedData.slice(0, 2).map(t => {
                    let date = 'Fecha inválida';
                    try { date = new Date(t.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }); } catch(e) {}
                    return `<li style="${itemStyle}">${t.name || 'Terapia'} <span style="${itemSubStyle}"> • ${date}</span></li>`;
                }).join('');
                break;
        }

        if (sortedData.length > 2) {
            itemsHtml += `<li style="${moreStyle}">+ ${sortedData.length - 2} más...</li>`;
        }
        return `<ul style="${listStyle}">${itemsHtml}</ul>`;
    }

    if (key === 'renal') {
        if (data && data.currentWeight) {
            return `<p style="${itemStyle}">Peso actual: <strong>${data.currentWeight} Kg</strong></p>`;
        } else {
            return noRecordStyle;
        }
    }

    if (Array.isArray(data)) {
        // SOLUCIÓN: Si la 'key' es 'notificaciones', usamos 'Alertas activas'
        const label = (key === 'notificaciones') ? 'Alertas activas' : 'Registros';
        
        if (data.length === 0) {
             // SOLUCIÓN: Si es 'notificaciones', el texto de "cero" es diferente
            if (key === 'notificaciones') {
                return `<p style="${itemStyle} color: var(--text-secondary); font-weight: 400;">No hay alertas activas.</p>`;
            }
            return noRecordStyle;
        }
        return `
            <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-top: 0.75rem;">
                <span style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">${data.length}</span>
                <span style="font-size: 0.9rem; color: var(--text-secondary);">${label}</span>
            </div>`;
    }
    
    return `<p style="${itemStyle} color: var(--text-secondary); font-weight: 400;">Datos no disponibles.</p>`;
}


function createDashboardCard(key, data) {
    const details = getCardDetails(key);
    const dataSummaryHtml = createCardDataSummary(key, data); 

    return `
        <a href="#${key}" class="summary-card" style="padding: 1rem; text-decoration: none; display: block;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600;">${details.title}</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.25rem 0 0rem;">${details.subtitle}</p>
                    ${dataSummaryHtml}
                </div>
                
                <div style="background-color: var(--primary-blue); padding: 0.75rem; border-radius: 50%; flex-shrink: 0;">
                    <img src="images/icons/${details.icon}" alt="${details.title}" class="nav-icon-img" style="width: 20px; height: 20px; display: block; filter: invert(1);">
                </div>

            </div>
        </a>
    `;
}

function createAgendaCard(data, profile) {
    const details = getCardDetails('agenda');
    const emergencyContact = profile.emergencyContactName || 'No definido';
    
    const listStyle = "list-style: none; padding: 0; margin: 0.75rem 0 0 0;";
    const itemStyle = "font-size: 0.9rem; color: var(--text-primary); font-weight: 500; margin-top: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
    const moreStyle = "font-size: 0.85rem; color: var(--primary-blue); margin-top: 0.5rem; font-weight: 500;";
    
    let dataSummaryHtml;
    if (!data || data.length === 0) {
        dataSummaryHtml = `<p style="${itemStyle} color: var(--text-secondary); font-weight: 400;">No hay contactos.</p>`;
    } else {
        let itemsHtml = data.slice(0, 2).map(contact => {
            return `<li style="${itemStyle}" title="${contact.name}">${contact.name || 'Contacto'}</li>`;
        }).join('');
        
        if (data.length > 2) {
            itemsHtml += `<li style="${moreStyle}">+ ${data.length - 2} más...</li>`;
        }
        dataSummaryHtml = `<ul style="${listStyle}">${itemsHtml}</ul>`;
    }

    return `
        <a href="#agenda" class="summary-card" style="padding: 1rem; text-decoration: none; display: block;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 600;">${details.title}</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.25rem 0 0rem;">${details.subtitle}</p>
                    ${dataSummaryHtml}
                </div>
                
                <div style="background-color: var(--primary-blue); padding: 0.75rem; border-radius: 50%; flex-shrink: 0;">
                    <img src="images/icons/${details.icon}" alt="${details.title}" class="nav-icon-img" style="width: 20px; height: 20px; display: block; filter: invert(1);">
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