/* --- pages/ocular.js --- */
import { store } from '../store.js'; // Importar store desde carpeta superior (js/)

let currentOcularData = []; // Array para guardar múltiples evaluaciones

/* --- Función para rellenar el select de años --- */
function populateYearSelect() {
    const select = document.getElementById("ocular-anio-inicio");
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar año</option>'; // Opción por defecto
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1930; year--) {
        const option = document.createElement("option");
        option.value = year; option.textContent = year; select.appendChild(option);
    }
}

/* --- Función para renderizar campos de fecha de examen --- */
function renderExamenDates(container, dates = ['']) { // Siempre mostrar al menos uno vacío
     if (!container) return;
     container.innerHTML = '';
     // Asegurar que siempre haya al menos un campo
     const datesToRender = dates && dates.length > 0 ? dates : [''];

     datesToRender.forEach((dateValue, index) => {
         const row = document.createElement('div'); row.className = 'examen-date-row';
         const input = document.createElement('input'); input.type = 'date'; input.name = 'ultimo_examen[]'; input.className = 'form-input'; input.value = dateValue || ''; row.appendChild(input);
         if (index === 0) {
             /* El primer botón siempre es "Agregar" */
             const addButton = document.createElement('button'); addButton.type = 'button'; addButton.id = 'add-examen-btn'; addButton.className = 'button button-secondary button-small'; addButton.textContent = '+ Agregar'; row.appendChild(addButton);
         } else {
             /* Los siguientes tienen botón "Eliminar" */
             const removeButton = document.createElement('button'); removeButton.type = 'button'; removeButton.className = 'button button-secondary button-small remove-examen-btn'; removeButton.textContent = 'Eliminar'; row.appendChild(removeButton);
         }
         container.appendChild(row);
     });
}

/* --- Función para renderizar la lista de tarjetas de resumen --- */
function renderOcularList() {
    const listContainer = document.getElementById('ocular-list-container');
    const emptyState = document.getElementById('ocular-empty-state');
    const addOcularMainBtn = document.getElementById('add-ocular-main-btn');
    if (!listContainer || !emptyState || !addOcularMainBtn) { return; }
    listContainer.innerHTML = '';

    if (currentOcularData.length === 0) {
        emptyState.classList.remove('hidden'); listContainer.classList.add('hidden'); addOcularMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden'); listContainer.classList.remove('hidden'); addOcularMainBtn.classList.remove('hidden');
        currentOcularData.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'summary-card'; // Clase base
            card.style.padding = '1rem';

            /* Aplicar clases de color (level-low, etc.) al indicador */
            let levelClass = '';
            switch (entry.clasificacion) {
                case 'leve': levelClass = 'level-low'; break;
                case 'moderada': levelClass = 'level-medium'; break;
                case 'grave': case 'ceguera': levelClass = 'level-high'; break;
            }

            const entryDate = entry.id ? new Date(entry.id).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year:'numeric' }) : 'Fecha desconocida';
            const clasificacionText = entry.clasificacion ? entry.clasificacion.charAt(0).toUpperCase() + entry.clasificacion.slice(1) : '-';

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">Evaluación Ocular</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Registrada: ${entryDate}</p>
                        <p style="margin-top: 0.5rem; font-size: 0.9rem;">
                            Agudeza: OD: ${entry.ojo_derecho || '-'} / OI: ${entry.ojo_izquierdo || '-'} / Binoc: ${entry.binocular || '-'}
                        </p>
                         <div class="symptom-row" style="padding: 0.5rem 0 0 0; border: none;">
                            <span>Clasificación</span>
                            <span class="level-indicator ${levelClass}">${clasificacionText}</span>
                         </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                         <button class="icon-button edit-ocular-btn" data-id="${entry.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                         <button class="icon-button delete-ocular-btn" data-id="${entry.id}"><img src="images/icons/trash-2.svg" alt="Eliminar"></button>
                     </div>
                 </div>`;
            listContainer.appendChild(card);
        });
    }
    attachCardActionListeners(); // Volver a asignar listeners para botones Editar/Eliminar
}

/* --- Función para rellenar el formulario (Modo Edición) --- */
function populateForm(form, entryData) {
    if (!form || !entryData) return;
    Object.keys(entryData).forEach(key => {
        if (key === 'sintomas' || key === 'ultimo_examen') return; // Arrays se manejan aparte
        const element = form.elements[key]; if (!element) return;
        if (element instanceof RadioNodeList) { element.forEach(radio => radio.checked = (radio.value === entryData[key])); }
        else if ('value' in element) { element.value = entryData[key] || ''; }
    });
    const sintomasGuardados = entryData.sintomas || []; form.querySelectorAll('input[name="sintomas"]').forEach(checkbox => checkbox.checked = sintomasGuardados.includes(checkbox.value));
    const examenContainer = document.getElementById('ocular-examen-container'); renderExamenDates(examenContainer, entryData.ultimo_examen || []);
}

/* --- Funciones del Modal --- */
function openFormModal(entryData = null) {
    const formModal = document.getElementById('ocular-form-modal'); const form = document.getElementById('ocular-form'); const formTitle = document.getElementById('ocular-form-title'); const entryIdInput = document.getElementById('ocular-entry-id'); const examenContainer = document.getElementById('ocular-examen-container');
    if (!formModal || !form || !formTitle || !entryIdInput || !examenContainer) return;
    form.reset(); entryIdInput.value = ''; renderExamenDates(examenContainer); // Renderizar campo vacío inicial
    if (entryData) { formTitle.textContent = 'Editar Evaluación Ocular'; entryIdInput.value = entryData.id; populateForm(form, entryData); }
    else { formTitle.textContent = 'Agregar Evaluación Ocular'; }
    formModal.classList.remove('hidden');
}
function closeFormModal() { document.getElementById('ocular-form-modal')?.classList.add('hidden'); }

/* --- Funciones de Eventos del Formulario (Agregar/Eliminar Fecha) --- */
function handleAddExamen() {
    const container = document.getElementById('ocular-examen-container');
    if (!container) return;
    const row = document.createElement('div'); row.className = 'examen-date-row';
    row.innerHTML = `<input type="date" name="ultimo_examen[]" class="form-input"><button type="button" class="button button-secondary button-small remove-examen-btn">Eliminar</button>`;
    container.appendChild(row);
}
function handleRemoveExamen(button) { button.closest('.examen-date-row')?.remove(); }

/* --- Función de Envío del Formulario (Guardar) --- */
function handleFormSubmit(e) {
    e.preventDefault(); const form = e.target; const formData = new FormData(form); const entryId = document.getElementById('ocular-entry-id').value;
    const data = {
        ojo_derecho: formData.get('ojo_derecho'), ojo_izquierdo: formData.get('ojo_izquierdo'), binocular: formData.get('binocular'),
        clasificacion: formData.get('clasificacion'), anio_inicio: formData.get('anio_inicio'), correccion: formData.get('correccion'),
        medicaciones: formData.get('medicaciones'), campo_visual: formData.get('campo_visual'), observaciones: formData.get('observaciones'),
        sintomas: formData.getAll('sintomas'), ultimo_examen: formData.getAll('ultimo_examen[]').filter(date => date) // Filtrar vacíos
    };
    if (entryId) { // Editar
        const index = currentOcularData.findIndex(entry => entry.id.toString() === entryId);
        if (index > -1) { currentOcularData[index] = { ...currentOcularData[index], ...data, id: parseInt(entryId) }; } // Mantener ID numérico
        else { console.error("ID Editar no encontrado:", entryId); return; }
    } else { // Agregar
        data.id = Date.now(); currentOcularData.push(data);
    }
    store.saveOcularData(currentOcularData); // Guardar array en store
    closeFormModal(); renderOcularList();
}

/* --- Asignar Listeners a Tarjetas (Editar/Eliminar) --- */
function attachCardActionListeners() {
     const listContainer = document.getElementById('ocular-list-container');
     if (!listContainer) return;
     const newContainer = listContainer.cloneNode(true); // Clonar para limpiar
     listContainer.parentNode.replaceChild(newContainer, listContainer);

     newContainer.addEventListener('click', (e) => {
         const editBtn = e.target.closest('.edit-ocular-btn');
         const deleteBtn = e.target.closest('.delete-ocular-btn');
         if (editBtn) {
             const entryId = parseInt(editBtn.dataset.id, 10);
             const entryToEdit = currentOcularData.find(entry => entry.id === entryId);
             if (entryToEdit) openFormModal(entryToEdit);
         } else if (deleteBtn) {
             const entryId = parseInt(deleteBtn.dataset.id, 10);
             if (confirm("¿Eliminar esta evaluación ocular?")) {
                 currentOcularData = currentOcularData.filter(entry => entry.id !== entryId);
                 store.saveOcularData(currentOcularData);
                 renderOcularList();
             }
         }
     });
}

/* --- Función Principal --- */
export function init() {
    console.log("Cargado js/pages/ocular.js (vStore)");
    currentOcularData = store.getOcularData() || []; // Cargar datos del store
    if (!Array.isArray(currentOcularData)) { currentOcularData = []; store.saveOcularData(currentOcularData); } // Asegurar que sea array

    populateYearSelect(); // Generar años

    const formModal = document.getElementById('ocular-form-modal');
    const addOcularInitialBtn = document.getElementById('add-ocular-initial-btn');
    const addOcularMainBtn = document.getElementById('add-ocular-main-btn');
    const cancelOcularBtn = document.getElementById('cancel-ocular-btn');
    const ocularForm = document.getElementById('ocular-form');
    const examenContainer = document.getElementById('ocular-examen-container'); // Contenedor para fechas

    if (!formModal || !addOcularInitialBtn || !addOcularMainBtn || !cancelOcularBtn || !ocularForm || !examenContainer) {
        console.error("Elementos clave para Ocular no encontrados.");
        document.getElementById('ocular-list-container')?.classList.add('hidden');
        document.getElementById('ocular-empty-state')?.classList.remove('hidden');
        return;
    }

    /* --- Asignar Listeners --- */
    addOcularInitialBtn.addEventListener('click', () => openFormModal());
    addOcularMainBtn.addEventListener('click', () => openFormModal());
    cancelOcularBtn.addEventListener('click', closeFormModal);
    ocularForm.addEventListener('submit', handleFormSubmit);

    /* Listener único con delegación para botones de fecha (+ Agregar / Eliminar) */
    examenContainer.addEventListener('click', (e) => {
        if (e.target.id === 'add-examen-btn') {
            handleAddExamen();
        } else if (e.target.classList.contains('remove-examen-btn')) {
            handleRemoveExamen(e.target);
        }
    });

    attachCardActionListeners(); // Listeners para tarjetas (Editar/Eliminar)
    renderOcularList(); // Renderizado inicial
}