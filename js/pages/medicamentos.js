/* --- pages/medicamentos.js --- */
import { store } from '../store.js'; // <-- 1. Importar store

// 2. Variable local para los datos
let currentMedsData = [];
let formModal, form, frequencySelect, schedulesContainer, customFrequencyContainer; // Elementos

function renderMedsList() {
    const listContainer = document.getElementById('meds-list-container');
    const emptyState = document.getElementById('meds-empty-state');
    const addMedMainBtn = document.getElementById('add-med-main-btn');
    if (!listContainer || !emptyState || !addMedMainBtn) { console.warn("Elementos UI Meds faltan."); return; }
    
    listContainer.innerHTML = '';

    // 3. Usar la variable cargada del store
    if (currentMedsData.length === 0) {
        emptyState.classList.remove('hidden'); listContainer.classList.add('hidden'); addMedMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); listContainer.classList.remove('hidden'); addMedMainBtn.classList.remove('hidden');
        
        currentMedsData.forEach(med => {
            const medCard = document.createElement('div'); // 'medCard' definido aquí
            medCard.className = 'summary-card';
            medCard.style.padding = '1rem';

            const schedulesHTML = (med.schedules || []).map(time => `
                <div style="display: flex; align-items: center; gap: 0.5rem; background-color: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 6px;">
                    <img src="images/icons/clock.svg" alt="Reloj" style="width: 14px; height: 14px;">
                    <span>${time}</span>
                </div>
            `).join('');

            medCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${med.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.25rem 0 0.75rem;">${med.dose} • ${med.frequencyText}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">${schedulesHTML}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="icon-button edit-btn" data-id="${med.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${med.id}"><img src="images/icons/trash-2.svg" class="icon-delete" alt="Eliminar"></button>
                    </div>
                </div>
                <div style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                    <label class="switch">
                        <input type="checkbox" class="notify-toggle" data-id="${med.id}" ${med.notify ? 'checked' : ''}> 
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            // SOLUCIÓN: Usar medCard, no card.
            listContainer.appendChild(medCard); 
        });
    }
    attachEventListeners(); // 4. Llamar a listeners
}

function openFormModal(medToEdit = null) {
    if (!form || !formModal) return;
    form.reset();
    document.getElementById('form-title').textContent = 'Agregar Medicamento';
    document.getElementById('med-id').value = '';
    customFrequencyContainer.classList.add('hidden');
    updateScheduleInputs(1);

    if (medToEdit) {
        document.getElementById('form-title').textContent = 'Editar Medicamento';
        document.getElementById('med-id').value = medToEdit.id;
        document.getElementById('med-name').value = medToEdit.name;
        document.getElementById('med-dose').value = medToEdit.dose;
        document.getElementById('med-notes').value = medToEdit.notes || '';
        document.getElementById('med-frequency').value = medToEdit.frequencyValue || '1';
        frequencySelect.dispatchEvent(new Event('change'));
        if (medToEdit.schedules && medToEdit.schedules.length > 0) {
            updateScheduleInputs(medToEdit.schedules.length);
            const scheduleInputs = schedulesContainer.querySelectorAll('input[type="time"]');
            scheduleInputs.forEach((input, index) => { input.value = medToEdit.schedules[index] || ''; });
        }
    }
    formModal.classList.remove('hidden');
}

function closeFormModal() { formModal?.classList.add('hidden'); }

function updateScheduleInputs(count) {
    const label = schedulesContainer.querySelector('label');
    schedulesContainer.innerHTML = '';
    if (label) schedulesContainer.appendChild(label);
    for (let i = 1; i <= count; i++) {
        const timeInput = document.createElement('input'); timeInput.type = 'time'; timeInput.className = 'form-input'; timeInput.required = true; timeInput.style.marginTop = '0.5rem';
        schedulesContainer.appendChild(timeInput);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const schedules = Array.from(schedulesContainer.querySelectorAll('input[type="time"]')).map(input => input.value).filter(Boolean);
    const medIdValue = document.getElementById('med-id').value;
    const id = medIdValue ? parseInt(medIdValue, 10) : Date.now();
    
    const newMed = {
        id: id, name: formData.get('name'), dose: formData.get('dose'),
        frequencyValue: formData.get('frequency'), frequencyText: frequencySelect.options[frequencySelect.selectedIndex].text.split('(')[0].trim(),
        schedules: schedules, notes: formData.get('notes'),
        notify: true // Default 'notify' a true
    };

    if (medIdValue) {
        const index = currentMedsData.findIndex(m => m.id === id);
        if (index > -1) { newMed.notify = currentMedsData[index].notify; currentMedsData[index] = newMed; } // Mantener estado de notify
    } else {
        currentMedsData.push(newMed);
    }
    store.saveMeds(currentMedsData); // <-- 5. GUARDAR
    closeFormModal();
    renderMedsList();
}

function attachEventListeners() {
    const listContainer = document.getElementById('meds-list-container');
    if (!listContainer) return;
    const newContainer = listContainer.cloneNode(true);
    listContainer.parentNode.replaceChild(newContainer, listContainer);

    newContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn'); const editBtn = e.target.closest('.edit-btn');
        const medIdStr = deleteBtn?.dataset.id || editBtn?.dataset.id;
        if (!medIdStr) return;
        const medId = parseInt(medIdStr, 10);
        if (deleteBtn) {
            if (confirm('¿Eliminar este medicamento?')) {
                currentMedsData = currentMedsData.filter(m => m.id !== medId);
                store.saveMeds(currentMedsData); // <-- 5. GUARDAR
                renderMedsList();
            }
        } else if (editBtn) {
            const medToEdit = currentMedsData.find(m => m.id === medId);
            if (medToEdit) openFormModal(medToEdit);
        }
    });

    newContainer.addEventListener('change', (e) => {
        const notifyToggle = e.target.closest('.notify-toggle');
        if (notifyToggle) {
            const medId = parseInt(notifyToggle.dataset.id, 10);
            const isChecked = notifyToggle.checked;
            const med = currentMedsData.find(m => m.id === medId);
            if (med) { med.notify = isChecked; store.saveMeds(currentMedsData); /* <-- 5. GUARDAR */ }
        }
    });
}

export function init() {
    currentMedsData = store.getMeds() || []; // <-- 6. Cargar desde store
    console.log("Cargado js/pages/medicamentos.js (conectado a store)");

    formModal = document.getElementById('meds-form-modal');
    form = document.getElementById('med-form');
    const addInitialBtn = document.getElementById('add-med-initial-btn');
    const addMainBtn = document.getElementById('add-med-main-btn');
    const cancelMedBtn = document.getElementById('cancel-med-btn');
    frequencySelect = document.getElementById('med-frequency');
    schedulesContainer = document.getElementById('med-schedules-container');
    customFrequencyContainer = document.getElementById('custom-frequency-container');

    // SOLUCIÓN: Comprobación de elementos
    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelMedBtn || !frequencySelect || !schedulesContainer || !customFrequencyContainer) {
        console.error("Faltan elementos HTML esenciales en medicamentos.html.");
        document.getElementById('meds-empty-state')?.classList.remove('hidden'); // Mostrar estado vacío
        return; // Detener ejecución
    }

    addInitialBtn.addEventListener('click', () => openFormModal());
    addMainBtn.addEventListener('click', () => openFormModal());
    cancelMedBtn.addEventListener('click', closeFormModal);
    frequencySelect.addEventListener('change', () => {
        const value = frequencySelect.value;
        if (value === 'custom') { customFrequencyContainer.classList.remove('hidden'); updateScheduleInputs(1); }
        else { customFrequencyContainer.classList.add('hidden'); updateScheduleInputs(parseInt(value)); }
    });
    form.addEventListener('submit', handleFormSubmit);

    renderMedsList();
}