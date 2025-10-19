// --- Base de Datos Temporal para Citas ---
let tempCitasDB = [];

// --- Función para renderizar la lista de citas ---
function renderCitasList() {
    const listContainer = document.getElementById('citas-list-container');
    const emptyState = document.getElementById('citas-empty-state');
    const addCitaMainBtn = document.getElementById('add-cita-main-btn');

    listContainer.innerHTML = ''; // Limpiamos para evitar duplicados

    if (tempCitasDB.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addCitaMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addCitaMainBtn.classList.remove('hidden');

        tempCitasDB.forEach(cita => {
            const citaCard = document.createElement('div');
            citaCard.className = 'summary-card';
            citaCard.style.padding = '1rem';

            const date = new Date(cita.date + 'T00:00:00'); // Corregir zona horaria
            const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            // Determina si el interruptor de recordatorio debe estar activado
            const isReminderChecked = cita.reminders ? 'checked' : '';

            citaCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${cita.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">${cita.doctor}</p>
                        <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/calendar.svg" alt="Fecha" style="width: 14px; height: 14px;">
                                <span>${formattedDate} • ${cita.time}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/location.svg" alt="Lugar" style="width: 14px; height: 14px;">
                                <span>${cita.location}</span>
                            </div>
                            ${cita.companion ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/users.svg" alt="Acompañante" style="width: 14px; height: 14px;">
                                <span>Acompañante: ${cita.companion}</span>
                            </div>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="icon-button edit-btn" data-id="${cita.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${cita.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-footer" style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <!-- Asistió Group -->
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 0.9rem; font-weight: 600;">¿Asistió?</span>
                        <div class="attendance-buttons" data-id="${cita.id}" style="display: flex; gap: 0.5rem;">
                            <button class="button attendance-btn ${cita.attended === true ? 'attended-yes' : ''}" data-action="yes">Sí</button>
                            <button class="button attendance-btn ${cita.attended === false ? 'attended-no' : ''}" data-action="no">No</button>
                        </div>
                    </div>
                    <!-- Recordatorio Group -->
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                         <span style="font-size: 0.9rem; font-weight: 600;">Recordatorio</span>
                         <label class="switch">
                            <input type="checkbox" class="reminder-toggle" data-id="${cita.id}" ${isReminderChecked}>
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

// --- Función para manejar los eventos de la página ---
function attachEventListeners() {
    // Listener para botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const citaId = e.currentTarget.dataset.id;
            tempCitasDB = tempCitasDB.filter(c => c.id.toString() !== citaId);
            renderCitasList();
        });
    });

    // Listener para botones de asistencia (Sí/No)
    document.querySelectorAll('.attendance-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const container = e.currentTarget.closest('.attendance-buttons');
            const citaId = container.dataset.id;
            const action = e.currentTarget.dataset.action;
            const citaIndex = tempCitasDB.findIndex(c => c.id.toString() === citaId);
            if (citaIndex > -1) {
                tempCitasDB[citaIndex].attended = (action === 'yes');
            }
            renderCitasList();
        });
    });

    // Listener para el interruptor de recordatorio
    document.querySelectorAll('.reminder-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const citaId = e.currentTarget.dataset.id;
            const isChecked = e.currentTarget.checked;
            const citaIndex = tempCitasDB.findIndex(c => c.id.toString() === citaId);
            if (citaIndex > -1) {
                tempCitasDB[citaIndex].reminders = isChecked;
                console.log('Recordatorio actualizado:', tempCitasDB[citaIndex]);
            }
        });
    });
}

// --- Función principal que se ejecuta al cargar la página ---
export function init() {
    const formModal = document.getElementById('citas-form-modal');
    const addCitaInitialBtn = document.getElementById('add-cita-initial-btn');
    const addCitaMainBtn = document.getElementById('add-cita-main-btn');
    const cancelCitaBtn = document.getElementById('cancel-cita-btn');
    const citaForm = document.getElementById('cita-form');

    function openFormModal() {
        citaForm.reset();
        document.getElementById('cita-id').value = '';
        formModal.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal.classList.add('hidden');
    }

    addCitaInitialBtn.addEventListener('click', openFormModal);
    addCitaMainBtn.addEventListener('click', openFormModal);
    cancelCitaBtn.addEventListener('click', closeFormModal);

    citaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(citaForm);
        const newCita = {
            id: Date.now(),
            name: formData.get('name'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location'),
            doctor: formData.get('doctor'),
            companion: formData.get('companion'),
            attended: null,
            reminders: true // Por defecto, el recordatorio está activado
        };
        tempCitasDB.push(newCita);
        closeFormModal();
        renderCitasList();
    });

    renderCitasList();
}

