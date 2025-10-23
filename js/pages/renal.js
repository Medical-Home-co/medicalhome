/* --- pages/renal.js --- */
// 1. Importar el store
import { store } from '../store.js';

// 2. La variable se inicializa en null; se cargará en init()
let tempBcmDB = null;

/* --- Funciones de Renderizado (sin cambios en su lógica interna) --- */
/* (Usan tempBcmDB, que ahora se carga desde el store) */

function renderBcmData() {
    /* ... (código idéntico de tu archivo) ... */
    const dataContainer = document.getElementById('bcm-data-container');
    const emptyState = document.getElementById('bcm-empty-state');
    const addBcmMainBtn = document.getElementById('add-bcm-main-btn');

    if (!tempBcmDB || tempBcmDB.currentWeight === null) { // Comprobación más segura
        if (dataContainer) dataContainer.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (addBcmMainBtn) addBcmMainBtn.classList.add('hidden');
    } else {
        if (dataContainer) dataContainer.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (addBcmMainBtn) addBcmMainBtn.classList.remove('hidden');

        renderWeightCard();
        renderLiquidCard();
        renderAppointmentsCard();
        attachActionListeners();
    }
}

function renderWeightCard() {
    /* ... (código idéntico de tu archivo) ... */
    const liquidGain = (tempBcmDB.currentWeight - tempBcmDB.dryWeight).toFixed(2);
    document.getElementById('bcm-display-current').textContent = `${tempBcmDB.currentWeight} kg`;
    document.getElementById('bcm-display-dry').textContent = `${tempBcmDB.dryWeight} kg`;
    document.getElementById('bcm-display-gain').textContent = `${liquidGain} kg`;
}

function renderLiquidCard() {
    /* ... (código idéntico de tu archivo) ... */
    const liquidCard = document.getElementById('bcm-liquid-card');
    if (!liquidCard) return;
    const liquidGain = (tempBcmDB.currentWeight - tempBcmDB.dryWeight);
    const liquidLimit = liquidGain > 0 ? liquidGain * 1000 : 0;
    const totalConsumed = tempBcmDB.liquids.reduce((sum, liq) => sum + liq.amount, 0);
    const liquidRemaining = liquidLimit - totalConsumed;
    document.getElementById('bcm-display-limit').textContent = `${liquidLimit.toFixed(0)} ml`;
    document.getElementById('bcm-display-remaining').textContent = `${liquidRemaining.toFixed(0)} ml`;
    liquidCard.classList.toggle('limit-exceeded', liquidRemaining < 0);
    const liquidLog = document.getElementById('bcm-liquid-log');
    if (liquidLog) {
        liquidLog.innerHTML = '';
        tempBcmDB.liquids.forEach(liq => {
            const logEntry = document.createElement('div');
            logEntry.className = 'liquid-log-entry';
            logEntry.innerHTML = `<span>${liq.time}</span><span>${liq.amount} ml</span>`;
            liquidLog.appendChild(logEntry);
        });
    }
}

function renderAppointmentsCard() {
    /* ... (código idéntico de tu archivo, incluyendo el toggle de 'notify') ... */
    const appointmentsList = document.getElementById('bcm-appointments-list');
    const noAppointmentsMsg = document.getElementById('bcm-no-appointments-msg');
    if (!appointmentsList || !noAppointmentsMsg) return;

    appointmentsList.innerHTML = '';
    // Asegurarse que dryWeightAppointments exista
    const appointments = tempBcmDB.dryWeightAppointments || [];
    if (appointments.length === 0) {
        appointmentsList.appendChild(noAppointmentsMsg);
        noAppointmentsMsg.classList.remove('hidden');
    } else {
        noAppointmentsMsg.classList.add('hidden');
        appointments.forEach(app => {
            const card = document.createElement('div');
            /* Reutilizar summary-card para consistencia */
            card.className = 'summary-card'; 
            card.style.padding = '1rem'; 
            
            const attendedYesClass = app.attended === 'yes' ? 'attended-yes' : '';
            const attendedNoClass = app.attended === 'no' ? 'attended-no' : '';
            
            card.innerHTML = `
                <div class="appointment-info-top">
                    <div class="appointment-info">
                        <p>${new Date(app.date + 'T' + (app.time || '00:00')).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })} - ${app.time || ''}</p>
                        <p class="appointment-detail">Nuevo P. Seco: ${app.newWeight} kg</p>
                    </div>
                    <div class="appointment-actions">
                        <span class="attendance-label">¿Asistió?</span>
                        <div class="attendance-buttons">
                            <button class="button attendance-btn ${attendedYesClass}" data-id="${app.id}" data-action="yes">Sí</button>
                            <button class="button attendance-btn ${attendedNoClass}" data-id="${app.id}" data-action="no">No</button>
                        </div>
                    </div>
                </div>
                <hr class="card-divider">
                <div class="appointment-notify-row">
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">Recordatorios</span>
                    <label class="switch">
                        <input type="checkbox" class="notify-toggle-bcm" data-id="${app.id}" ${app.notify ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            appointmentsList.appendChild(card);
        });
    }
}

/* --- 3. Listeners (Guardar en store en cada acción) --- */
function attachActionListeners() {
    const appointmentContainer = document.getElementById('bcm-appointments-list');
    if (appointmentContainer) {
        const newContainer = appointmentContainer.cloneNode(true);
        appointmentContainer.parentNode.replaceChild(newContainer, appointmentContainer);
        
        newContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.attendance-btn');
            if (target) {
                const appointmentId = parseInt(target.dataset.id, 10);
                const action = target.dataset.action;
                const appointment = tempBcmDB.dryWeightAppointments.find(a => a.id === appointmentId);

                if (appointment && appointment.attended !== action) {
                    appointment.attended = action;
                    store.saveBcmData(tempBcmDB); // <-- GUARDAR CAMBIO
                    renderAppointmentsCard(); // Re-renderizar solo esta tarjeta
                    attachActionListeners(); // Volver a asignar
                }
            }
        });

        // Listener para el toggle
        newContainer.addEventListener('change', (e) => {
            const toggle = e.target.closest('.notify-toggle-bcm');
            if(toggle) {
                const appointmentId = parseInt(toggle.dataset.id, 10);
                const appointment = tempBcmDB.dryWeightAppointments.find(a => a.id === appointmentId);
                if (appointment) {
                    appointment.notify = toggle.checked;
                    store.saveBcmData(tempBcmDB); // <-- GUARDAR CAMBIO
                }
            }
        });
    }
}


function injectBcmStyles() { /* ... (código idéntico de tu archivo) ... */
    const styleId = 'bcm-dynamic-styles'; if (document.getElementById(styleId)) return; const style = document.createElement('style'); style.id = styleId;
    style.innerHTML = `
        .liquid-log-entry { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); padding: 0.25rem 0; border-bottom: 1px solid var(--border-color); }
        .summary-card.limit-exceeded { background-color: var(--danger-light, #FFEBEE) !important; border-color: var(--danger-color, #C62828) !important; }
        body.dark-theme .summary-card.limit-exceeded { background-color: var(--danger-light, #4b2222) !important; border-color: var(--danger-color, #ef9a9a) !important; }
        .summary-card.limit-exceeded, .summary-card.limit-exceeded * { color: var(--danger-color, #C62828) !important; }
        body.dark-theme .summary-card.limit-exceeded, body.dark-theme .summary-card.limit-exceeded * { color: var(--danger-color, #ffcdd2) !important; }
        /* .appointment-card-row { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 12px; } */
        .appointment-info-top { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .appointment-info .appointment-detail { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }
        .appointment-actions { display: flex; align-items: center; gap: 0.75rem; }
        .attendance-label { font-size: 0.9rem; color: var(--text-secondary); white-space: nowrap; }
        .card-divider { border: none; height: 1px; background-color: var(--border-color); width: 100%; margin: 0.75rem 0; }
        .appointment-notify-row { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-top: 0.25rem; }
        .appointment-notify-row span { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    `;
    document.head.appendChild(style);
}

export function init() {
    // 4. Cargar datos del store
    tempBcmDB = store.getBcmData();
    console.log("Cargado js/pages/renal.js (conectado a store)");

    injectBcmStyles();
    
    const weightModal = document.getElementById('bcm-weight-modal');
    const liquidModal = document.getElementById('bcm-liquid-modal');
    const appointmentModal = document.getElementById('bcm-appointment-modal');
    const weightForm = document.getElementById('bcm-weight-form');
    const liquidForm = document.getElementById('bcm-liquid-form');
    const appointmentForm = document.getElementById('bcm-appointment-form');

    function openModal(modal) { if (modal) modal.classList.remove('hidden'); }
    function closeModal(modal) { if (modal) modal.classList.add('hidden'); }
    
    // Botones de apertura
    document.getElementById('add-bcm-initial-btn')?.addEventListener('click', () => { /* ... (código idéntico) ... */ if (weightForm) weightForm.reset(); openModal(weightModal); });
    document.getElementById('add-bcm-main-btn')?.addEventListener('click', () => { if (weightForm && tempBcmDB.currentWeight !== null) { document.getElementById('bcm-current-weight').value = tempBcmDB.currentWeight; document.getElementById('bcm-dry-weight').value = tempBcmDB.dryWeight; } openModal(weightModal); });
    document.getElementById('update-weight-btn')?.addEventListener('click', () => { if (weightForm && tempBcmDB.currentWeight !== null) { document.getElementById('bcm-current-weight').value = tempBcmDB.currentWeight; document.getElementById('bcm-dry-weight').value = tempBcmDB.dryWeight; } openModal(weightModal); });
    document.getElementById('add-liquid-btn')?.addEventListener('click', () => { if (liquidForm) liquidForm.reset(); openModal(liquidModal); });
    document.getElementById('add-appointment-btn')?.addEventListener('click', () => { if (appointmentForm) appointmentForm.reset(); openModal(appointmentModal); });
    document.getElementById('cancel-weight-btn')?.addEventListener('click', () => closeModal(weightModal));
    document.getElementById('cancel-liquid-btn')?.addEventListener('click', () => closeModal(liquidModal));
    document.getElementById('cancel-appointment-btn')?.addEventListener('click', () => closeModal(appointmentModal));

    // Formularios (Guardar en store)
    if (weightForm) weightForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentWeight = parseFloat(document.getElementById('bcm-current-weight').value);
        const dryWeight = parseFloat(document.getElementById('bcm-dry-weight').value);
        if (dryWeight > currentWeight) { alert('Error: El Peso Seco no puede ser mayor que el Peso Actual.'); return; }
        tempBcmDB.currentWeight = currentWeight;
        tempBcmDB.dryWeight = dryWeight;
        if(tempBcmDB.liquids.length === 0) tempBcmDB.liquids = [];
        store.saveBcmData(tempBcmDB); // <-- GUARDAR
        closeModal(weightModal);
        renderBcmData();
    });
    if (liquidForm) liquidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(document.getElementById('bcm-liquid-amount').value);
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        if (amount > 0) tempBcmDB.liquids.push({ time, amount });
        store.saveBcmData(tempBcmDB); // <-- GUARDAR
        closeModal(liquidModal);
        renderBcmData();
    });
    if (appointmentForm) appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newAppointment = {
            id: Date.now(),
            date: document.getElementById('bcm-appointment-date').value,
            time: document.getElementById('bcm-appointment-time').value,
            newWeight: parseFloat(document.getElementById('bcm-appointment-new-weight').value),
            notify: true, // <-- Mantener 'notify' (del toggle anterior)
            attended: null
        };
        tempBcmDB.dryWeightAppointments.push(newAppointment);
        store.saveBcmData(tempBcmDB); // <-- GUARDAR
        closeModal(appointmentModal);
        renderBcmData();
    });

    renderBcmData(); // Renderizado inicial
}