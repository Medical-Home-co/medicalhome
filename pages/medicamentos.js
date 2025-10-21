// --- pages/medicamentos.js ---
import { store } from '../store.js'; // <-- SOLUCIÓN: Importar el store

// La DB ahora se carga desde el store en la función init()
let tempMedsDB = [];

// --- Función para renderizar la lista de medicamentos ---
function renderMedsList(formModal) {
    const listContainer = document.getElementById('meds-list-container');
    const emptyState = document.getElementById('meds-empty-state');
    const addMedMainBtn = document.getElementById('add-med-main-btn'); // Botón del encabezado
    
    listContainer.innerHTML = ''; // Limpiar la lista antes de volver a dibujar

    if (tempMedsDB.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMedMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMedMainBtn.classList.remove('hidden');
        
        tempMedsDB.forEach(med => {
            const medCard = document.createElement('div');
            medCard.className = 'summary-card';
            medCard.style.padding = '1rem';

            const schedulesHTML = med.schedules.map(time => `
                <div style="display: flex; align-items: center; gap: 0.5rem; background-color: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 6px;">
                    <img src="images/icons/clock.svg" alt="Reloj" style="width: 14px; height: 14px;">
                    <span>${time}</span>
                </div>
            `).join('');

            // === SOLUCIÓN: El 'notify' del med se usa en el 'checked' ===
            medCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${med.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0.25rem 0 0.75rem;">${med.dose} • ${med.frequencyText}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">${schedulesHTML}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="icon-button edit-btn" data-id="${med.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${med.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">Recordatorios</span>
                    <label class="switch">
                        <input type="checkbox" class="notify-toggle" data-id="${med.id}" ${med.notify ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            listContainer.appendChild(medCard);
        });
    }

    // --- Listeners de la Tarjeta (ahora guardan en el store) ---
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const medId = parseInt(e.currentTarget.dataset.id, 10);
            tempMedsDB = tempMedsDB.filter(m => m.id !== medId);
            store.saveMeds(tempMedsDB); // <-- SOLUCIÓN: Guardar en el store
            renderMedsList(formModal);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const medId = parseInt(e.currentTarget.dataset.id, 10);
            const medToEdit = tempMedsDB.find(m => m.id === medId);
            if (medToEdit) {
                document.getElementById('form-title').textContent = 'Editar Medicamento';
                document.getElementById('med-id').value = medToEdit.id;
                document.getElementById('med-name').value = medToEdit.name;
                document.getElementById('med-dose').value = medToEdit.dose;
                document.getElementById('med-notes').value = medToEdit.notes;
                // (Aquí faltaría rellenar la frecuencia y horarios, pero el ID se guarda)
                formModal.classList.remove('hidden');
            }
        });
    });

    // === SOLUCIÓN: Listener para el toggle que guarda en el store ===
    document.querySelectorAll('.notify-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const medId = parseInt(e.currentTarget.dataset.id, 10);
            const med = tempMedsDB.find(m => m.id === medId);
            if(med) {
                med.notify = e.currentTarget.checked;
                store.saveMeds(tempMedsDB); // <-- Guardar cambio en el store
                console.log(`Medicamento ${med.id} notify: ${med.notify}`);
            }
        });
    });
}

export function init() {
    // === SOLUCIÓN: Cargar datos desde el store ===
    tempMedsDB = store.getMeds();

    const formModal = document.getElementById('meds-form-modal');
    const addMedInitialBtn = document.getElementById('add-med-initial-btn');
    const addMedMainBtn = document.getElementById('add-med-main-btn');
    const cancelMedBtn = document.getElementById('cancel-med-btn');
    const medForm = document.getElementById('med-form');
    const frequencySelect = document.getElementById('med-frequency');
    const schedulesContainer = document.getElementById('med-schedules-container');
    const customFrequencyContainer = document.getElementById('custom-frequency-container');

    function openFormModal() {
        medForm.reset();
        document.getElementById('form-title').textContent = 'Agregar Medicamento';
        document.getElementById('med-id').value = '';
        customFrequencyContainer.classList.add('hidden');
        updateScheduleInputs(1);
        formModal.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal.classList.add('hidden');
    }

    addMedInitialBtn.addEventListener('click', openFormModal);
    addMedMainBtn.addEventListener('click', openFormModal);
    cancelMedBtn.addEventListener('click', closeFormModal);

    frequencySelect.addEventListener('change', () => {
        const value = frequencySelect.value;
        if (value === 'custom') {
            customFrequencyContainer.classList.remove('hidden');
            updateScheduleInputs(1); 
        } else {
            customFrequencyContainer.classList.add('hidden');
            updateScheduleInputs(parseInt(value));
        }
    });

    medForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(medForm);
        const schedules = Array.from(schedulesContainer.querySelectorAll('input[type="time"]')).map(input => input.value);
        
        // (ID se convierte a número)
        const medId = parseInt(document.getElementById('med-id').value, 10) || Date.now();
        
        const newMed = {
            id: medId,
            name: formData.get('name'),
            dose: formData.get('dose'),
            frequencyValue: formData.get('frequency'),
            frequencyText: frequencySelect.options[frequencySelect.selectedIndex].text.split('(')[0].trim(),
            schedules: schedules.filter(Boolean),
            notes: formData.get('notes'),
            notify: true // <-- SOLUCIÓN: Se guarda el estado del toggle
        };

        const existingIndex = tempMedsDB.findIndex(m => m.id === newMed.id);
        if (existingIndex > -1) {
            // (Al editar, mantener el estado 'notify' anterior si ya existía)
            newMed.notify = tempMedsDB[existingIndex].notify;
            tempMedsDB[existingIndex] = newMed;
        } else {
            tempMedsDB.push(newMed);
        }

        store.saveMeds(tempMedsDB); // <-- SOLUCIÓN: Guardar en el store
        closeFormModal();
        renderMedsList(formModal);
    });

    function updateScheduleInputs(count) {
        const label = schedulesContainer.querySelector('label');
        schedulesContainer.innerHTML = '';
        if (label) schedulesContainer.appendChild(label); // Vuelve a poner el label si existe

        for (let i = 1; i <= count; i++) {
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.className = 'form-input';
            timeInput.required = true;
            timeInput.style.marginTop = '0.5rem';
            schedulesContainer.appendChild(timeInput);
        }
    }

    renderMedsList(formModal);
}