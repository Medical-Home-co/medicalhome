// --- pages/terapias.js ---
import { store } from '../store.js';
// --- INICIO ALARMAS ---
import { syncAlarmWithFirestore, deleteAlarmFromFirestore } from '../alarm-manager.js';
// --- FIN ALARMAS ---

let tempTerapiasDB = [];
let terapiaForm, formModal, ambulatorioFields, formTitle;

// --- Función para renderizar la lista de terapias ---
function renderTerapiasList() {
    const listContainer = document.getElementById('terapias-list-container');
    const emptyState = document.getElementById('terapias-empty-state');
    const addTerapiasMainBtn = document.getElementById('add-terapia-main-btn');

    if (!listContainer || !emptyState || !addTerapiasMainBtn) {
        console.warn("Elementos UI Terapias faltan.");
        return;
    }
    
    listContainer.innerHTML = '';

    if (tempTerapiasDB.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addTerapiasMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addTerapiasMainBtn.classList.remove('hidden');

        tempTerapiasDB.forEach(terapia => {
            const terapiaCard = document.createElement('div');
            terapiaCard.className = 'summary-card';
            terapiaCard.style.padding = '1rem';

            const date = new Date(terapia.date + 'T00:00:00');
            const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const isNotifyChecked = terapia.notify ? 'checked' : '';
            const locationInfo = terapia.type === 'ambulatorio' 
                ? `${terapia.entity || 'N/A'} - ${terapia.address || 'N/A'}` 
                : 'Domicilio';

            terapiaCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${terapia.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">${terapia.professional || 'Sin profesional asignado'}</p>
                        <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/calendar.svg" alt="Fecha" style="width: 14px; height: 14px;">
                                <span>${formattedDate} • ${terapia.time}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/location.svg" alt="Lugar" style="width: 14px; height: 14px;">
                                <span>${locationInfo}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="icon-button edit-btn" data-id="${terapia.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${terapia.id}"><img src="images/icons/trash.svg" class="icon-delete" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-footer" style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 0.9rem; font-weight: 600;">¿Asistió?</span>
                        <div class="attendance-buttons" data-id="${terapia.id}" style="display: flex; gap: 0.5rem;">
                            <button class="button attendance-btn ${terapia.attended === true ? 'attended-yes' : ''}" data-action="yes">Sí</button>
                            <button class="button attendance-btn ${terapia.attended === false ? 'attended-no' : ''}" data-action="no">No</button>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                         <label class="switch">
                            <input type="checkbox" class="notify-toggle" data-id="${terapia.id}" ${isNotifyChecked}> 
                            <span class="slider"></span>
                         </label>
                    </div>
                </div>
            `;
            listContainer.appendChild(terapiaCard);
        });
    }
    attachEventListeners();
}

function openFormModal(terapia = null) {
    if (!terapiaForm) return;
    terapiaForm.reset();
    document.getElementById('terapia-id').value = '';
    ambulatorioFields.classList.add('hidden');
    formTitle.textContent = 'Agregar Terapia';

    if (terapia) {
        formTitle.textContent = 'Editar Terapia';
        document.getElementById('terapia-id').value = terapia.id;
        document.getElementById('terapia-name').value = terapia.name || '';
        document.getElementById('terapia-date').value = terapia.date || '';
        document.getElementById('terapia-time').value = terapia.time || '';
        document.getElementById('terapia-professional').value = terapia.professional || '';
        document.getElementById('terapia-type').value = terapia.type || 'domiciliario';
        if (terapia.type === 'ambulatorio') {
            ambulatorioFields.classList.remove('hidden');
            document.getElementById('terapia-entity').value = terapia.entity || '';
            document.getElementById('terapia-address').value = terapia.address || '';
            document.getElementById('terapia-phone').value = terapia.phone || '';
        }
    }
    formModal.classList.remove('hidden');
}

function closeFormModal() {
    formModal.classList.add('hidden');
}

function attachEventListeners() {
    const listContainer = document.getElementById('terapias-list-container');
    if (!listContainer) return;
    const newContainer = listContainer.cloneNode(true);
    listContainer.parentNode.replaceChild(newContainer, listContainer);

    newContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const attendanceBtn = e.target.closest('.attendance-btn');
        const editBtn = e.target.closest('.edit-btn');

        if (deleteBtn) {
            if (confirm('¿Eliminar esta terapia?')) {
                const terapiaId = parseInt(deleteBtn.dataset.id, 10);
                tempTerapiasDB = tempTerapiasDB.filter(t => t.id !== terapiaId);
                store.saveTerapias(tempTerapiasDB);
                // --- INICIO ALARMAS (CORREGIDO) ---
                if (!store.isGuestMode()) {
                    deleteAlarmFromFirestore(terapiaId, 'terapia');
                }
                // --- FIN ALARMAS ---
                renderTerapiasList();
            }
        } else if (attendanceBtn) {
            const container = attendanceBtn.closest('.attendance-buttons');
            const terapiaId = parseInt(container.dataset.id, 10);
            const action = attendanceBtn.dataset.action;
            const terapia = tempTerapiasDB.find(t => t.id === terapiaId);
            if (terapia && (terapia.attended !== (action === 'yes'))) {
                terapia.attended = (action === 'yes');
                store.saveTerapias(tempTerapiasDB);
                container.querySelectorAll('.attendance-btn').forEach(btn => btn.classList.remove('attended-yes', 'attended-no'));
                attendanceBtn.classList.add(action === 'yes' ? 'attended-yes' : 'attended-no');
            }
        } else if (editBtn) {
             const terapiaId = parseInt(editBtn.dataset.id, 10);
             const terapiaToEdit = tempTerapiasDB.find(t => t.id === terapiaId);
             if (terapiaToEdit) {
                 openFormModal(terapiaToEdit);
             }
        }
    });

    newContainer.addEventListener('change', (e) => {
        const notifyToggle = e.target.closest('.notify-toggle');
        if (notifyToggle) {
            const terapiaId = parseInt(notifyToggle.dataset.id, 10);
            const isChecked = notifyToggle.checked;
            const terapia = tempTerapiasDB.find(t => t.id === terapiaId);
            if (terapia) {
                terapia.notify = isChecked;
                store.saveTerapias(tempTerapiasDB);
                // --- INICIO ALARMAS (CORREGIDO) ---
                if (!store.isGuestMode()) {
                    syncAlarmWithFirestore(terapia, 'terapia');
                }
                // --- FIN ALARMAS ---
            }
        }
    });
}


export function init() {
    tempTerapiasDB = store.getTerapias() || [];

    formModal = document.getElementById('terapias-form-modal');
    const addTerapiasInitialBtn = document.getElementById('add-terapia-initial-btn');
    const addTerapiasMainBtn = document.getElementById('add-terapia-main-btn');
    const cancelTerapiaBtn = document.getElementById('cancel-terapia-btn');
    terapiaForm = document.getElementById('terapia-form');
    const terapiaTypeSelect = document.getElementById('terapia-type');
    ambulatorioFields = document.getElementById('ambulatorio-fields');
    formTitle = document.getElementById('terapia-form-title');
    
    if (!formModal || !terapiaForm || !addTerapiasInitialBtn || !addTerapiasMainBtn || !cancelTerapiaBtn || !terapiaTypeSelect || !ambulatorioFields) {
        console.error("Faltan elementos HTML esenciales en terapias.html.");
        document.getElementById('terapias-empty-state')?.classList.remove('hidden');
        return;
    }

    addTerapiasInitialBtn.addEventListener('click', () => openFormModal(null));
    addTerapiasMainBtn.addEventListener('click', () => openFormModal(null));
    cancelTerapiaBtn.addEventListener('click', closeFormModal);

    terapiaTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'ambulatorio') {
            ambulatorioFields.classList.remove('hidden');
        } else {
            ambulatorioFields.classList.add('hidden');
        }
    });

    terapiaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(terapiaForm);
        const terapiaIdValue = document.getElementById('terapia-id').value;
        const id = terapiaIdValue ? parseInt(terapiaIdValue, 10) : Date.now();

        const terapiaData = {
            id: id,
            name: formData.get('name'),
            date: formData.get('date'),
            time: formData.get('time'),
            professional: formData.get('professional'),
            type: formData.get('type'),
            entity: formData.get('entity'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            attended: null,
            notify: true
        };
        terapiaData.location = terapiaData.type === 'ambulatorio' ? terapiaData.entity : 'Domicilio';

        const existingIndex = terapiaIdValue ? tempTerapiasDB.findIndex(t => t.id === id) : -1;

        if (existingIndex > -1) {
            terapiaData.attended = tempTerapiasDB[existingIndex].attended;
            terapiaData.notify = tempTerapiasDB[existingIndex].notify;
            tempTerapiasDB[existingIndex] = terapiaData;
        } else {
            tempTerapiasDB.push(terapiaData);
        }

        store.saveTerapias(tempTerapiasDB);
        
        // --- INICIO ALARMAS (CORREGIDO) ---
        if (!store.isGuestMode()) {
            syncAlarmWithFirestore(terapiaData, 'terapia');
        }
        // --- FIN ALARMAS ---
        
        closeFormModal();
        renderTerapiasList();
    });

    renderTerapiasList();
}