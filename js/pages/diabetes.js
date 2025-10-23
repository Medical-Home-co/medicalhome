/* --- pages/diabetes.js --- */
import { store } from '../store.js';

let currentDiabetesData = [];
let formModal, form; // Variables globales del módulo

/* --- Estilos (opcional, si necesita) --- */
function injectDiabetesStyles() {
    const styleId = 'diabetes-dynamic-styles'; if (document.getElementById(styleId)) return;
    const style = document.createElement('style'); style.id = styleId;
    style.innerHTML = `
        /* Colores para nivel de glucosa (ejemplo) */
        .level-low { background-color: var(--success-light, #E8F5E9); color: var(--success-color, #2E7D32); } /* Normal */
        .level-medium { background-color: #FFF3E0; color: #E65100; } /* Elevado */
        .level-high { background-color: var(--danger-light, #FFEBEE); color: var(--danger-color, #C62828); } /* Alto */
        .symptom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
        .symptom-row:last-of-type { border-bottom: none; }
        .level-indicator { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
    `;
    document.head.appendChild(style);
}

/* --- Renderizar Lista --- */
function renderDiabetesList() {
    const listContainer = document.getElementById('diabetes-list-container');
    const emptyState = document.getElementById('diabetes-empty-state');
    const addMainBtn = document.getElementById('add-diabetes-main-btn');
    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    if (currentDiabetesData.length === 0) {
        emptyState.classList.remove('hidden'); addMainBtn.classList.add('hidden'); listContainer.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); addMainBtn.classList.remove('hidden'); listContainer.classList.remove('hidden');
        
        const sortedData = [...currentDiabetesData].sort((a, b) => {
             const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
             const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
             return dateB - dateA;
        });

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card'; card.style.padding = '1rem';
            
            let levelClass = 'level-low'; // Normal
            if (rec.glucoseLevel >= 140 && rec.glucoseLevel < 200) levelClass = 'level-medium'; // Elevado
            if (rec.glucoseLevel >= 200) levelClass = 'level-high'; // Alto
            let mealTimeText = rec.mealTime === 'antes' ? 'Antes de comer' : (rec.mealTime === 'despues' ? 'Después de comer' : 'Ayunas');

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
                        <span>Nivel de Glucosa</span>
                        <span class="level-indicator ${levelClass}">${rec.glucoseLevel} ${rec.unit || 'mg/dL'}</span>
                    </div>
                    <div class="symptom-row">
                        <span>Momento</span>
                        <span style="font-weight: 500; font-size: 0.9rem;">${mealTimeText}</span>
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
    document.getElementById('diabetes-date').valueAsDate = now;
    document.getElementById('diabetes-time').value = now.toTimeString().slice(0, 5);
    document.getElementById('diabetes-id').value = '';
    document.getElementById('diabetes-form-title').textContent = 'Nuevo Registro de Glucosa';

    if (record) {
        document.getElementById('diabetes-form-title').textContent = 'Editar Registro';
        document.getElementById('diabetes-id').value = record.id;
        document.getElementById('diabetes-date').value = record.date;
        document.getElementById('diabetes-time').value = record.time;
        document.getElementById('glucose-level').value = record.glucoseLevel;
        document.getElementById('meal-time').value = record.mealTime;
        document.getElementById('diabetes-notes').value = record.notes || '';
    }
    formModal?.classList.remove('hidden');
}
function closeFormModal() { formModal?.classList.add('hidden'); }

/* --- Listeners (Editar/Eliminar) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('diabetes-list-container');
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
                currentDiabetesData = currentDiabetesData.filter(rec => rec.id !== recordId);
                store.saveDiabetesData(currentDiabetesData); // GUARDAR
                renderDiabetesList();
            }
        } else if (editBtn) {
            const record = currentDiabetesData.find(rec => rec.id === recordId);
            if (record) openFormModal(record);
        }
    });
}

/* --- Función Principal --- */
export function init() {
    currentDiabetesData = store.getDiabetesData() || [];
    console.log("Cargado js/pages/diabetes.js (conectado a store)");
    injectDiabetesStyles();

    formModal = document.getElementById('diabetes-form-modal');
    form = document.getElementById('diabetes-form');
    const addInitialBtn = document.getElementById('add-diabetes-initial-btn');
    const addMainBtn = document.getElementById('add-diabetes-main-btn');
    const cancelBtn = document.getElementById('cancel-diabetes-btn');

    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelBtn) {
         console.error("Faltan elementos HTML esenciales en diabetes.html");
         document.getElementById('diabetes-empty-state')?.classList.remove('hidden');
         return;
    }

    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const idValue = document.getElementById('diabetes-id').value;
        const id = idValue ? parseInt(idValue, 10) : Date.now();
        
        const record = {
            id: id,
            date: document.getElementById('diabetes-date').value,
            time: document.getElementById('diabetes-time').value,
            glucoseLevel: parseInt(document.getElementById('glucose-level').value, 10),
            unit: "mg/dL", // Asumir unidad
            mealTime: document.getElementById('meal-time').value,
            notes: document.getElementById('diabetes-notes').value
        };

        if (idValue) { // Editando
            const index = currentDiabetesData.findIndex(rec => rec.id === id);
            if (index > -1) currentDiabetesData[index] = record;
        } else { // Agregando
            currentDiabetesData.push(record);
        }
        
        store.saveDiabetesData(currentDiabetesData); // GUARDAR
        
        closeFormModal();
        renderDiabetesList();
    });

    renderDiabetesList(); // Renderizado inicial
}