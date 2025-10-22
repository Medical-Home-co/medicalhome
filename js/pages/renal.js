// === INICIO DE LA SOLUCIÓN ===
import { store } from '../store.js'; // Importar el store (ruta corregida)
// === FIN DE LA SOLUCIÓN ===

// La DB ahora se carga desde el store en la función init()
let tempBcmDB = null;

// --- (renderBcmData, renderWeightCard, renderLiquidCard no cambian) ---
function renderBcmData() {
    const dataContainer = document.getElementById('bcm-data-container');
    const emptyState = document.getElementById('bcm-empty-state');
    const addBcmMainBtn = document.getElementById('add-bcm-main-btn');

    if (tempBcmDB.currentWeight === null) {
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
    const liquidGain = (tempBcmDB.currentWeight - tempBcmDB.dryWeight).toFixed(2);
    document.getElementById('bcm-display-current').textContent = `${tempBcmDB.currentWeight} kg`;
    document.getElementById('bcm-display-dry').textContent = `${tempBcmDB.dryWeight} kg`;
    document.getElementById('bcm-display-gain').textContent = `${liquidGain} kg`;
}
function renderLiquidCard() {
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

// --- (renderAppointmentsCard no cambia) ---
function renderAppointmentsCard() {
    const appointmentsList = document.getElementById('bcm-appointments-list');
    const noAppointmentsMsg = document.getElementById('bcm-no-appointments-msg');
    if (!appointmentsList || !noAppointmentsMsg) return;

    appointmentsList.innerHTML = '';
    if (tempBcmDB.dryWeightAppointments.length === 0) {
        appointmentsList.appendChild(noAppointmentsMsg);
        noAppointmentsMsg.classList.remove('hidden');
    } else {
        noAppointmentsMsg.classList.add('hidden');
        tempBcmDB.dryWeightAppointments.forEach(app => {
            const card = document.createElement('div');
            card.className = 'summary-card'; 
            const attendedYesClass = app.attended === 'yes' ? 'attended-yes' : '';
            const attendedNoClass = app.attended === 'no' ? 'attended-no' : '';

            card.innerHTML = `
                <div class="appointment-info-top">
                    <div class="appointment-info">
                        <p>${new Date(app.date + 'T' + app.time).toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })} - ${app.time}</p>
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
                        <input type="checkbox" 
                               class="notify-toggle-input" 
                               data-id="${app.id}" 
                               ${app.notify ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            appointmentsList.appendChild(card);
        });
    }
}

// --- (attachActionListeners no cambia) ---
function attachActionListeners() {
    const appointmentContainer = document.getElementById('bcm-appointments-list');
    if (!appointmentContainer) return;

    const newContainer = appointmentContainer.cloneNode(true);
    appointmentContainer.parentNode.replaceChild(newContainer, appointmentContainer);
    
    newContainer.addEventListener('click', (e) => {
        const attendanceBtn = e.target.closest('.attendance-btn');
        if (!attendanceBtn) return;
        const appointmentId = attendanceBtn.dataset.id;
        const action = attendanceBtn.dataset.action;
        const appointment = tempBcmDB.dryWeightAppointments.find(a => a.id.toString() === appointmentId);

        if (appointment && appointment.attended !== action) {
            appointment.attended = action;
            store.saveBcmData(tempBcmDB); // <-- GUARDAR EN STORE
            
            const buttonGroup = attendanceBtn.closest('.attendance-buttons');
            buttonGroup.querySelectorAll('.attendance-btn').forEach(btn => {
                btn.classList.remove('attended-yes', 'attended-no');
            });
            if (action === 'yes') {
                attendanceBtn.classList.add('attended-yes');
            } else {
                attendanceBtn.classList.add('attended-no');
            }
        }
    });

    newContainer.addEventListener('change', (e) => {
        const notifyToggle = e.target.closest('.notify-toggle-input');
        if (!notifyToggle) return;
        
        const appointmentId = notifyToggle.dataset.id;
        const appointment = tempBcmDB.dryWeightAppointments.find(a => a.id.toString() === appointmentId);
        
        if (appointment) {
            appointment.notify = notifyToggle.checked;
            store.saveBcmData(tempBcmDB); // <-- GUARDAR EN STORE
            console.log(`Cita ${appointmentId} notificación: ${appointment.notify}`);
        }
    });
}

// --- (injectBcmStyles no cambia) ---
function injectBcmStyles() {
    const styleId = 'bcm-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .liquid-log-entry { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); padding: 0.25rem 0; border-bottom: 1px solid var(--border-color); }
        .summary-card.limit-exceeded { background-color: #FFEBEE !important; border-color: #C62828 !important; }
        body.dark-theme .summary-card.limit-exceeded { background-color: #4b2222 !important; border-color: #ef9a9a !important; }
        .summary-card.limit-exceeded, .summary-card.limit-exceeded * { color: #C62828 !important; }
        body.dark-theme .summary-card.limit-exceeded, body.dark-theme .summary-card.limit-exceeded * { color: #ffcdd2 !important; }
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

// --- (init() no cambia) ---
export function init() {
    tempBcmDB = store.getBcmData(); // Cargar datos del store
    injectBcmStyles();
    
    const weightModal = document.getElementById('bcm-weight-modal');
    const liquidModal = document.getElementById('bcm-liquid-modal');
    const appointmentModal = document.getElementById('bcm-appointment-modal');
    const weightForm = document.getElementById('bcm-weight-form');
    const liquidForm = document.getElementById('bcm-liquid-form');
    const appointmentForm = document.getElementById('bcm-appointment-form');

    function openModal(modal) { if (modal) modal.classList.remove('hidden'); }
    function closeModal(modal) { if (modal) modal.classList.add('hidden'); }
    
    document.getElementById('add-bcm-initial-btn')?.addEventListener('click', () => {
        if (weightForm) weightForm.reset();
        openModal(weightModal);
    });
    document.getElementById('add-bcm-main-btn')?.addEventListener('click', () => {
        if (weightForm && tempBcmDB.currentWeight !== null) {
            document.getElementById('bcm-current-weight').value = tempBcmDB.currentWeight;
            document.getElementById('bcm-dry-weight').value = tempBcmDB.dryWeight;
        }
        openModal(weightModal);
    });
     document.getElementById('update-weight-btn')?.addEventListener('click', () => {
        if (weightForm && tempBcmDB.currentWeight !== null) {
            document.getElementById('bcm-current-weight').value = tempBcmDB.currentWeight;
            document.getElementById('bcm-dry-weight').value = tempBcmDB.dryWeight;
        }
        openModal(weightModal);
    });
    document.getElementById('add-liquid-btn')?.addEventListener('click', () => {
        if (liquidForm) liquidForm.reset();
        openModal(liquidModal);
    });
    document.getElementById('add-appointment-btn')?.addEventListener('click', () => {
        if (appointmentForm) appointmentForm.reset();
        openModal(appointmentModal);
    });

    document.getElementById('cancel-weight-btn')?.addEventListener('click', () => closeModal(weightModal));
    document.getElementById('cancel-liquid-btn')?.addEventListener('click', () => closeModal(liquidModal));
    document.getElementById('cancel-appointment-btn')?.addEventListener('click', () => closeModal(appointmentModal));

    if (weightForm) weightForm.addEventListener('submit', (e) => {
        e.preventDefault();
        tempBcmDB.currentWeight = parseFloat(document.getElementById('bcm-current-weight').value);
        tempBcmDB.dryWeight = parseFloat(document.getElementById('bcm-dry-weight').value);
        if (tempBcmDB.dryWeight > tempBcmDB.currentWeight) {
            alert('Error: El Peso Seco no puede ser mayor que el Peso Actual.');
            return;
        }
        if(tempBcmDB.liquids.length === 0) tempBcmDB.liquids = [];
        store.saveBcmData(tempBcmDB); // <-- GUARDAR EN STORE
        closeModal(weightModal);
        renderBcmData();
    });
    if (liquidForm) liquidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(document.getElementById('bcm-liquid-amount').value);
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        if (amount > 0) tempBcmDB.liquids.push({ time, amount });
        store.saveBcmData(tempBcmDB); // <-- GUARDAR EN STORE
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
            notify: true, 
            attended: null
        };
        tempBcmDB.dryWeightAppointments.push(newAppointment);
        store.saveBcmData(tempBcmDB); // <-- GUARDAR EN STORE
        closeModal(appointmentModal);
        renderBcmData();
    });

    renderBcmData();
}