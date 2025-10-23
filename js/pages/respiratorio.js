/* --- pages/respiratorio.js --- */
import { store } from '../store.js';

let currentRespiratorioData = [];
let formModal, form; // Variables para elementos del modal

/* --- (Opcional: Inyectar Estilos) --- */
/*
function injectRespiratorioStyles() {
    // ... si necesitas estilos específicos para las tarjetas ...
}
*/

/* --- Renderizar Lista --- */
function renderRespiratorioList() {
    const listContainer = document.getElementById('respiratorio-list-container');
    const emptyState = document.getElementById('respiratorio-empty-state');
    const addMainBtn = document.getElementById('add-respiratorio-main-btn');
    if (!listContainer || !emptyState || !addMainBtn) { console.error("Elementos UI Respiratorio faltan."); return; }
    listContainer.innerHTML = '';

    if (currentRespiratorioData.length === 0) {
        emptyState.classList.remove('hidden'); listContainer.classList.add('hidden'); addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); listContainer.classList.remove('hidden'); addMainBtn.classList.remove('hidden');
        
        const sortedData = [...currentRespiratorioData].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card'; card.style.padding = '1rem';
            let formattedDate = 'Fecha no registrada';
            try { if(rec.date) formattedDate = new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); } catch(e) {}

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 class="card-title" style="border: none; padding: 0; margin-bottom: 0.25rem;">${rec.type || 'Registro'} - ${formattedDate}</h3>
                        <p style="font-size: 1rem; font-weight: 500; color: var(--primary-blue);">${rec.value || 'N/A'}</p>
                    </div>
                    <div class="card-actions" style="display: flex; gap: 0.5rem;">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash-2.svg" alt="Eliminar"></button>
                    </div>
                </div>
                ${rec.notes ? `<div class="card-body" style="padding-top: 1rem; border-top: 1px solid var(--border-color); margin-top: 1rem;"><p style="font-size: 0.9rem;">${rec.notes.replace(/\n/g, '<br>')}</p></div>` : ''}
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
    document.getElementById('respiratorio-id').value = '';
    document.getElementById('respiratorio-form-title').textContent = 'Nuevo Registro Respiratorio';
    document.getElementById('respiratorio-date').valueAsDate = new Date();

    if (record) { // Modo Edición
        document.getElementById('respiratorio-form-title').textContent = 'Editar Registro';
        document.getElementById('respiratorio-id').value = record.id;
        form.elements['date'].value = record.date;
        form.elements['type'].value = record.type; // Asumiendo campo 'type'
        form.elements['value'].value = record.value; // Asumiendo campo 'value'
        form.elements['notes'].value = record.notes || '';
    }
    formModal.classList.remove('hidden');
}
function closeFormModal() { formModal?.classList.add('hidden'); }

/* --- Listener Envío Formulario --- */
function handleFormSubmit(e) {
    e.preventDefault();
    const idValue = document.getElementById('respiratorio-id').value;
    const id = idValue ? parseInt(idValue, 10) : Date.now();
    
    const record = {
        id: id,
        date: form.elements['date'].value,
        type: form.elements['type'].value, // Asumiendo campo 'type'
        value: form.elements['value'].value, // Asumiendo campo 'value'
        notes: form.elements['notes'].value
    };

    if (idValue) { // Editando
        const index = currentRespiratorioData.findIndex(rec => rec.id === id);
        if (index > -1) currentRespiratorioData[index] = record;
    } else { // Agregando
        currentRespiratorioData.push(record);
    }
    
    store.saveRespiratorioData(currentRespiratorioData); // <-- GUARDAR
    
    closeFormModal();
    renderRespiratorioList();
}

/* --- Listeners Tarjetas (Editar/Eliminar) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('respiratorio-list-container');
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
                currentRespiratorioData = currentRespiratorioData.filter(rec => rec.id !== recordId);
                store.saveRespiratorioData(currentRespiratorioData); // <-- GUARDAR
                renderRespiratorioList();
            }
        } else if (editBtn) {
            const record = currentRespiratorioData.find(rec => rec.id === recordId);
            if (record) openFormModal(record);
        }
    });
}

/* --- Función Principal --- */
export function init() {
    currentRespiratorioData = store.getRespiratorioData() || []; // <-- Cargar datos
    console.log("Cargado js/pages/respiratorio.js");
    // injectRespiratorioStyles(); // Opcional

    formModal = document.getElementById('respiratorio-form-modal');
    form = document.getElementById('respiratorio-form');
    const addInitialBtn = document.getElementById('add-respiratorio-initial-btn');
    const addMainBtn = document.getElementById('add-respiratorio-main-btn');
    const cancelBtn = document.getElementById('cancel-respiratorio-btn');

    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelBtn) {
         console.error("Faltan elementos HTML esenciales en respiratorio.html");
         document.getElementById('respiratorio-empty-state')?.classList.remove('hidden');
         return;
    }

    addInitialBtn.addEventListener('click', () => openFormModal());
    addMainBtn.addEventListener('click', () => openFormModal());
    cancelBtn.addEventListener('click', closeFormModal);
    form.addEventListener('submit', handleFormSubmit);

    renderRespiratorioList(); // Renderizado inicial
}