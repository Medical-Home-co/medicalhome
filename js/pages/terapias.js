/* --- pages/terapias.js --- */
import { store } from '../store.js'; // <-- 1. Importar store

// 2. Variable local para los datos
let currentTerapiasData = [];
let formModal, form, terapiaTypeSelect, ambulatorioFields; // Elementos

/* --- Función para renderizar la lista de terapias --- */
function renderTerapiasList() {
    const listContainer = document.getElementById('terapias-list-container');
    const emptyState = document.getElementById('terapias-empty-state');
    const addTerapiasMainBtn = document.getElementById('add-terapia-main-btn');
    if (!listContainer || !emptyState || !addTerapiasMainBtn) { console.error("Elementos UI Terapias faltan."); return; }
    
    listContainer.innerHTML = '';

    // 3. Usar la variable cargada del store
    if (currentTerapiasData.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addTerapiasMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addTerapiasMainBtn.classList.remove('hidden');

        // Ordenar por fecha (más próxima primero)
        const sortedData = [...currentTerapiasData].sort((a, b) => {
             const dateA = new Date(`${a.date || '9999-01-01'}T${a.time || '00:00'}`);
             const dateB = new Date(`${b.date || '9999-01-01'}T${b.time || '00:00'}`);
             return dateA - dateB;
        });

        sortedData.forEach(terapia => {
            const terapiaCard = document.createElement('div');
            terapiaCard.className = 'summary-card';
            terapiaCard.style.padding = '1rem';

            let formattedDate = 'Fecha inválida';
            try { if(terapia.date) formattedDate = new Date(terapia.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) {}
            
            const isNotifyChecked = terapia.notify ? 'checked' : ''; // Usar 'notify'
            const locationInfo = terapia.type === 'ambulatorio' 
                ? `${terapia.entity || 'Clínica'} - ${terapia.address || 'N/A'}` 
                : 'Domicilio';

            terapiaCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${terapia.name || 'Terapia'}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">${terapia.professional || 'Sin profesional'}</p>
                        <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/calendar.svg" alt="Fecha" style="width: 14px; height: 14px;">
                                <span>${formattedDate} • ${terapia.time || ''}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="images/icons/location.svg" alt="Lugar" style="width: 14px; height: 14px;">
                                <span>${locationInfo}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="icon-button edit-btn" data-id="${terapia.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${terapia.id}"><img src="images/icons/trash-2.svg" alt="Eliminar"></button>
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
                         <span style="font-size: 0.9rem; font-weight: 600;">Recordatorio</span>
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
    // 4. Llamar a listeners después de renderizar
    attachEventListeners();
}

/* --- Funciones del Modal --- */
function openFormModal(terapia = null) {
    if (!form || !formModal) return;
    form.reset();
    document.getElementById('terapia-id').value = '';
    document.getElementById('terapia-form-title').textContent = 'Agregar Terapia';
    ambulatorioFields.classList.add('hidden'); // Ocultar campos condicionales

    if (terapia) { // Modo Edición
        document.getElementById('terapia-form-title').textContent = 'Editar Terapia';
        document.getElementById('terapia-id').value = terapia.id;
        form.elements['name'].value = terapia.name || '';
        form.elements['date'].value = terapia.date || '';
        form.elements['time'].value = terapia.time || '';
        form.elements['professional'].value = terapia.professional || '';
        form.elements['type'].value = terapia.type || 'domiciliario';
        form.elements['entity'].value = terapia.entity || '';
        form.elements['address'].value = terapia.address || '';
        form.elements['phone'].value = terapia.phone || '';
        
        // Mostrar campos ambulatorios si es necesario
        if (terapia.type === 'ambulatorio') {
            ambulatorioFields.classList.remove('hidden');
        }
    }
    formModal.classList.remove('hidden');
}
function closeFormModal() { formModal?.classList.add('hidden'); }

/* --- Listener Envío Formulario (Guarda en store) --- */
function handleFormSubmit(e) {
    e.preventDefault();
    const idValue = document.getElementById('terapia-id').value;
    const id = idValue ? parseInt(idValue, 10) : Date.now();
    const formData = new FormData(form);

    const data = {
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
        notify: true // Activo por defecto al crear
    };
    data.location = data.type === 'ambulatorio' ? data.entity : 'Domicilio'; // Definir location

    if (idValue) { // Editando
        const index = currentTerapiasData.findIndex(t => t.id === id);
        if (index > -1) {
            data.attended = currentTerapiasData[index].attended; // Mantener estado
            data.notify = currentTerapiasData[index].notify; // Mantener estado
            currentTerapiasData[index] = data;
        }
    } else { // Agregando
        currentTerapiasData.push(data);
    }

    store.saveTerapias(currentTerapiasData); // <-- 5. GUARDAR
    closeFormModal();
    renderTerapiasList();
}

/* --- Listeners Tarjetas (Editar/Eliminar/Toggle/Asistencia, guarda en store) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('terapias-list-container');
    if (!listContainer) return;
    const newContainer = listContainer.cloneNode(true);
    listContainer.parentNode.replaceChild(newContainer, listContainer);

    newContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        const attendanceBtn = e.target.closest('.attendance-btn');

        if (deleteBtn) {
            const terapiaId = parseInt(deleteBtn.dataset.id, 10);
            if (confirm('¿Eliminar esta terapia?')) {
                currentTerapiasData = currentTerapiasData.filter(t => t.id !== terapiaId);
                store.saveTerapias(currentTerapiasData); // <-- 5. GUARDAR
                renderTerapiasList();
            }
        } else if (editBtn) {
            const terapiaId = parseInt(editBtn.dataset.id, 10);
            const terapiaToEdit = currentTerapiasData.find(t => t.id === terapiaId);
            if (terapiaToEdit) openFormModal(terapiaToEdit);
        } else if (attendanceBtn) {
            const container = attendanceBtn.closest('.attendance-buttons');
            const terapiaId = parseInt(container.dataset.id, 10);
            const action = attendanceBtn.dataset.action;
            const terapia = currentTerapiasData.find(t => t.id === terapiaId);
            if (terapia) {
                terapia.attended = (action === 'yes');
                store.saveTerapias(currentTerapiasData); // <-- 5. GUARDAR
                container.querySelectorAll('.attendance-btn').forEach(btn => btn.classList.remove('attended-yes', 'attended-no'));
                attendanceBtn.classList.add(action === 'yes' ? 'attended-yes' : 'attended-no');
            }
        }
    });

    newContainer.addEventListener('change', (e) => {
        const notifyToggle = e.target.closest('.notify-toggle'); // Clase corregida
        if (notifyToggle) {
            const terapiaId = parseInt(notifyToggle.dataset.id, 10);
            const isChecked = notifyToggle.checked;
            const terapia = currentTerapiasData.find(t => t.id === terapiaId);
            if (terapia) {
                terapia.notify = isChecked; // Usar 'notify'
                store.saveTerapias(currentTerapiasData); // <-- 5. GUARDAR
                console.log('Recordatorio terapia actualizado:', terapia);
            }
        }
    });
}

/* --- Función Principal --- */
export function init() {
    // 6. Cargar datos del store
    currentTerapiasData = store.getTerapias() || [];
    console.log("Cargado js/pages/terapias.js (conectado a store)");

    formModal = document.getElementById('terapias-form-modal');
    form = document.getElementById('terapia-form');
    const addInitialBtn = document.getElementById('add-terapia-initial-btn');
    const addMainBtn = document.getElementById('add-terapia-main-btn');
    const cancelBtn = document.getElementById('cancel-terapia-btn');
    terapiaTypeSelect = document.getElementById('terapia-type');
    ambulatorioFields = document.getElementById('ambulatorio-fields');

    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelBtn || !terapiaTypeSelect || !ambulatorioFields) {
         console.error("Faltan elementos HTML esenciales en terapias.html");
         document.getElementById('terapias-empty-state')?.classList.remove('hidden');
         return;
    }

    addInitialBtn.addEventListener('click', () => openFormModal());
    addMainBtn.addEventListener('click', () => openFormModal());
    cancelBtn.addEventListener('click', closeFormModal);
    
    terapiaTypeSelect.addEventListener('change', (e) => {
        ambulatorioFields.classList.toggle('hidden', e.target.value !== 'ambulatorio');
    });
    
    form.addEventListener('submit', handleFormSubmit);

    renderTerapiasList(); // Renderizado inicial
}