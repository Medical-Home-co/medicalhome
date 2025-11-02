// --- js/pages/notificaciones.js ---
// (Esta es la PÁGINA que muestra la lista)

import { store } from '../store.js'; 
import { requestNotificationPermission } from '../notifications.js'; // Importa el SERVICIO

let allNotifications = [];
let allData = {};

// --- 1. Recopilar Notificaciones (Sin cambios) ---
function collectNotifications() {
    allData = {
        meds: store.getMeds(),
        citas: store.getCitas(),
        terapias: store.getTerapias(),
        bcmData: store.getBcmData()
    };
    // ... (El resto de esta función es idéntico)
    const medNotifications = (allData.meds || []).flatMap(med =>
        (med.schedules || []).map((schedule, index) => ({
            id: `${med.id}-${index}`,
            source: 'meds',
            sourceId: med.id,
            title: med.name || 'Medicamento',
            subtitle: `Recordatorio: ${med.dose || 'N/A'}`,
            icon: 'pill.svg', 
            type: 'Medicamento',
            time: schedule || 'N/A',
            notify: med.notify !== undefined ? med.notify : true
        }))
    );
    const citaNotifications = (allData.citas || []).map(cita => ({
        id: `cita-${cita.id}`,
        source: 'citas',
        sourceId: cita.id,
        title: cita.name || 'Cita Médica',
        subtitle: `Cita con ${cita.doctor || 'Doctor'}`,
        icon: 'calendar-days.svg', 
        type: 'Cita Médica',
        time: '24 horas antes',
        notify: cita.notify !== undefined ? cita.notify : true
    }));
    const terapiaNotifications = (allData.terapias || []).map(terapia => ({
        id: `terapia-${terapia.id}`,
        source: 'terapias',
        sourceId: terapia.id,
        title: terapia.name || 'Terapia',
        subtitle: `Sesión programada`,
        icon: 'accessibility.svg', 
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
        icon: 'bean.svg', 
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

// --- 2. Renderizar la UI (Sin cambios) ---
function renderMasterControl() {
    // ... (idéntico)
    const subtitle = document.getElementById('notify-master-subtitle');
    const masterToggle = document.getElementById('notify-master-toggle');
    const activateAllBtn = document.getElementById('notify-activate-all');
    const deactivateAllBtn = document.getElementById('notify-deactivate-all');
    if (!activateAllBtn || !deactivateAllBtn) return; 
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
    activateAllBtn.classList.remove('button-state-active');
    deactivateAllBtn.classList.remove('button-state-active');
    if (areAllActive) {
        activateAllBtn.classList.add('button-state-active');
    } else if (areAllInactive) {
        deactivateAllBtn.classList.add('button-state-active');
    }
}
function renderNotificationList() {
    // ... (idéntico)
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
        card.className = 'summary-card';
        card.style.padding = '1rem'; 
        const title = item.title || 'Título no disponible';
        const subtitle = item.subtitle || 'Subtítulo no disponible';
        const icon = item.icon || 'bell.svg'; 
        const type = item.type || 'Tipo no disponible';
        const time = item.time || 'Hora no disponible';
        const notify = item.notify !== undefined ? item.notify : true;
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <img src="images/icons/${icon}" alt="${type}" class="nav-icon-img">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${title}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">${subtitle}</p>
                    </div>
                </div>
            </div>
            <div style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">
                    ${type} <span style="font-weight: 400; color: var(--text-secondary);">• ${time}</span>
                </span>
                <label class="switch">
                    <input type="checkbox" class="notify-toggle" data-id="${item.id}"
                           data-source="${item.source}" data-source-id="${item.sourceId}"
                           ${notify ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>`;
        listContainer.appendChild(card);
    });
}

// --- 3. Sincronizar cambios (Sin cambios) ---
function updateNotificationState(source, sourceId, newState) {
    // ... (idéntico)
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
    // ... (idéntico)
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

// --- 4. Asignar Listeners (Sin cambios) ---
function attachListeners() {
    // ... (idéntico)
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
        const sourceId = toggle.dataset.sourceId;
        const newState = toggle.checked;
        updateNotificationState(source, sourceId, newState);
        renderMasterControl();
    });
    const pushBtn = document.getElementById('activate-push-notifications-btn');
    pushBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        pushBtn.disabled = true;
        pushBtn.innerHTML = '<span>Procesando...</span>';
        await requestNotificationPermission();
        checkNotificationPermissionStatus();
    });
}

// --- 5. Función para chequear permiso (MODIFICADA) ---
function checkNotificationPermissionStatus() {
    const statusEl = document.getElementById('push-notifications-status');
    const pushBtn = document.getElementById('activate-push-notifications-btn');
    if (!statusEl || !pushBtn) return;

    if (!('Notification' in window)) {
        statusEl.textContent = 'Este navegador no soporta notificaciones push.';
        pushBtn.classList.add('hidden');
        return;
    }

    switch (Notification.permission) {
        case 'granted':
            statusEl.textContent = 'Permiso de notificaciones CONCEDIDO.';
            statusEl.style.color = 'var(--success-color)';
            pushBtn.classList.add('hidden'); 
            break;
        case 'denied':
            statusEl.textContent = 'Permiso DENEGADO. Debes cambiarlo en la configuración del navegador.';
            statusEl.style.color = 'var(--danger-color)';
            pushBtn.disabled = true;
            pushBtn.innerHTML = '<span>Denegado</span>';
            break;
        default: // 'default' (preguntar)
            statusEl.textContent = 'Activa el permiso del navegador para recibir alertas.';
            statusEl.style.color = 'var(--text-secondary)';
            pushBtn.disabled = false;
            
            // --- INICIO DE LA CORRECCIÓN ---
            // Se elimina el ícono <i data-lucide...> para evitar el conflicto
            // con el script de íconos que rompe el elemento <details>.
            pushBtn.innerHTML = '<span>Activar</span>';
            // --- FIN DE LA CORRECCIÓN ---
            
            break;
    }
}

// --- 6. Función de Inicio (Sin cambios) ---
export function init() {
    console.log('Cargado js/pages/notificaciones.js (con estilo de tarjeta unificado)');
    collectNotifications();
    renderNotificationList();
    renderMasterControl();
    attachListeners();
    checkNotificationPermissionStatus();
}