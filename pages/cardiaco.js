// --- Base de Datos Temporal ---
let tempCardiacoDB = [];

// --- Funciones de Renderizado ---

function renderCardiacoList() {
    const listContainer = document.getElementById('cardiaco-list-container');
    const emptyState = document.getElementById('cardiaco-empty-state');
    const addMainBtn = document.getElementById('add-cardiaco-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;

    listContainer.innerHTML = '';

    if (tempCardiacoDB.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMainBtn.classList.remove('hidden');

        // Ordenar por fecha y hora más reciente primero
        tempCardiacoDB.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        tempCardiacoDB.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            // Lógica para clasificar la presión
            let pressureClass = 'pressure-normal';
            let pressureText = 'Normal';
            if (rec.systolic >= 140 || rec.diastolic >= 90) {
                pressureClass = 'pressure-high';
                pressureText = 'Alta';
            } else if (rec.systolic < 90 || rec.diastolic < 60) {
                 pressureClass = 'pressure-low';
                 pressureText = 'Baja';
            }

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title" style="margin-bottom: 0.25rem;">${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} - ${rec.time}</p>
                        <p class="card-subtitle">${rec.notes || 'Sin notas adicionales'}</p>
                    </div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; margin-top: 1rem;">
                    <div>
                        <p class="data-label">Sistólica</p>
                        <p class="data-value">${rec.systolic} <span class="data-unit">mmHg</span></p>
                    </div>
                    <div>
                        <p class="data-label">Diastólica</p>
                        <p class="data-value">${rec.diastolic} <span class="data-unit">mmHg</span></p>
                    </div>
                    <div>
                        <p class="data-label">Pulso</p>
                        <p class="data-value">${rec.heartRate} <span class="data-unit">BPM</span></p>
                    </div>
                </div>
                <div class="card-footer ${pressureClass}" style="text-align: center; margin-top: 1rem; padding: 0.5rem; border-radius: 8px;">
                    <span style="font-weight: 600;">Presión ${pressureText}</span>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

// --- Lógica de Estilos Dinámicos ---
function injectCardiacoStyles() {
    const styleId = 'cardiaco-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .pressure-normal { background-color: #E8F5E9; color: #2E7D32; } /* Verde claro */
        .pressure-high { background-color: #FFEBEE; color: #C62828; } /* Rojo claro */
        .pressure-low { background-color: #F4F7F9; color: var(--text-secondary); border: 1px solid var(--border-color); } /* Gris claro */
        .data-label { font-size: 0.8rem; color: var(--text-secondary); }
        .data-value { font-size: 1.5rem; font-weight: 600; }
        .data-unit { font-size: 0.9rem; font-weight: 400; color: var(--text-secondary); }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectCardiacoStyles();

    const formModal = document.getElementById('cardiaco-form-modal');
    const form = document.getElementById('cardiaco-form');
    const addInitialBtn = document.getElementById('add-cardiaco-initial-btn');
    const addMainBtn = document.getElementById('add-cardiaco-main-btn');
    const cancelBtn = document.getElementById('cancel-cardiaco-btn');
    const listContainer = document.getElementById('cardiaco-list-container');

    function openFormModal(record = null) {
        if (!form) return;
        form.reset();
        const now = new Date();
        document.getElementById('cardiaco-date').valueAsDate = now;
        document.getElementById('cardiaco-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('cardiaco-id').value = '';
        document.getElementById('cardiaco-form-title').textContent = 'Agregar Registro de Presión';

        if (record) {
            document.getElementById('cardiaco-form-title').textContent = 'Editar Registro de Presión';
            document.getElementById('cardiaco-id').value = record.id;
            document.getElementById('cardiaco-date').value = record.date;
            document.getElementById('cardiaco-time').value = record.time;
            document.getElementById('cardiaco-systolic').value = record.systolic;
            document.getElementById('cardiaco-diastolic').value = record.diastolic;
            document.getElementById('cardiaco-heartrate').value = record.heartRate;
            document.getElementById('cardiaco-notes').value = record.notes;
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
        const id = document.getElementById('cardiaco-id').value;
        const record = {
            id: id || Date.now(),
            date: document.getElementById('cardiaco-date').value,
            time: document.getElementById('cardiaco-time').value,
            systolic: parseInt(document.getElementById('cardiaco-systolic').value),
            diastolic: parseInt(document.getElementById('cardiaco-diastolic').value),
            heartRate: parseInt(document.getElementById('cardiaco-heartrate').value),
            notes: document.getElementById('cardiaco-notes').value
        };

        if (id) {
            const index = tempCardiacoDB.findIndex(rec => rec.id.toString() === id);
            if (index > -1) tempCardiacoDB[index] = record;
        } else {
            tempCardiacoDB.push(record);
        }
        
        closeFormModal();
        renderCardiacoList();
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');

        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            // Usamos un modal custom en lugar de confirm()
            if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                tempCardiacoDB = tempCardiacoDB.filter(rec => rec.id.toString() !== id);
                renderCardiacoList();
            }
        }

        if (editBtn) {
            const id = editBtn.dataset.id;
            const record = tempCardiacoDB.find(rec => rec.id.toString() === id);
            if(record) openFormModal(record);
        }
    });

    renderCardiacoList();
}

