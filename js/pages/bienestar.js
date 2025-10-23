/* --- pages/bienestar.js --- */
import { store } from '../store.js';

let currentBienestarData = [];
let formModal, form;

/* --- Estilos (opcional) --- */
function injectBienestarStyles() {
    const styleId = 'bienestar-dynamic-styles'; if (document.getElementById(styleId)) return;
    const style = document.createElement('style'); style.id = styleId;
    style.innerHTML = `
        /* (Puedes añadir estilos para los 'moods' si quieres) */
        .mood-tag { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
        .mood-Feliz { background-color: var(--success-light); color: var(--success-color); }
        .mood-Normal { background-color: #E3F2FD; color: #0D47A1; }
        .mood-Triste { background-color: #F3E5F5; color: #4A148C; }
        .mood-Ansioso { background-color: #FFF3E0; color: #E65100; }
        .mood-Enojado { background-color: var(--danger-light); color: var(--danger-color); }
    `;
    document.head.appendChild(style);
}

/* --- Renderizar Lista --- */
function renderBienestarList() {
    const listContainer = document.getElementById('bienestar-list-container');
    const emptyState = document.getElementById('bienestar-empty-state');
    const addMainBtn = document.getElementById('add-bienestar-main-btn');
    if (!listContainer || !emptyState || !addMainBtn) { console.error("Elementos UI Bienestar faltan."); return; }
    listContainer.innerHTML = '';

    if (currentBienestarData.length === 0) {
        emptyState.classList.remove('hidden'); listContainer.classList.add('hidden'); addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); listContainer.classList.remove('hidden'); addMainBtn.classList.remove('hidden');
        
        const sortedData = [...currentBienestarData].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card'; card.style.padding = '1rem';
            
            let formattedDate = 'Fecha no registrada';
            try { if(rec.date) formattedDate = new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); } catch(e) {}
            
            // Usar la clase de mood para el estilo
            const moodClass = `mood-${rec.mood || 'Normal'}`;

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 class="card-title" style="border: none; padding: 0; margin-bottom: 0.25rem;">${formattedDate}</h3>
                    </div>
                    <div class="card-actions" style="display: flex; gap: 0.5rem;">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash-2.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="symptom-row">
                        <span>Estado de Ánimo</span>
                        <span class="mood-tag ${moodClass}">${rec.mood || '-'}</span>
                    </div>
                    <div class="symptom-row">
                        <span>Nivel de Energía</span>
                        <span style="font-weight: 500; font-size: 0.9rem;">${rec.energy || '-'}</span>
                    </div>
                    ${rec.notes ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Notas:</p><p style="font-size: 0.9rem; white-space: pre-wrap;">${rec.notes}</p>` : ''}
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
    document.getElementById('bienestar-id').value = '';
    document.getElementById('bienestar-form-title').textContent = 'Nuevo Registro de Bienestar';
    document.getElementById('bienestar-date').valueAsDate = new Date();
    // Valor por defecto para selects
    document.getElementById('bienestar-mood').value = 'Normal';
    document.getElementById('bienestar-energy').value = 'Media';


    if (record) { // Modo Edición
        document.getElementById('bienestar-form-title').textContent = 'Editar Registro';
        document.getElementById('bienestar-id').value = record.id;
        form.elements['date'].value = record.date;
        form.elements['mood'].value = record.mood;
        form.elements['energy'].value = record.energy;
        form.elements['notes'].value = record.notes || '';
    }
    formModal.classList.remove('hidden');
}
function closeFormModal() { formModal?.classList.add('hidden'); }

/* --- Listener Envío Formulario --- */
function handleFormSubmit(e) {
    e.preventDefault();
    const idValue = document.getElementById('bienestar-id').value;
    const id = idValue ? parseInt(idValue, 10) : Date.now();
    
    const record = {
        id: id,
        date: form.elements['date'].value,
        mood: form.elements['mood'].value,
        energy: form.elements['energy'].value,
        notes: form.elements['notes'].value
    };

    if (idValue) { // Editando
        const index = currentBienestarData.findIndex(rec => rec.id === id);
        if (index > -1) currentBienestarData[index] = record;
    } else { // Agregando
        currentBienestarData.push(record);
    }
    
    store.saveBienestarData(currentBienestarData); // <-- GUARDAR
    
    closeFormModal();
    renderBienestarList();
}

/* --- Listeners Tarjetas (Editar/Eliminar) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('bienestar-list-container');
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
                currentBienestarData = currentBienestarData.filter(rec => rec.id !== recordId);
                store.saveBienestarData(currentBienestarData); // <-- GUARDAR
                renderBienestarList();
            }
        } else if (editBtn) {
            const record = currentBienestarData.find(rec => rec.id === recordId);
            if (record) openFormModal(record);
        }
    });
}

/* --- Función Principal --- */
export function init() {
    currentBienestarData = store.getBienestarData() || []; // <-- Cargar datos
    console.log("Cargado js/pages/bienestar.js");
    injectBienestarStyles();

    formModal = document.getElementById('bienestar-form-modal');
    form = document.getElementById('bienestar-form');
    const addInitialBtn = document.getElementById('add-bienestar-initial-btn');
    const addMainBtn = document.getElementById('add-bienestar-main-btn');
    const cancelBtn = document.getElementById('cancel-bienestar-btn');

    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelBtn) {
         console.error("Faltan elementos HTML esenciales en bienestar.html");
         document.getElementById('bienestar-empty-state')?.classList.remove('hidden');
         return;
    }

    addInitialBtn.addEventListener('click', () => openFormModal());
    addMainBtn.addEventListener('click', () => openFormModal());
    cancelBtn.addEventListener('click', closeFormModal);
    form.addEventListener('submit', handleFormSubmit);

    renderBienestarList(); // Renderizado inicial
}