// --- Base de Datos Temporal ---
let tempGastricoDB = [];
const allSymptomOptions = ['Acidez / Reflujo', 'Náuseas', 'Dolor Abdominal', 'Hinchazón / Gases', 'Vómito', 'Otro'];

// --- Funciones de Renderizado ---

function renderGastricoList() {
    const listContainer = document.getElementById('gastrico-list-container');
    const emptyState = document.getElementById('gastrico-empty-state');
    const addMainBtn = document.getElementById('add-gastrico-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    if (tempGastricoDB.length === 0) {
        emptyState.classList.remove('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        addMainBtn.classList.remove('hidden');
        tempGastricoDB.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        tempGastricoDB.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            const symptomsHTML = rec.symptoms.map(s => {
                let severityClass = 'level-low';
                if (s.severity === 'Moderado') severityClass = 'level-medium';
                if (s.severity === 'Severo') severityClass = 'level-high';
                return `
                    <div class="symptom-row">
                        <span>${s.name}</span>
                        <span class="level-indicator ${severityClass}">${s.severity}</span>
                    </div>
                `;
            }).join('');

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title">${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} - ${rec.time}</p>
                    </div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body">
                    ${symptomsHTML}
                    ${rec.food ? `<p class="info-row"><strong>Alimentos:</strong> ${rec.food}</p>` : ''}
                    ${rec.meds ? `<p class="info-row"><strong>Medicación:</strong> ${rec.meds}</p>` : ''}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

// --- Lógica de Estilos Dinámicos ---
function injectGastricoStyles() {
    const styleId = 'gastrico-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .level-low { background-color: #E8F5E9; color: #2E7D32; }
        .level-medium { background-color: #FFF3E0; color: #E65100; }
        .level-high { background-color: #FFEBEE; color: #C62828; }
        .symptom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
        .level-indicator { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
        .info-row { margin-top: 0.75rem; font-size: 0.9rem; padding: 0.5rem; background-color: var(--bg-secondary); border-radius: 6px; }
        .symptom-input-row { display: grid; grid-template-columns: 1fr auto auto; gap: 0.5rem; align-items: center; }
        .other-symptom-input-wrapper { grid-column: 1 / -1; }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectGastricoStyles();

    const formModal = document.getElementById('gastrico-form-modal');
    const form = document.getElementById('gastrico-form');
    const addInitialBtn = document.getElementById('add-gastrico-initial-btn');
    const addMainBtn = document.getElementById('add-gastrico-main-btn');
    const cancelBtn = document.getElementById('cancel-gastrico-btn');
    const listContainer = document.getElementById('gastrico-list-container');
    const addSymptomBtn = document.getElementById('add-symptom-btn');
    const symptomsContainer = document.getElementById('gastrico-symptoms-container');

    const updateSymptomSelects = () => {
        const selectedSymptoms = Array.from(symptomsContainer.querySelectorAll('.symptom-select')).map(select => select.value).filter(val => val !== 'Otro' && val !== '');
        symptomsContainer.querySelectorAll('.symptom-select').forEach(currentSelect => {
            const currentValue = currentSelect.value;
            // Opciones disponibles son: las que no están seleccionadas en OTROS selects, o el valor actual de ESTE select
            const availableOptions = allSymptomOptions.filter(opt => !selectedSymptoms.includes(opt) || opt === currentValue);
            
            currentSelect.innerHTML = ''; // Limpiar opciones
            availableOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = option.textContent = opt;
                currentSelect.appendChild(option);
            });
            currentSelect.value = currentValue; // Restaurar el valor
        });
    };

    const createSymptomRow = (symptom = { name: '', severity: 'Leve' }) => {
        const rowId = `row-${Date.now()}`;
        const row = document.createElement('div');
        row.className = 'symptom-input-row';
        row.id = rowId;

        // SELECT DE SÍNTOMA
        const symptomSelect = document.createElement('select');
        symptomSelect.className = 'form-input symptom-select';
        
        // SELECT DE MALESTAR
        const severitySelect = document.createElement('select');
        severitySelect.className = 'form-input severity-select';
        ['Leve', 'Moderado', 'Severo'].forEach(opt => {
            const option = document.createElement('option');
            option.value = option.textContent = opt;
            if (symptom.severity === opt) option.selected = true;
            severitySelect.appendChild(option);
        });

        // BOTÓN DE ELIMINAR
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'icon-button';
        removeBtn.innerHTML = '<img src="images/icons/trash.svg" alt="Eliminar">';
        removeBtn.onclick = () => {
            document.getElementById(rowId)?.remove();
            document.getElementById(`wrapper-${rowId}`)?.remove();
            updateSymptomSelects();
        };
        
        row.appendChild(symptomSelect);
        row.appendChild(severitySelect);
        // El primer síntoma no se puede eliminar
        if (symptomsContainer.children.length > 0) {
            row.appendChild(removeBtn);
        }

        symptomsContainer.appendChild(row);

        // INPUT PARA "OTRO"
        const wrapper = document.createElement('div');
        wrapper.className = 'other-symptom-input-wrapper';
        wrapper.id = `wrapper-${rowId}`;
        const otherInput = document.createElement('input');
        otherInput.type = 'text';
        otherInput.className = 'form-input other-symptom-input hidden';
        otherInput.placeholder = 'Especificar síntoma';
        wrapper.appendChild(otherInput);
        symptomsContainer.appendChild(wrapper);

        symptomSelect.onchange = () => {
            otherInput.classList.toggle('hidden', symptomSelect.value !== 'Otro');
            updateSymptomSelects();
        };
        
        // Poblar las opciones del select de síntoma y restaurar valor si es necesario
        updateSymptomSelects(); 
        if (symptom.name) {
             if(!allSymptomOptions.includes(symptom.name)){
                 symptomSelect.value = 'Otro';
                 otherInput.value = symptom.name;
                 otherInput.classList.remove('hidden');
             } else {
                 symptomSelect.value = symptom.name;
             }
        }
    };

    addSymptomBtn?.addEventListener('click', () => createSymptomRow());

    function openFormModal(record = null) {
        if (!form) return;
        form.reset();
        symptomsContainer.innerHTML = '';
        const now = new Date();
        document.getElementById('gastrico-date').valueAsDate = now;
        document.getElementById('gastrico-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('gastrico-id').value = '';
        document.getElementById('gastrico-form-title').textContent = 'Nuevo Registro Gástrico';

        if (record && record.symptoms) {
            document.getElementById('gastrico-form-title').textContent = 'Editar Registro';
            document.getElementById('gastrico-id').value = record.id;
            document.getElementById('gastrico-date').value = record.date;
            document.getElementById('gastrico-time').value = record.time;
            record.symptoms.forEach(createSymptomRow);
            document.getElementById('gastrico-food').value = record.food || '';
            document.getElementById('gastrico-meds').value = record.meds || '';
        } else {
            createSymptomRow(); // Añadir la primera fila por defecto
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
        const id = document.getElementById('gastrico-id').value;
        const symptomsData = [];
        symptomsContainer.querySelectorAll('.symptom-input-row').forEach(row => {
            const select = row.querySelector('.symptom-select');
            let name = select.value;
            if (name === 'Otro') {
                const otherInput = document.querySelector(`#wrapper-${row.id} .other-symptom-input`);
                name = otherInput.value.trim() || 'Otro (sin especificar)';
            }
            symptomsData.push({
                name: name,
                severity: row.querySelector('.severity-select').value
            });
        });
        
        const record = {
            id: id || Date.now(),
            date: form.elements.date.value,
            time: form.elements.time.value,
            symptoms: symptomsData,
            food: form.elements.food.value,
            meds: form.elements.meds.value
        };

        if (id) {
            const index = tempGastricoDB.findIndex(rec => rec.id.toString() === id);
            if (index > -1) tempGastricoDB[index] = record;
        } else {
            tempGastricoDB.push(record);
        }
        
        closeFormModal();
        renderGastricoList();
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        if (deleteBtn) {
            if (confirm('¿Estás seguro?')) {
                tempGastricoDB = tempGastricoDB.filter(rec => rec.id.toString() !== deleteBtn.dataset.id);
                renderGastricoList();
            }
        }
        if (editBtn) {
            const record = tempGastricoDB.find(rec => rec.id.toString() === editBtn.dataset.id);
            if (record) openFormModal(record);
        }
    });

    renderGastricoList();
}

