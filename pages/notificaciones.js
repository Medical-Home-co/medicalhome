// --- pages/notificaciones.js ---
import { store } from '../store.js';

let allNotifications = [];
let allData = {};

function collectNotifications() {
    allData = {
        meds: store.getMeds(),
        citas: store.getCitas(),
        terapias: store.getTerapias(),
        bcmData: store.getBcmData()
    };

    const medNotifications = (allData.meds || []).flatMap(med =>
        (med.schedules || []).map((schedule, index) => ({
            id: `${med.id}-${index}`,
            source: 'meds',
            sourceId: med.id,
            title: med.name || 'Medicamento sin nombre',
            subtitle: `Recordatorio: ${med.dose || 'N/A'}`,
            icon: 'pill',
            type: 'Medicamento',
            time: schedule || 'N/A',
            notify: med.notify !== undefined ? med.notify : true
        }))
    );

    const citaNotifications = (allData.citas || []).map(cita => ({
        id: `cita-${cita.id}`,
        source: 'citas',
        sourceId: cita.id,
        title: cita.name || 'Cita sin nombre',
        subtitle: `Cita con ${cita.doctor || 'N/A'}`,
        icon: 'stethoscope',
        type: 'Cita Médica',
        time: '24 horas antes',
        notify: cita.notify !== undefined ? cita.notify : true
    }));

    const terapiaNotifications = (allData.terapias || []).map(terapia => ({
        id: `terapia-${terapia.id}`,
        source: 'terapias',
        sourceId: terapia.id,
        title: terapia.name || 'Terapia sin nombre',
        subtitle: `Sesión programada`,
        icon: 'heart-pulse',
        type: 'Terapia',
        time: '24h y 2h antes',
        notify: terapia.notify !== undefined ? terapia.notify : true
    }));

    const bcmAppointments = (allData.bcmData?.dryWeightAppointments || []);
    const bcmNotifications = bcmAppointments.map(app => ({
        id: `bcm-${app.id}`,
        source: 'bcmData',
        sourceId: app.id,
        title: 'Cita de Peso Seco',
        subtitle: `Nuevo Peso: ${app.newWeight || 'N/A'} kg`,
        icon: 'activity',
        type: 'BCM (Renal)',
        time: '24 horas antes',
        notify: app.notify !== undefined ? app.notify : true
    }));

    allNotifications = [
        ...medNotifications,
        ...citaNotifications,
        ...terapiaNotifications,
        ...bcmNotifications
    ];
}


// --- 2. Renderizar la UI ---

/**
 * REESCRITO: renderMasterControl()
 * Ahora usa clases CSS para indicar el estado activo de los botones.
 */
function renderMasterControl() {
    const subtitle = document.getElementById('notify-master-subtitle');
    const masterToggle = document.getElementById('notify-master-toggle');
    const activateAllBtn = document.getElementById('notify-activate-all');
    const deactivateAllBtn = document.getElementById('notify-deactivate-all');

    if (!activateAllBtn || !deactivateAllBtn) return; // Salir si los botones no existen

    const activeCount = allNotifications.filter(n => n.notify).length;
    const totalCount = allNotifications.length;
    const areAllActive = totalCount > 0 && activeCount === totalCount;
    const areAllInactive = totalCount > 0 && activeCount === 0;

    if (subtitle) {
        subtitle.textContent = `${activeCount} de ${totalCount} notificaciones activas`;
    }

    if (masterToggle) {
        masterToggle.checked = activeCount > 0 && totalCount > 0;
    }

    // === INICIO DE LA SOLUCIÓN ===
    // 1. Quitar la clase de estado activo de ambos botones
    activateAllBtn.classList.remove('button-state-active');
    deactivateAllBtn.classList.remove('button-state-active');
    // (Ya no usamos .disabled ni .button-disabled)

    // 2. Aplicar la clase de estado activo al botón correspondiente
    if (areAllActive) {
        // Si todas están activas, el botón "Activar" muestra el estado actual (azul)
        activateAllBtn.classList.add('button-state-active');
    } else if (areAllInactive) {
        // Si todas están inactivas, el botón "Desactivar" muestra el estado actual (azul)
        deactivateAllBtn.classList.add('button-state-active');
    }
    // Si hay una mezcla, ninguno tendrá la clase 'button-state-active'
    // y se verán con su color por defecto (azul para primario, gris para secundario).
    // === FIN DE LA SOLUCIÓN ===
}


function renderNotificationList() {
    // ... (Sin cambios)
    const listContainer = document.getElementById('notify-list-container');
    const emptyState = document.getElementById('notify-empty-state');
    if (!listContainer || !emptyState) return;
    listContainer.innerHTML = '';
    if (allNotifications.length === 0) {
        listContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    listContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
    allNotifications.forEach(item => {
        const card = document.createElement('div');
        card.className = 'notification-card';
        const title = item.title || 'Título no disponible';
        const subtitle = item.subtitle || 'Subtítulo no disponible';
        const icon = item.icon || 'bell';
        const type = item.type || 'Tipo no disponible';
        const time = item.time || 'Hora no disponible';
        const notify = item.notify !== undefined ? item.notify : true;

        card.innerHTML = `
            <div class="icon-container"><i data-lucide="${icon}"></i></div>
            <p class="notify-title">${title}</p>
            <p class="notify-subtitle">${subtitle}</p>
            <div class="notify-time-info">
                <span class="type">${type}</span>
                <span class="time">${time}</span>
            </div>
            <label class="switch">
                <input type="checkbox" class="notify-toggle" data-id="${item.id}"
                       data-source="${item.source}" data-source-id="${item.sourceId}"
                       ${notify ? 'checked' : ''}>
                <span class="slider"></span>
            </label>`;
        listContainer.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}


// --- 3. Sincronizar cambios de vuelta al Store ---
function updateNotificationState(source, sourceId, newState) {
    // ... (Sin cambios)
     let itemToUpdate;
    let dataArray;
    let saveFunction;

    switch (source) {
        case 'meds':
            dataArray = allData.meds || store.getMeds();
            saveFunction = store.saveMeds;
            break;
        case 'citas':
            dataArray = allData.citas || store.getCitas();
            saveFunction = store.saveCitas;
            break;
        case 'terapias':
            dataArray = allData.terapias || store.getTerapias();
            saveFunction = store.saveTerapias;
            break;
        case 'bcmData':
            allData.bcmData = allData.bcmData || store.getBcmData();
            allData.bcmData.dryWeightAppointments = allData.bcmData.dryWeightAppointments || [];
            dataArray = allData.bcmData.dryWeightAppointments;
            saveFunction = () => store.saveBcmData(allData.bcmData);
            break;
        default: return;
    }

    if (!Array.isArray(dataArray)) return;

    itemToUpdate = dataArray.find(i => i && i.id.toString() === sourceId.toString());

    if (itemToUpdate) {
        itemToUpdate.notify = newState;
        if (source === 'bcmData') saveFunction();
        else saveFunction(dataArray);
    } else {
         console.warn(`No se encontró item: source=${source}, sourceId=${sourceId}`);
    }

    const localItem = allNotifications.find(n => n.source === source && n.sourceId.toString() === sourceId.toString());
    if (localItem) localItem.notify = newState;
}

function setAllNotifications(state) {
    // ... (Sin cambios)
    allNotifications.forEach(item => {
        if (item.notify !== state) {
            item.notify = state;
            const sourceIdToUpdate = item.sourceId;
            updateNotificationState(item.source, sourceIdToUpdate, state);
        }
    });
    renderNotificationList();
    renderMasterControl();
}


// --- 4. Asignar Listeners ---
function attachListeners() {
    // ... (Sin cambios en los listeners, solo llaman a funciones actualizadas)
    const masterToggle = document.getElementById('notify-master-toggle');
    const activateAllBtn = document.getElementById('notify-activate-all');
    const deactivateAllBtn = document.getElementById('notify-deactivate-all');
    const listContainer = document.getElementById('notify-list-container');

    masterToggle?.addEventListener('change', () => {
        const newState = masterToggle.checked;
        setAllNotifications(newState);
    });

    activateAllBtn?.addEventListener('click', () => setAllNotifications(true));
    deactivateAllBtn?.addEventListener('click', () => setAllNotifications(false));

    listContainer?.addEventListener('change', (e) => {
        const toggle = e.target.closest('.notify-toggle');
        if (!toggle) return;
        const source = toggle.dataset.source;
        const sourceId = toggle.dataset.sourceId; // ID puede ser string o number
        const newState = toggle.checked;
        updateNotificationState(source, sourceId, newState);
        renderMasterControl();
    });
}


// --- 5. Función de Inicio ---
export function init() {
    console.log('Cargado js/pages/notificaciones.js (con estilo de estado activo en botones)');
    collectNotifications();
    renderNotificationList();
    renderMasterControl();
    attachListeners();
}