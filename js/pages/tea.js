/* --- pages/tea.js --- */
import { store } from '../store.js'; // Importar store

let currentTeaData = [];
let formModal, form;

/* --- Renderizar Lista --- */
function renderTeaList() {
    const listContainer = document.getElementById('tea-list-container');
    const emptyState = document.getElementById('tea-empty-state');
    const addMainBtn = document.getElementById('add-tea-main-btn');
    if (!listContainer || !emptyState || !addMainBtn) { console.error("Elementos UI TEA faltan."); return; }
    listContainer.innerHTML = '';

    if (currentTeaData.length === 0) {
        emptyState.classList.remove('hidden'); listContainer.classList.add('hidden'); addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); listContainer.classList.remove('hidden'); addMainBtn.classList.remove('hidden');
        
        const sortedData = [...currentTeaData].sort((a, b) => {
             const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
             const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
             return dateB - dateA;
        });

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card'; card.style.padding = '1rem';
            
            let formattedDate = 'Fecha no registrada';
            try { if(rec.date) formattedDate = new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); } catch(e) {}

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 class="card-title" style="border: none; padding: 0; margin-bottom: 0.25rem;">${rec.event || 'Evento'} - ${rec.time || ''}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">${formattedDate}</p>
                    </div>
                    <div class="card-actions" style="display: flex; gap: 0.5rem;">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash-2.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body" style="padding-top: 1rem; border-top: 1px solid var(--border-color); margin-top: 1rem;">
                    ${rec.trigger ? `<p class="data-label" style="font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Detonante:</p><p style="font-size: 0.9rem;">${rec.trigger}</p>` : ''}
                    ${rec.duration ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Duración:</p><p style="font-size: 0.9rem;">${rec.duration}</p>` : ''}
                    ${rec.notes ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Notas:</p><p style="font-size: 0.9rem;">${rec.notes.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
    attachEventListeners();
}

/* --- Funciones del Modal --- */
function openFormModal(record = null) {
    if (!form || !formModal) return;
    form.reset();
    document.getElementById('tea-id').value = '';
    document.getElementById('tea-form-title').textContent = 'Nuevo Registro TEA';
    document.getElementById('tea-date').valueAsDate = new Date();
    document.getElementById('tea-time').value = new Date().toTimeString().slice(0, 5);


    if (record) {
        document.getElementById('tea-form-title').textContent = 'Editar Registro TEA';
        document.getElementById('tea-id').value = record.id;
        form.elements['date'].value = record.date;
        form.elements['time'].value = record.time;
        form.elements['event'].value = record.event;
        form.elements['trigger'].value = record.trigger;
        form.elements['duration'].value = record.duration;
        form.elements['notes'].value = record.notes || '';
    }
    formModal.classList.remove('hidden');
}
function closeFormModal() { formModal?.classList.add('hidden'); }

/* --- Listener Envío Formulario --- */
function handleFormSubmit(e) {
    e.preventDefault();
    const idValue = document.getElementById('tea-id').value;
    const id = idValue ? parseInt(idValue, 10) : Date.now();
    
    const record = {
        id: id,
        date: form.elements['date'].value,
        time: form.elements['time'].value,
        event: form.elements['event'].value,
        trigger: form.elements['trigger'].value,
        duration: form.elements['duration'].value,
        notes: form.elements['notes'].value
    };

    if (idValue) { // Editando
        const index = currentTeaData.findIndex(rec => rec.id === id);
        if (index > -1) currentTeaData[index] = record;
    } else { // Agregando
        currentTeaData.push(record);
    }
    
    store.saveTeaData(currentTeaData); // <-- GUARDAR
    
    closeFormModal();
    renderTeaList();
}

/* --- Listeners Tarjetas (Editar/Eliminar) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('tea-list-container');
    if (!listContainer) return;
    const newContainer = listContainer.cloneNode(true);
    listContainer.parentNode.replaceChild(newContainer, listContainer);

    newContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        const recordIdStr = deleteBtn?.dataset.id || editBtn?.dataset.id;
        if (!recordIdStr) return;
        
        const recordId = parseInt(recordIdStr, 10);
        if (deleteBtn) {
            if (confirm('¿Eliminar este registro?')) {
                currentTeaData = currentTeaData.filter(rec => rec.id !== recordId);
                store.saveTeaData(currentTeaData); // <-- GUARDAR
                renderTeaList();
            }
        } else if (editBtn) {
            const record = currentTeaData.find(rec => rec.id === recordId);
            if (record) openFormModal(record);
        }
    });
}

/* --- Función Principal --- */
export function init() {
    currentTeaData = store.getTeaData() || []; // <-- Cargar datos
    console.log("Cargado js/pages/tea.js");

    formModal = document.getElementById('tea-form-modal');
    form = document.getElementById('tea-form');
    const addInitialBtn = document.getElementById('add-tea-initial-btn');
    const addMainBtn = document.getElementById('add-tea-main-btn');
    const cancelBtn = document.getElementById('cancel-tea-btn');

    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelBtn) {
         console.error("Faltan elementos HTML esenciales en tea.html");
         document.getElementById('tea-empty-state')?.classList.remove('hidden');
         return;
    }

    addInitialBtn.addEventListener('click', () => openFormModal());
    addMainBtn.addEventListener('click', () => openFormModal());
    cancelBtn.addEventListener('click', closeFormModal);
    form.addEventListener('submit', handleFormSubmit);

    renderTeaList(); // Renderizado inicial
}