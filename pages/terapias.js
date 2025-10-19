// --- Base de Datos Temporal para Terapias ---
let tempTerapiasDB = [];

// --- Función para renderizar la lista de terapias ---
function renderTerapiasList() {
    const listContainer = document.getElementById('terapias-list-container');
    const emptyState = document.getElementById('terapias-empty-state');
    const addTerapiasMainBtn = document.getElementById('add-terapia-main-btn');

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
            
            const isChecked = terapia.reminders ? 'checked' : '';
            const locationInfo = terapia.type === 'ambulatorio' 
                ? `${terapia.entity} - ${terapia.address}` 
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
                        <button class="icon-button delete-btn" data-id="${terapia.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-footer" style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <!-- Asistió Group -->
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 0.9rem; font-weight: 600;">¿Asistió?</span>
                        <div class="attendance-buttons" data-id="${terapia.id}" style="display: flex; gap: 0.5rem;">
                            <button class="button attendance-btn ${terapia.attended === true ? 'attended-yes' : ''}" data-action="yes">Sí</button>
                            <button class="button attendance-btn ${terapia.attended === false ? 'attended-no' : ''}" data-action="no">No</button>
                        </div>
                    </div>
                    <!-- Recordatorio Group -->
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                         <span style="font-size: 0.9rem; font-weight: 600;">Recordatorio</span>
                         <label class="switch">
                            <input type="checkbox" class="reminder-toggle" data-id="${terapia.id}" ${isChecked}>
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

// --- Función para manejar los eventos de la página ---
function attachEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const terapiaId = e.currentTarget.dataset.id;
            tempTerapiasDB = tempTerapiasDB.filter(t => t.id.toString() !== terapiaId);
            renderTerapiasList();
        });
    });

    document.querySelectorAll('.attendance-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const container = e.currentTarget.closest('.attendance-buttons');
            const terapiaId = container.dataset.id;
            const action = e.currentTarget.dataset.action;
            const terapiaIndex = tempTerapiasDB.findIndex(t => t.id.toString() === terapiaId);
            if (terapiaIndex > -1) {
                tempTerapiasDB[terapiaIndex].attended = (action === 'yes');
            }
            renderTerapiasList();
        });
    });

    document.querySelectorAll('.reminder-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const terapiaId = e.currentTarget.dataset.id;
            const isChecked = e.currentTarget.checked;
            const terapiaIndex = tempTerapiasDB.findIndex(t => t.id.toString() === terapiaId);
            if (terapiaIndex > -1) {
                tempTerapiasDB[terapiaIndex].reminders = isChecked;
            }
        });
    });
}

// --- Función principal que se ejecuta al cargar la página ---
export function init() {
    const formModal = document.getElementById('terapias-form-modal');
    const addTerapiasInitialBtn = document.getElementById('add-terapia-initial-btn');
    const addTerapiasMainBtn = document.getElementById('add-terapia-main-btn');
    const cancelTerapiaBtn = document.getElementById('cancel-terapia-btn');
    const terapiaForm = document.getElementById('terapia-form');
    const terapiaTypeSelect = document.getElementById('terapia-type');
    const ambulatorioFields = document.getElementById('ambulatorio-fields');

    function openFormModal() {
        terapiaForm.reset();
        document.getElementById('terapia-id').value = '';
        ambulatorioFields.classList.add('hidden');
        formModal.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal.classList.add('hidden');
    }

    addTerapiasInitialBtn.addEventListener('click', openFormModal);
    addTerapiasMainBtn.addEventListener('click', openFormModal);
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
        const newTerapia = {
            id: Date.now(),
            name: formData.get('name'),
            date: formData.get('date'),
            time: formData.get('time'),
            professional: formData.get('professional'),
            type: formData.get('type'),
            entity: formData.get('entity'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            attended: null,
            reminders: true
        };
        
        // Determinar el lugar basado en el tipo
        newTerapia.location = newTerapia.type === 'ambulatorio' ? newTerapia.entity : 'Domicilio';

        tempTerapiasDB.push(newTerapia);
        closeFormModal();
        renderTerapiasList();
    });

    renderTerapiasList();
}

