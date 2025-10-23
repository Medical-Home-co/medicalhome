/* --- pages/cardiaco.js --- */
import { store } from '../store.js';

let currentCardiacoData = [];
let formModal, form; // Variables globales del módulo

/* --- Estilos (opcional, si necesita) --- */
function injectCardiacoStyles() {
    const styleId = 'cardiaco-dynamic-styles'; if (document.getElementById(styleId)) return;
    const style = document.createElement('style'); style.id = styleId;
    style.innerHTML = `
        /* Colores para presión arterial */
        .level-low { background-color: var(--success-light, #E8F5E9); color: var(--success-color, #2E7D32); } /* Normal */
        .level-medium { background-color: #FFF3E0; color: #E65100; } /* Elevada */
        .level-high { background-color: var(--danger-light, #FFEBEE); color: var(--danger-color, #C62828); } /* Alta */
        .symptom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
        .symptom-row:last-of-type { border-bottom: none; }
        .level-indicator { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
    `;
    document.head.appendChild(style);
}

/* --- Renderizar Lista --- */
function renderCardiacoList() {
    const listContainer = document.getElementById('cardiaco-list-container');
    const emptyState = document.getElementById('cardiaco-empty-state');
    const addMainBtn = document.getElementById('add-cardiaco-main-btn');
    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    if (currentCardiacoData.length === 0) {
        emptyState.classList.remove('hidden'); addMainBtn.classList.add('hidden'); listContainer.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); addMainBtn.classList.remove('hidden'); listContainer.classList.remove('hidden');
        
        const sortedData = [...currentCardiacoData].sort((a, b) => {
             const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
             const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
             return dateB - dateA;
        });

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card'; card.style.padding = '1rem';
            
            // Clasificación de presión (ejemplo)
            let levelClass = 'level-low'; // Normal
            if ((rec.systolic >= 130 && rec.systolic <= 139) || (rec.diastolic >= 80 && rec.diastolic <= 89)) levelClass = 'level-medium'; // Elevada
            if (rec.systolic >= 140 || rec.diastolic >= 90) levelClass = 'level-high'; // Alta

            let formattedDate = 'Fecha no registrada';
            try { if(rec.date) formattedDate = new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' }); } catch(e) {}

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div><p class="card-title" style="border: none; padding: 0; margin-bottom: 0.5rem;">${formattedDate} - ${rec.time || ''}</p></div>
                    <div class="card-actions" style="display: flex; gap: 0.5rem;">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash-2.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="symptom-row">
                        <span>Presión Arterial</span>
                        <span class="level-indicator ${levelClass}">${rec.systolic || '-'}/${rec.diastolic || '-'}</span>
                    </div>
                    <div class="symptom-row">
                        <span>Pulso</span>
                        <span style="font-weight: 500; font-size: 0.9rem;">${rec.pulse || '-'} lpm</span>
                    </div>
                    ${rec.notes ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Notas:</p><p style="font-size: 0.9rem;">${rec.notes}</p>` : ''}
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
    const now = new Date();
    document.getElementById('cardiaco-date').valueAsDate = now;
    document.getElementById('cardiaco-time').value = now.toTimeString().slice(0, 5);
    document.getElementById('cardiaco-id').value = '';
    document.getElementById('cardiaco-form-title').textContent = 'Nuevo Registro de Presión';

    if (record) {
        document.getElementById('cardiaco-form-title').textContent = 'Editar Registro';
        document.getElementById('cardiaco-id').value = record.id;
        document.getElementById('cardiaco-date').value = record.date;
        document.getElementById('cardiaco-time').value = record.time;
        document.getElementById('systolic').value = record.systolic;
        document.getElementById('diastolic').value = record.diastolic;
        document.getElementById('pulse').value = record.pulse;
        document.getElementById('cardiaco-notes').value = record.notes || '';
    }
    formModal?.classList.remove('hidden');
}
function closeFormModal() { formModal?.classList.add('hidden'); }

/* --- Listeners (Editar/Eliminar) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('cardiaco-list-container');
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
                currentCardiacoData = currentCardiacoData.filter(rec => rec.id !== recordId);
                store.saveCardiacoData(currentCardiacoData); // GUARDAR
                renderCardiacoList();
            }
        } else if (editBtn) {
            const record = currentCardiacoData.find(rec => rec.id === recordId);
            if (record) openFormModal(record);
        }
    });
}

/* --- Función Principal --- */
export function init() {
    currentCardiacoData = store.getCardiacoData() || [];
    console.log("Cargado js/pages/cardiaco.js (conectado a store)");
    injectCardiacoStyles();

    formModal = document.getElementById('cardiaco-form-modal');
    form = document.getElementById('cardiaco-form');
    const addInitialBtn = document.getElementById('add-cardiaco-initial-btn');
    const addMainBtn = document.getElementById('add-cardiaco-main-btn');
    const cancelBtn = document.getElementById('cancel-cardiaco-btn');

    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelBtn) {
         console.error("Faltan elementos HTML esenciales en cardiaco.html");
         document.getElementById('cardiaco-empty-state')?.classList.remove('hidden');
         return;
    }

    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const idValue = document.getElementById('cardiaco-id').value;
        const id = idValue ? parseInt(idValue, 10) : Date.now();
        
        const record = {
            id: id,
            date: document.getElementById('cardiaco-date').value,
            time: document.getElementById('cardiaco-time').value,
            systolic: parseInt(document.getElementById('systolic').value, 10),
            diastolic: parseInt(document.getElementById('diastolic').value, 10),
            pulse: parseInt(document.getElementById('pulse').value, 10),
            notes: document.getElementById('cardiaco-notes').value
        };

        if (idValue) { // Editando
            const index = currentCardiacoData.findIndex(rec => rec.id === id);
            if (index > -1) currentCardiacoData[index] = record;
        } else { // Agregando
            currentCardiacoData.push(record);
        }
        
        store.saveCardiacoData(currentCardiacoData); // GUARDAR
        
        closeFormModal();
        renderCardiacoList();
    });

    renderCardiacoList(); // Renderizado inicial
}