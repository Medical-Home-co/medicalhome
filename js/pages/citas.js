/* --- pages/citas.js --- */
import { store } from '../store.js';

let currentCitasData = [];
let formModal, form;

function renderCitasList() {
    const listContainer = document.getElementById('citas-list-container');
    const emptyState = document.getElementById('citas-empty-state');
    const addCitaMainBtn = document.getElementById('add-cita-main-btn');
    if (!listContainer || !emptyState || !addCitaMainBtn) { console.warn("Elementos UI Citas faltan."); return; }
    
    listContainer.innerHTML = '';

    if (currentCitasData.length === 0) {
        emptyState.classList.remove('hidden'); listContainer.classList.add('hidden'); addCitaMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); listContainer.classList.remove('hidden'); addCitaMainBtn.classList.remove('hidden');
        const sortedData = [...currentCitasData].sort((a, b) => new Date(a.date) - new Date(b.date)); // Próximas primero
        sortedData.forEach(cita => {
            const citaCard = document.createElement('div');
            citaCard.className = 'summary-card'; citaCard.style.padding = '1rem';
            let formattedDate = 'Fecha inválida';
            try { if(cita.date) formattedDate = new Date(cita.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) {}
            const isNotifyChecked = cita.notify ? 'checked' : '';

            citaCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${cita.name || 'Cita'}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">${cita.doctor || 'Sin profesional'}</p>
                        <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/calendar.svg" alt="Fecha" style="width: 14px; height: 14px;">
                                <span>${formattedDate} • ${cita.time || ''}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/location.svg" alt="Lugar" style="width: 14px; height: 14px;">
                                <span>${cita.location || 'N/A'}</span>
                            </div>
                            ${cita.companion ? `<div style="display: flex; align-items: center; gap: 0.5rem;"><img src="images/icons/users.svg" alt="Acompañante" style="width: 14px; height: 14px;"><span>Acompañante: ${cita.companion}</span></div>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="icon-button edit-btn" data-id="${cita.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${cita.id}"><img src="images/icons/trash-2.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-footer" style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 0.9rem; font-weight: 600;">¿Asistió?</span>
                        <div class="attendance-buttons" data-id="${cita.id}" style="display: flex; gap: 0.5rem;">
                            <button class="button attendance-btn ${cita.attended === true ? 'attended-yes' : ''}" data-action="yes">Sí</button>
                            <button class="button attendance-btn ${cita.attended === false ? 'attended-no' : ''}" data-action="no">No</button>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                         <span style="font-size: 0.9rem; font-weight: 600;">Recordatorio</span>
                         <label class="switch">
                            <input type="checkbox" class="notify-toggle" data-id="${cita.id}" ${isNotifyChecked}>
                            <span class="slider"></span>
                         </label>
                    </div>
                </div>
            `;
            listContainer.appendChild(citaCard);
        });
    }
    attachEventListeners();
}

function openFormModal(cita = null) {
    if (!form || !formModal) return;
    form.reset();
    document.getElementById('cita-id').value = '';
    document.getElementById('cita-form-title').textContent = 'Agregar Cita';
    if (cita) {
        document.getElementById('cita-form-title').textContent = 'Editar Cita';
        document.getElementById('cita-id').value = cita.id;
        form.elements['name'].value = cita.name || '';
        form.elements['date'].value = cita.date || '';
        form.elements['time'].value = cita.time || '';
        form.elements['location'].value = cita.location || '';
        form.elements['doctor'].value = cita.doctor || '';
        form.elements['companion'].value = cita.companion || '';
    }
    formModal.classList.remove('hidden');
}
function closeFormModal() { formModal?.classList.add('hidden'); }

function handleFormSubmit(e) {
    e.preventDefault();
    const idValue = document.getElementById('cita-id').value;
    const id = idValue ? parseInt(idValue, 10) : Date.now();
    const data = {
        id: id, name: form.elements['name'].value, date: form.elements['date'].value,
        time: form.elements['time'].value, location: form.elements['location'].value,
        doctor: form.elements['doctor'].value, companion: form.elements['companion'].value,
        attended: null, notify: true // 'notify' en lugar de 'reminders'
    };
    if (idValue) {
        const index = currentCitasData.findIndex(c => c.id === id);
        if (index > -1) { data.attended = currentCitasData[index].attended; data.notify = currentCitasData[index].notify; currentCitasData[index] = data; }
    } else {
        currentCitasData.push(data);
    }
    store.saveCitas(currentCitasData);
    closeFormModal();
    renderCitasList();
}

function attachEventListeners() {
    const listContainer = document.getElementById('citas-list-container');
    if (!listContainer) return;
    const newContainer = listContainer.cloneNode(true);
    listContainer.parentNode.replaceChild(newContainer, listContainer);

    newContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn'); const editBtn = e.target.closest('.edit-btn'); const attendanceBtn = e.target.closest('.attendance-btn');
        const idStr = deleteBtn?.dataset.id || editBtn?.dataset.id || attendanceBtn?.closest('.attendance-buttons')?.dataset.id;
        if (!idStr) return;
        const citaId = parseInt(idStr, 10);
        
        if (deleteBtn) {
            if (confirm('¿Eliminar esta cita?')) { currentCitasData = currentCitasData.filter(c => c.id !== citaId); store.saveCitas(currentCitasData); renderCitasList(); }
        } else if (editBtn) {
            const citaToEdit = currentCitasData.find(c => c.id === citaId); if (citaToEdit) openFormModal(citaToEdit);
        } else if (attendanceBtn) {
            const action = attendanceBtn.dataset.action; const cita = currentCitasData.find(c => c.id === citaId);
            if (cita) { cita.attended = (action === 'yes'); store.saveCitas(currentCitasData); attendanceBtn.closest('.attendance-buttons').querySelectorAll('.attendance-btn').forEach(btn => btn.classList.remove('attended-yes', 'attended-no')); attendanceBtn.classList.add(action === 'yes' ? 'attended-yes' : 'attended-no'); }
        }
    });

    newContainer.addEventListener('change', (e) => {
        const notifyToggle = e.target.closest('.notify-toggle');
        if (notifyToggle) {
            const citaId = parseInt(notifyToggle.dataset.id, 10); const isChecked = notifyToggle.checked; const cita = currentCitasData.find(c => c.id === citaId);
            if (cita) { cita.notify = isChecked; store.saveCitas(currentCitasData); }
        }
    });
}

export function init() {
    currentCitasData = store.getCitas() || [];
    console.log("Cargado js/pages/citas.js (conectado a store)");

    formModal = document.getElementById('citas-form-modal');
    form = document.getElementById('cita-form');
    const addInitialBtn = document.getElementById('add-cita-initial-btn');
    const addCitaMainBtn = document.getElementById('add-cita-main-btn');
    const cancelCitaBtn = document.getElementById('cancel-cita-btn');

    // SOLUCIÓN: Comprobar elementos
    if (!formModal || !form || !addInitialBtn || !addCitaMainBtn || !cancelCitaBtn) {
         console.error("Faltan elementos HTML esenciales en citas.html.");
         document.getElementById('citas-empty-state')?.classList.remove('hidden');
         return;
    }

    addInitialBtn.addEventListener('click', () => openFormModal());
    addCitaMainBtn.addEventListener('click', () => openFormModal());
    cancelCitaBtn.addEventListener('click', closeFormModal);
    form.addEventListener('submit', handleFormSubmit);
    renderCitasList();
}