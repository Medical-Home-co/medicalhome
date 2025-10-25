// SOLUCIÓN: Importar el store
import { store } from '../store.js';

// --- Funciones de Renderizado ---
// SOLUCIÓN: Aceptar datos como argumento
function renderDiabetesList(data) {
    const listContainer = document.getElementById('diabetes-list-container');
    const emptyState = document.getElementById('diabetes-empty-state');
    const addMainBtn = document.getElementById('add-diabetes-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;

    listContainer.innerHTML = '';

    // SOLUCIÓN: Usar la longitud de los datos pasados
    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMainBtn.classList.remove('hidden');

        // SOLUCIÓN: Usar los datos pasados
        const sortedData = [...data].sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            let glucoseClass = 'glucose-normal';
            let glucoseText = 'Normal';
            if (rec.glucose >= 180) {
                glucoseClass = 'glucose-high'; glucoseText = 'Alta';
            } else if (rec.glucose < 70) {
                 glucoseClass = 'glucose-low'; glucoseText = 'Baja';
            }

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title" style="margin-bottom: 0.25rem;">${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} - ${rec.time}</p>
                        <p class="card-subtitle">${rec.notes || 'Sin notas'}</p>
                    </div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body" style="text-align: center; margin: 1rem 0;">
                    <p class="data-label">Nivel de Glucosa</p>
                    <p class="data-value" style="font-size: 2.5rem;">${rec.glucose} <span class="data-unit" style="font-size: 1.5rem;">mg/dL</span></p>
                </div>
                <div class="card-footer-details" style="display: flex; justify-content: space-around; font-size: 0.9rem; color: var(--text-secondary);">
                    ${rec.hba1c ? `<span><strong>HbA1c:</strong> ${rec.hba1c}%</span>` : ''}
                    ${rec.insulin ? `<span><strong>Insulina:</strong> ${rec.insulin} u</span>` : ''}
                </div>
                <div class="card-footer ${glucoseClass}" style="text-align: center; margin-top: 1rem; padding: 0.5rem; border-radius: 8px;">
                    <span style="font-weight: 600;">Glucosa ${glucoseText}</span>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

// --- Lógica de Estilos Dinámicos ---
function injectDiabetesStyles() { /* ... (Sin cambios aquí) ... */ 
    const styleId = 'diabetes-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .glucose-normal { background-color: #E8F5E9; color: #2E7D32; } 
        .glucose-high { background-color: #FFEBEE; color: #C62828; } 
        .glucose-low { background-color: #F4F7F9; color: var(--text-secondary); border: 1px solid var(--border-color); } 
        .data-label { font-size: 0.8rem; color: var(--text-secondary); }
        .data-value { font-weight: 700; color: var(--primary-blue); }
        .data-unit { font-weight: 400; color: var(--text-secondary); }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectDiabetesStyles();

    // SOLUCIÓN: Cargar datos del store
    let currentData = store.getDiabetesData();

    const formModal = document.getElementById('diabetes-form-modal');
    const form = document.getElementById('diabetes-form');
    const addInitialBtn = document.getElementById('add-diabetes-initial-btn');
    const addMainBtn = document.getElementById('add-diabetes-main-btn');
    const cancelBtn = document.getElementById('cancel-diabetes-btn');
    const listContainer = document.getElementById('diabetes-list-container');

    function openFormModal(record = null) { /* ... (Sin cambios aquí, solo llena el form) ... */ 
        if (!form) return;
        form.reset();
        const now = new Date();
        document.getElementById('diabetes-date').valueAsDate = now;
        document.getElementById('diabetes-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('diabetes-id').value = '';
        document.getElementById('diabetes-form-title').textContent = 'Nuevo Registro';

        if (record) {
            document.getElementById('diabetes-form-title').textContent = 'Editar Registro';
            document.getElementById('diabetes-id').value = record.id;
            document.getElementById('diabetes-date').value = record.date;
            document.getElementById('diabetes-time').value = record.time;
            document.getElementById('diabetes-glucose').value = record.glucose;
            document.getElementById('diabetes-hba1c').value = record.hba1c || ''; // Corregido null
            document.getElementById('diabetes-insulin').value = record.insulin || ''; // Corregido null
            document.getElementById('diabetes-notes').value = record.notes || ''; // Corregido null
        }
        if(formModal) formModal.classList.remove('hidden');
    }

    function closeFormModal() {
        if(formModal) formModal.classList.add('hidden');
    }

    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('diabetes-id').value;
        const record = {
            id: id ? parseInt(id) : Date.now(),
            date: document.getElementById('diabetes-date').value,
            time: document.getElementById('diabetes-time').value,
            glucose: parseInt(document.getElementById('diabetes-glucose').value),
            hba1c: document.getElementById('diabetes-hba1c').value ? parseFloat(document.getElementById('diabetes-hba1c').value) : null,
            insulin: document.getElementById('diabetes-insulin').value ? parseInt(document.getElementById('diabetes-insulin').value) : null,
            notes: document.getElementById('diabetes-notes').value
        };

        if (id) {
            const index = currentData.findIndex(rec => rec.id.toString() === id);
            if (index > -1) currentData[index] = record;
        } else {
            currentData.push(record);
        }
        
        // SOLUCIÓN: Guardar en el store
        store.saveDiabetesData(currentData);
        
        closeFormModal();
        // SOLUCIÓN: Pasar datos actualizados al render
        renderDiabetesList(currentData);
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');

        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                // SOLUCIÓN: Modificar currentData y guardar
                currentData = currentData.filter(rec => rec.id.toString() !== id);
                store.saveDiabetesData(currentData);
                renderDiabetesList(currentData);
            }
        }

        if (editBtn) {
            const id = editBtn.dataset.id;
             // SOLUCIÓN: Buscar en currentData
            const record = currentData.find(rec => rec.id.toString() === id);
            if(record) openFormModal(record);
        }
    });

    // SOLUCIÓN: Render inicial con datos del store
    renderDiabetesList(currentData);
}