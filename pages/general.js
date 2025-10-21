// --- Base de Datos Temporal ---
let tempGeneralDB = [];

// --- Funciones de Renderizado ---

function renderGeneralList() {
    const listContainer = document.getElementById('general-list-container');
    const emptyState = document.getElementById('general-empty-state');
    const addMainBtn = document.getElementById('add-general-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    if (tempGeneralDB.length === 0) {
        emptyState.classList.remove('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        addMainBtn.classList.remove('hidden');
        tempGeneralDB.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        tempGeneralDB.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            // Lógica para clasificar la severidad
            let severityClass = 'level-low'; // Verde
            if (rec.severity === 'Moderado') severityClass = 'level-medium'; // Naranja
            if (rec.severity === 'Severo') severityClass = 'level-high'; // Rojo

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title">${rec.symptom}</p>
                        <p class="card-subtitle">${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} - ${rec.time}</p>
                    </div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="symptom-row">
                        <span>Nivel de Malestar</span>
                        <span class="level-indicator ${severityClass}">${rec.severity}</span>
                    </div>
                    ${rec.meds ? `<p class="info-row"><strong>Medicación:</strong> ${rec.meds}</p>` : ''}
                    ${rec.notes ? `<p class="notes-row">${rec.notes}</p>` : ''}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

// --- Lógica de Estilos Dinámicos ---
function injectGeneralStyles() {
    const styleId = 'general-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .level-low { background-color: #E8F5E9; color: #2E7D32; } /* Verde */
        .level-medium { background-color: #FFF3E0; color: #E65100; } /* Naranja */
        .level-high { background-color: #FFEBEE; color: #C62828; } /* Rojo */
        .symptom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; }
        .level-indicator { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
        .info-row { margin-top: 0.75rem; font-size: 0.9rem; padding: 0.5rem; background-color: var(--bg-secondary); border-radius: 6px; }
        .notes-row { margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-secondary); }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectGeneralStyles();

    const formModal = document.getElementById('general-form-modal');
    const form = document.getElementById('general-form');
    const addInitialBtn = document.getElementById('add-general-initial-btn');
    const addMainBtn = document.getElementById('add-general-main-btn');
    const cancelBtn = document.getElementById('cancel-general-btn');
    const listContainer = document.getElementById('general-list-container');

    function openFormModal(record = null) {
        if (!form) return;
        form.reset();
        const now = new Date();
        document.getElementById('general-date').valueAsDate = now;
        document.getElementById('general-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('general-id').value = '';
        document.getElementById('general-form-title').textContent = 'Nuevo Registro General';

        if (record) {
            document.getElementById('general-form-title').textContent = 'Editar Registro';
            document.getElementById('general-id').value = record.id;
            document.getElementById('general-date').value = record.date;
            document.getElementById('general-time').value = record.time;
            document.getElementById('general-symptom').value = record.symptom;
            document.getElementById('general-severity').value = record.severity;
            document.getElementById('general-meds').value = record.meds || '';
            document.getElementById('general-notes').value = record.notes || '';
        }
        formModal?.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal?.classList.add('hidden');
    }

    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('general-id').value;
        
        const record = {
            id: id || Date.now(),
            date: document.getElementById('general-date').value,
            time: document.getElementById('general-time').value,
            symptom: document.getElementById('general-symptom').value,
            severity: document.getElementById('general-severity').value,
            meds: document.getElementById('general-meds').value,
            notes: document.getElementById('general-notes').value
        };

        if (id) {
            const index = tempGeneralDB.findIndex(rec => rec.id.toString() === id);
            if (index > -1) tempGeneralDB[index] = record;
        } else {
            tempGeneralDB.push(record);
        }
        
        closeFormModal();
        renderGeneralList();
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        if (deleteBtn) {
            if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                tempGeneralDB = tempGeneralDB.filter(rec => rec.id.toString() !== deleteBtn.dataset.id);
                renderGeneralList();
            }
        }
        if (editBtn) {
            const record = tempGeneralDB.find(rec => rec.id.toString() === editBtn.dataset.id);
            if (record) openFormModal(record);
        }
    });

    renderGeneralList();
}

