// js/pages/ocular.js
import { store } from '../store.js';

const snellenOptions = [
    '6/6 (20/20)', '6/9 (20/30)', '6/12 (20/40)', '6/15 (20/50)',
    '6/18 (20/60)', '6/24 (20/80)', '6/30 (20/100)', '6/60 (20/200)',
    '3/60 (20/400)', '< 3/60 (< 20/400)',
    'Cuenta Dedos (CD)', 'Movimiento Manos (MM)', 'Percepción Luz (PL)', 'No Percepción Luz (NPL)',
    'Otro'
];

const currentYear = new Date().getFullYear();
const yearOptions = [''].concat(Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i));

// --- Funciones de Renderizado ---
function renderOcularList(data) {
    const listContainer = document.getElementById('ocular-list-container');
    const emptyState = document.getElementById('ocular-empty-state');
    const addMainBtn = document.getElementById('add-ocular-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = ''; // Limpiar antes de renderizar

    if (!data || data.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMainBtn.classList.remove('hidden');

        const sortedData = [...data].sort((a, b) => {
            const dateA = a.ultimo_examen && a.ultimo_examen.length > 0 ? new Date(a.ultimo_examen[a.ultimo_examen.length - 1]) : new Date(0);
            const dateB = b.ultimo_examen && b.ultimo_examen.length > 0 ? new Date(b.ultimo_examen[b.ultimo_examen.length - 1]) : new Date(0);
            return dateB - dateA;
        });

        sortedData.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'summary-card';

            const lastExamDate = entry.ultimo_examen && entry.ultimo_examen.length > 0
                ? new Date(entry.ultimo_examen[entry.ultimo_examen.length - 1] + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'N/A';

            let symptomsHTML = '<span style="font-size: 0.9rem; color: var(--text-secondary);">Sin síntomas</span>';
            if (entry.sintomas && entry.sintomas.length > 0) {
                symptomsHTML = '• ' + entry.sintomas.map(s => {
                    let formattedSymptom = s.replace(/_/g, ' ');
                    return formattedSymptom.charAt(0).toUpperCase() + formattedSymptom.slice(1);
                }).join(' • ');
            }

            let severityClass = 'level-unknown';
            let severityText = entry.clasificacion ? entry.clasificacion.charAt(0).toUpperCase() + entry.clasificacion.slice(1) : 'No clasificado';
            switch (entry.clasificacion) {
                case 'leve': severityClass = 'level-low'; break;
                case 'moderada': severityClass = 'level-medium'; break;
                case 'grave': severityClass = 'level-high'; break;
                case 'ceguera': severityClass = 'level-ceguera'; break;
            }

            // Asegurarse de que el ID se pasa como string si es numérico
            const entryId = entry.id.toString();

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title">Evaluación Ocular</p>
                        <p class="card-subtitle">Último examen: ${lastExamDate}</p>
                    </div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${entryId}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${entryId}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body" style="margin-top: 1rem;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; margin-bottom: 1rem;">
                        <div><p class="data-label">OD</p><p class="data-value-small">${entry.ojo_derecho || 'N/A'}</p></div>
                        <div><p class="data-label">OI</p><p class="data-value-small">${entry.ojo_izquierdo || 'N/A'}</p></div>
                        <div><p class="data-label">Binocular</p><p class="data-value-small">${entry.binocular || 'N/A'}</p></div>
                    </div>
                     <p style="margin-top: 0.75rem; font-size: 0.9rem;"><strong>Síntomas:</strong></p>
                     <p class="symptom-summary" style="margin-top: 0.5rem; font-size: 0.9rem;">${symptomsHTML}</p>
                     ${entry.observaciones ? `<p class="notes-row" style="margin-top: 1rem;">${entry.observaciones}</p>` : ''}
                </div>
                <div class="card-footer ${severityClass}" style="text-align: center; margin-top: 1rem; padding: 0.5rem; border-radius: 8px;">
                    <span style="font-weight: 600;">Clasificación: ${severityText}</span>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

function injectOcularStyles() {
    const styleId = 'ocular-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .data-label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; }
        .data-value-small { font-size: 1rem; font-weight: 600; margin-top: 0.25rem; }
        .notes-row { margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-secondary); background-color: var(--bg-secondary); padding: 0.5rem; border-radius: 6px; }
        .examen-date-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
        .examen-date-row input { flex-grow: 1; }
        .level-low { background-color: #E8F5E9; color: #2E7D32; }
        .level-medium { background-color: #FFF3E0; color: #E65100; }
        .level-high { background-color: #FFEBEE; color: #C62828; }
        .level-ceguera { background-color: #4A5568; color: #F7FAFC; }
        body.dark-theme .level-ceguera { background-color: #E53E3E; color: #1A202C; }
        .level-unknown { background-color: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-color); }
        .symptom-summary { color: var(--text-primary); }
    `;
    document.head.appendChild(style);
}

function populateSelect(selectId, optionsArray) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const currentValue = select.value;
    // Limpiar opciones EXCEPTO el placeholder si existe
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (placeholder) select.appendChild(placeholder); // Volver a añadir el placeholder

    optionsArray.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = option.textContent = optionValue;
        select.appendChild(option);
    });
    // Intentar restaurar valor, si no, dejar el placeholder
    if (optionsArray.includes(currentValue)) {
       select.value = currentValue;
    } else if (placeholder) {
       select.value = ""; // Valor del placeholder
    }
 }


function addExamenDateRow(container, dateValue = '') {
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'examen-date-row';

    const input = document.createElement('input');
    input.type = 'date';
    input.name = 'ultimo_examen[]';
    input.className = 'form-input';
    input.value = dateValue;

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'button button-secondary button-small';

    // Ahora SÓLO el botón "Agregar" tiene ID
    if (!container.querySelector('#add-examen-btn')) {
        actionBtn.id = 'add-examen-btn';
        actionBtn.textContent = 'Agregar';
        actionBtn.onclick = () => addExamenDateRow(container);
    } else {
        actionBtn.textContent = 'Quitar';
        actionBtn.onclick = () => row.remove();
    }

    row.appendChild(input);
    row.appendChild(actionBtn);
    container.appendChild(row);
}


function handleSnellenChange(selectId, containerId) {
    const select = document.getElementById(selectId);
    const container = document.getElementById(containerId);
    if (!select || !container) return;
    container.classList.toggle('hidden', select.value !== 'Otro');
}


// --- Función Principal ---
export function init() {
    injectOcularStyles();
    let currentData = store.getOcularData();

    const formModal = document.getElementById('ocular-form-modal');
    const form = document.getElementById('ocular-form');
    const addInitialBtn = document.getElementById('add-ocular-initial-btn');
    const addMainBtn = document.getElementById('add-ocular-main-btn');
    const cancelBtn = document.getElementById('cancel-ocular-btn');
    const listContainer = document.getElementById('ocular-list-container');
    const examenContainer = document.getElementById('ocular-examen-container');

    populateSelect('ocular-od', snellenOptions);
    populateSelect('ocular-oi', snellenOptions);
    populateSelect('ocular-binocular', snellenOptions);
    populateSelect('ocular-anio-inicio', yearOptions);

    document.getElementById('ocular-od')?.addEventListener('change', () => handleSnellenChange('ocular-od', 'ocular-od-otro-container'));
    document.getElementById('ocular-oi')?.addEventListener('change', () => handleSnellenChange('ocular-oi', 'ocular-oi-otro-container'));
    document.getElementById('ocular-binocular')?.addEventListener('change', () => handleSnellenChange('ocular-binocular', 'ocular-binocular-otro-container'));


    function openFormModal(record = null) {
        if (!form) return;
        form.reset();

        examenContainer.innerHTML = '';
        addExamenDateRow(examenContainer); // Siempre añadir la primera fila

        document.getElementById('ocular-od-otro-container')?.classList.add('hidden');
        document.getElementById('ocular-oi-otro-container')?.classList.add('hidden');
        document.getElementById('ocular-binocular-otro-container')?.classList.add('hidden');
        document.getElementById('ocular-entry-id').value = '';
        document.getElementById('ocular-form-title').textContent = 'Agregar Evaluación Ocular';

        if (record) {
            document.getElementById('ocular-form-title').textContent = 'Editar Evaluación';
            document.getElementById('ocular-entry-id').value = record.id;

            ['ojo_derecho', 'ojo_izquierdo', 'binocular'].forEach(key => {
                 const selectId = `ocular-${key === 'ojo_derecho' ? 'od' : (key === 'ojo_izquierdo' ? 'oi' : key)}`;
                 const select = document.getElementById(selectId);
                 const otroContainerId = `${selectId}-otro-container`;
                 const otroInput1 = document.getElementById(`${selectId}-otro1`);
                 const otroInput2 = document.getElementById(`${selectId}-otro2`);
                 if (select) {
                     const value = record[key];
                     // Primero, intentar encontrar el valor exacto en las opciones
                     const optionExists = Array.from(select.options).some(opt => opt.value === value);
                     if (optionExists) {
                         select.value = value;
                     } else if (value && value.includes('/')) { // Si no existe y tiene '/', asumir "Otro"
                         select.value = 'Otro';
                         const parts = value.split('/');
                         if (otroInput1) otroInput1.value = parts[0] || '';
                         if (otroInput2) otroInput2.value = parts[1] || '';
                     } else {
                          select.value = value || ''; // Valor por defecto o vacío
                     }
                      select.dispatchEvent(new Event('change')); // Actualizar visibilidad de "Otro"
                 }
            });


            form.elements.clasificacion.value = record.clasificacion || '';
            form.elements.anio_inicio.value = record.anio_inicio || '';
            form.querySelectorAll('input[name="correccion"]').forEach(cb => cb.checked = (record.correccion && record.correccion.includes(cb.value)));
            form.querySelectorAll('input[name="sintomas"]').forEach(cb => cb.checked = (record.sintomas && record.sintomas.includes(cb.value)));

            // Llenar fechas de examen (sin re-añadir listener aquí)
            if (record.ultimo_examen && record.ultimo_examen.length > 0) {
                 examenContainer.innerHTML = ''; // Limpiar primero
                 record.ultimo_examen.forEach(date => addExamenDateRow(examenContainer, date));
                 if (!examenContainer.querySelector('#add-examen-btn')) {
                     addExamenDateRow(examenContainer);
                 }
            } // Si no hay fechas, la fila inicial ya tiene el botón

            form.elements.observaciones.value = record.observaciones || '';
        }

        formModal?.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal?.classList.add('hidden');
    }

    // --- Listeners Principales ---
    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    // SOLUCIÓN: Listener de 'Agregar Fecha' movido a examenContainer (delegación)
    // El listener onclick dentro de addExamenDateRow se encarga de añadir nuevas filas
    examenContainer?.addEventListener('click', (e) => {
        // Añadir lógica para 'Quitar' si es necesario, usando closest()
        const removeBtn = e.target.closest('.remove-examen-btn'); // Asumiendo que añades esta clase
        if (removeBtn) {
            removeBtn.closest('.examen-date-row')?.remove();
        }
    });


    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        let validationFailed = false; // <-- CAMBIO 1: Añadida variable bandera
        const id = document.getElementById('ocular-entry-id').value;
        const formData = new FormData(form);
        const data = {};

        ['ojo_derecho', 'ojo_izquierdo', 'binocular'].forEach(key => {
            const selectId = `ocular-${key === 'ojo_derecho' ? 'od' : (key === 'ojo_izquierdo' ? 'oi' : key)}`;
            const select = document.getElementById(selectId);
            if(select.value === 'Otro') {
                 const otroInput1 = document.getElementById(`${selectId}-otro1`);
                 const otroInput2 = document.getElementById(`${selectId}-otro2`);
                 // Validar que los inputs "Otro" tengan valor si "Otro" está seleccionado
                 if (!otroInput1.value || !otroInput2.value) {
                     alert(`Por favor, especifica el valor para ${select.previousElementSibling.textContent} o selecciona una opción válida.`);
                     // e.preventDefault(); // <-- CAMBIO 2: Eliminada llamada redundante
                     validationFailed = true; // <-- CAMBIO 3: Usar la bandera
                     return; 
                 }
                 data[key] = `${otroInput1.value}/${otroInput2.value}`;
            } else {
                 data[key] = select.value;
            }
        });
        
        // Si el formulario fue detenido por validación, salir
        if (validationFailed) return; // <-- CAMBIO 4: Comprobar la bandera, no e.defaultPrevented

        data.id = id ? parseInt(id) : Date.now();
        data.clasificacion = formData.get('clasificacion');
        data.anio_inicio = formData.get('anio_inicio');
        data.correccion = formData.getAll('correccion');
        data.ultimo_examen = formData.getAll('ultimo_examen[]').filter(date => date);
        data.sintomas = formData.getAll('sintomas');
        data.observaciones = formData.get('observaciones');


        if (id) {
            const index = currentData.findIndex(rec => rec.id.toString() === id);
            if (index > -1) currentData[index] = data;
        } else {
            currentData.push(data);
        }

        store.saveOcularData(currentData);
        closeFormModal();
        renderOcularList(currentData);
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        // Asegurarse de que el ID se lee correctamente
        const targetId = deleteBtn?.dataset.id || editBtn?.dataset.id; 

        if (deleteBtn) {
            if (confirm('¿Estás seguro?')) {
                currentData = currentData.filter(rec => rec.id.toString() !== targetId);
                store.saveOcularData(currentData);
                renderOcularList(currentData);
            }
        } else if (editBtn) {
            const record = currentData.find(rec => rec.id.toString() === targetId);
            if (record) openFormModal(record);
        }
    });

    renderOcularList(currentData);
}
