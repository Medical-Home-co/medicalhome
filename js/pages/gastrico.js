// SOLUCIÓN: Importar el store
import { store } from '../store.js';

const allSymptomOptions = ['Acidez / Reflujo', 'Náuseas', 'Dolor Abdominal', 'Hinchazón / Gases', 'Vómito', 'Otro'];

// --- Variables del Módulo ---
let medSelect; // Variable para el select de medicamentos

// --- Funciones de Renderizado ---
function renderGastricoList(data) {
    // ... (Tu función de renderizado de lista sigue igual) ...
    const listContainer = document.getElementById('gastrico-list-container');
    const emptyState = document.getElementById('gastrico-empty-state');
    const addMainBtn = document.getElementById('add-gastrico-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMainBtn.classList.remove('hidden');

        const sortedData = [...data].sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            const symptomsHTML = (rec.symptoms || []).map(s => { // Añadido check de array
                let severityClass = 'level-low';
                if (s.severity === 'Moderado') severityClass = 'level-medium';
                if (s.severity === 'Severo') severityClass = 'level-high';
                return `<div class="symptom-row"><span>${s.name}</span><span class="level-indicator ${severityClass}">${s.severity}</span></div>`;
            }).join('');

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div><p class="card-title">${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} - ${rec.time}</p></div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash.svg" class="icon-delete" alt="Eliminar"></button>
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
function injectGastricoStyles() { /* ... (Tu función sigue igual) ... */ 
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
        .symptom-input-row { display: grid; grid-template-columns: 1fr auto auto; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
        .other-symptom-input-wrapper { grid-column: 1 / -1; margin-top: -0.25rem; margin-bottom: 0.5rem; }
    `;
    document.head.appendChild(style);
}

// === INICIO SOLUCIÓN (Item 2): Funciones para el Select de Medicamentos ===
/**
 * Rellena el <select> de medicamentos
 */
function populateMedsDropdown() {
    if (!medSelect) return;
    
    const meds = store.getMeds() || [];
    medSelect.innerHTML = '<option value="">Seleccionar medicamento...</option>'; // Opción por defecto
    
    meds.forEach(med => {
        medSelect.innerHTML += `<option value="${med.name}">${med.name}</option>`;
    });
    
    medSelect.innerHTML += '<option value="otro" style="font-weight: bold; color: var(--primary-blue);">+ Otro (Agregar a mi lista)</option>';
}

/**
 * Maneja el cambio en el select de medicamentos
 */
function handleMedSelectChange() {
    if (medSelect.value === 'otro') {
        alert("Serás redirigido a la sección de Medicamentos para agregar uno nuevo. Luego podrás volver y seleccionarlo.");
        window.location.hash = '#medicamentos';
        medSelect.value = ""; // Resetear
    }
}
// === FIN SOLUCIÓN ===

// --- Función Principal ---
export function init() {
    injectGastricoStyles();

    let currentData = store.getGastricoData() || []; // Cargar datos del store

    const formModal = document.getElementById('gastrico-form-modal');
    const form = document.getElementById('gastrico-form');
    const addInitialBtn = document.getElementById('add-gastrico-initial-btn');
    const addMainBtn = document.getElementById('add-gastrico-main-btn');
    const cancelBtn = document.getElementById('cancel-gastrico-btn');
    const listContainer = document.getElementById('gastrico-list-container');
    const addSymptomBtn = document.getElementById('add-symptom-btn');
    const symptomsContainer = document.getElementById('gastrico-symptoms-container');
    
    // === INICIO SOLUCIÓN (Item 2): Asignar variable ===
    medSelect = document.getElementById('gastrico-med-select');
    // === FIN SOLUCIÓN ===

    const updateSymptomSelects = () => { /* ... (Tu función sigue igual) ... */ 
        const selectedSymptoms = Array.from(symptomsContainer.querySelectorAll('.symptom-select')).map(select => select.value).filter(val => val !== 'Otro' && val !== '');
        symptomsContainer.querySelectorAll('.symptom-select').forEach(currentSelect => {
            const currentValue = currentSelect.value;
            const availableOptions = allSymptomOptions.filter(opt => !selectedSymptoms.includes(opt) || opt === currentValue);
            currentSelect.innerHTML = '<option value="">Seleccionar síntoma...</option>';
            availableOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = option.textContent = opt;
                currentSelect.appendChild(option);
            });
            currentSelect.value = currentValue; 
        });
    };

    const createSymptomRow = (symptom = { name: '', severity: 'Leve' }) => { /* ... (Tu función sigue igual) ... */ 
        const rowId = `row-${Date.now()}`;
        const row = document.createElement('div');
        row.className = 'symptom-input-row';
        row.id = rowId;
        const symptomSelect = document.createElement('select');
        symptomSelect.className = 'form-input symptom-select';
        symptomSelect.required = true;
        const severitySelect = document.createElement('select');
        severitySelect.className = 'form-input severity-select';
        ['Leve', 'Moderado', 'Severo'].forEach(opt => {
            const option = document.createElement('option'); option.value = option.textContent = opt;
            if (symptom.severity === opt) option.selected = true; severitySelect.appendChild(option);
        });
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button'; removeBtn.className = 'icon-button';
        removeBtn.innerHTML = '<img src="images/icons/trash.svg" alt="Eliminar">';
        removeBtn.onclick = () => {
            document.getElementById(rowId)?.remove(); document.getElementById(`wrapper-${rowId}`)?.remove(); updateSymptomSelects();
        };
        row.appendChild(symptomSelect); row.appendChild(severitySelect);
        
        // CORRECCIÓN: Permitir eliminar incluso la primera fila si hay más de una
        if (symptomsContainer.children.length > 0) {
             row.appendChild(removeBtn);
        }

        symptomsContainer.appendChild(row);
        const wrapper = document.createElement('div'); wrapper.className = 'other-symptom-input-wrapper'; wrapper.id = `wrapper-${rowId}`;
        const otherInput = document.createElement('input'); otherInput.type = 'text'; otherInput.className = 'form-input other-symptom-input hidden'; otherInput.placeholder = 'Especificar síntoma';
        wrapper.appendChild(otherInput); symptomsContainer.appendChild(wrapper);
        symptomSelect.onchange = () => {
            otherInput.classList.toggle('hidden', symptomSelect.value !== 'Otro');
            otherInput.required = (symptomSelect.value === 'Otro');
            updateSymptomSelects();
        };
        updateSymptomSelects(); 
        if (symptom.name) {
             if(!allSymptomOptions.includes(symptom.name)){
                 symptomSelect.value = 'Otro'; otherInput.value = symptom.name; otherInput.classList.remove('hidden'); otherInput.required = true;
             } else {
                 symptomSelect.value = symptom.name;
             }
        } else {
            symptomSelect.value = "";
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

        // === INICIO SOLUCIÓN (Item 2): Poblar meds al abrir ===
        populateMedsDropdown();
        // === FIN SOLUCIÓN ===

        if (record && record.symptoms) {
            document.getElementById('gastrico-form-title').textContent = 'Editar Registro';
            document.getElementById('gastrico-id').value = record.id;
            document.getElementById('gastrico-date').value = record.date;
            document.getElementById('gastrico-time').value = record.time;
            record.symptoms.forEach(createSymptomRow);
            document.getElementById('gastrico-food').value = record.food || '';
            
            // === INICIO SOLUCIÓN (Item 2): Seleccionar med guardado ===
            if (record.meds) {
                const medExists = (store.getMeds() || []).some(med => med.name === record.meds);
                if (medExists) {
                    medSelect.value = record.meds;
                } else if (record.meds) {
                    // Si no existe, añadirlo como opción temporal
                    medSelect.innerHTML += `<option value="${record.meds}" selected>${record.meds} (Eliminado)</option>`;
                }
            }
            // === FIN SOLUCIÓN ===
            
        } else {
            createSymptomRow(); 
        }
        formModal?.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal?.classList.add('hidden');
    }

    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    // === INICIO SOLUCIÓN (Item 2): Asignar listener al select ===
    medSelect?.addEventListener('change', handleMedSelectChange);
    // === FIN SOLUCIÓN ===

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // ... (Tu validación de síntomas sigue igual) ...
        const id = document.getElementById('gastrico-id').value;
        const symptomsData = [];
        let formIsValid = true;
        symptomsContainer.querySelectorAll('.symptom-input-row').forEach(row => {
            const select = row.querySelector('.symptom-select');
            let name = select.value;
            if (!name) { formIsValid = false; select.style.borderColor = 'red'; } else { select.style.borderColor = ''; }
            
            if (name === 'Otro') {
                const otherInput = document.querySelector(`#wrapper-${row.id} .other-symptom-input`);
                name = otherInput.value.trim();
                if (!name) { formIsValid = false; otherInput.style.borderColor = 'red'; } else { otherInput.style.borderColor = ''; }
            }
            if(formIsValid && name) {
                symptomsData.push({
                    name: name,
                    severity: row.querySelector('.severity-select').value
                });
            }
        });
        
        if (!formIsValid || symptomsData.length === 0) {
             alert('Por favor, completa la información de todos los síntomas.');
             return;
        }

        const record = {
            id: id ? parseInt(id) : Date.now(),
            date: form.elements.date.value,
            time: form.elements.time.value,
            symptoms: symptomsData,
            food: form.elements.food.value,
            // === INICIO SOLUCIÓN (Item 2): Leer desde el select ===
            meds: medSelect.value // Leer el valor del select
            // === FIN SOLUCIÓN ===
        };
        
        // Limpiar "otro" si no fue seleccionado
        if (record.meds === 'otro') {
            record.meds = '';
        }

        if (id) {
            const index = currentData.findIndex(rec => rec.id.toString() === id);
            if (index > -1) currentData[index] = record;
        } else {
            currentData.push(record);
        }
        
        store.saveGastricoData(currentData);
        closeFormModal();
        renderGastricoList(currentData);
    });

    listContainer?.addEventListener('click', (e) => {
        // ... (Tu lógica de editar/borrar sigue igual) ...
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        if (deleteBtn) {
            if (confirm('¿Estás seguro?')) {
                currentData = currentData.filter(rec => rec.id.toString() !== deleteBtn.dataset.id);
                store.saveGastricoData(currentData);
                renderGastricoList(currentData);
            }
        }
        if (editBtn) {
            const record = currentData.find(rec => rec.id.toString() === editBtn.dataset.id);
            if (record) openFormModal(record);
        }
    });

    renderGastricoList(currentData); // Render inicial
}