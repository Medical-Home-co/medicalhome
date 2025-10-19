// --- Base de Datos Temporal (para el modo invitado) ---
// La movemos fuera de init para que persista mientras navegas por la app.
// Se reiniciará solo al recargar la página.
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
        addMedMainBtn.classList.add('hidden'); // Ocultar el botón del encabezado si no hay meds
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMedMainBtn.classList.remove('hidden'); // Mostrar el botón del encabezado
        
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
                        <input type="checkbox" ${med.reminders ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
            listContainer.appendChild(medCard);
        });
    }

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const medId = e.currentTarget.dataset.id;
            tempMedsDB = tempMedsDB.filter(m => m.id.toString() !== medId);
            renderMedsList(formModal);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const medId = e.currentTarget.dataset.id;
            const medToEdit = tempMedsDB.find(m => m.id.toString() === medId);
            if (medToEdit) {
                document.getElementById('form-title').textContent = 'Editar Medicamento';
                document.getElementById('med-id').value = medToEdit.id;
                document.getElementById('med-name').value = medToEdit.name;
                document.getElementById('med-dose').value = medToEdit.dose;
                document.getElementById('med-notes').value = medToEdit.notes;
                // Lógica futura para rellenar frecuencia y horarios
                formModal.classList.remove('hidden');
            }
        });
    });
}

export function init() {
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
        
        const newMed = {
            id: document.getElementById('med-id').value || Date.now(),
            name: formData.get('name'),
            dose: formData.get('dose'),
            frequencyValue: formData.get('frequency'),
            frequencyText: frequencySelect.options[frequencySelect.selectedIndex].text.split('(')[0].trim(),
            schedules: schedules.filter(Boolean), // Filtra horarios vacíos
            notes: formData.get('notes'),
            reminders: true
        };

        const existingIndex = tempMedsDB.findIndex(m => m.id.toString() === newMed.id.toString());
        if (existingIndex > -1) {
            tempMedsDB[existingIndex] = newMed;
        } else {
            tempMedsDB.push(newMed);
        }

        closeFormModal();
        renderMedsList(formModal);
    });

    function updateScheduleInputs(count) {
        // Primero, quita el label
        const label = schedulesContainer.querySelector('label');
        schedulesContainer.innerHTML = '';
        schedulesContainer.appendChild(label); // Vuelve a poner el label

        for (let i = 1; i <= count; i++) {
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.className = 'form-input';
            timeInput.required = true;
            timeInput.style.marginTop = '0.5rem';
            schedulesContainer.appendChild(timeInput);
        }
    }

    // Renderizado inicial al cargar la página
    renderMedsList(formModal);
}

