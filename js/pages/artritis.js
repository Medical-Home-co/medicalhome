/* --- pages/artritis.js --- */
// 1. Importar el store
import { store } from '../store.js';

// 2. Variable local para los datos
let currentArtritisData = [];
let currentMedsModal = []; // Array temporal SÓLO para el modal

/* --- Funciones de Renderizado --- */

function renderArtritisList() {
    const listContainer = document.getElementById('artritis-list-container');
    const emptyState = document.getElementById('artritis-empty-state');
    const addMainBtn = document.getElementById('add-artritis-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    // 3. Usar la variable cargada del store
    if (currentArtritisData.length === 0) {
        emptyState.classList.remove('hidden');
        addMainBtn.classList.add('hidden');
        listContainer.classList.add('hidden'); // Ocultar lista
    } else {
        emptyState.classList.add('hidden');
        addMainBtn.classList.remove('hidden');
        listContainer.classList.remove('hidden'); // Mostrar lista
        
        // Ordenar por fecha y hora (más reciente primero)
        const sortedData = [...currentArtritisData].sort((a, b) => {
             const dateA = new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`);
             const dateB = new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`);
             return dateB - dateA;
        });

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.style.padding = '1rem'; // Añadir padding
            
            let painClass = 'level-low'; // Verde (0-3)
            if (rec.painLevel >= 4 && rec.painLevel <= 7) painClass = 'level-medium'; // Naranja (4-7)
            if (rec.painLevel >= 8) painClass = 'level-high'; // Rojo (8-10)

            let mobilityClass = 'level-low'; // Verde (Leve)
            if (rec.mobility === 'Moderada') mobilityClass = 'level-medium'; // Naranja
            if (rec.mobility === 'Severa') mobilityClass = 'level-high'; // Rojo

            const jointsHTML = (rec.joints || []).map(joint => `<span class="tag">${joint}</span>`).join('');
            const symptomsHTML = (rec.symptoms || []).map(symptom => `<span class="tag">${symptom}</span>`).join('');
            const medsHTML = (rec.meds || []).map(med => `<span class="tag">${med}</span>`).join('');
            
            let formattedDate = 'Fecha no registrada';
            try { if(rec.date) formattedDate = new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); } catch(e) {}

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title" style="border: none; padding: 0; margin-bottom: 0.5rem;">${formattedDate} - ${rec.time || ''}</p>
                    </div>
                    <div class="card-actions" style="display: flex; gap: 0.5rem;">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash-2.svg" class="icon-delete" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="symptom-row">
                        <span>Nivel de Dolor</span>
                        <span class="level-indicator ${painClass}">${rec.painLevel}/10</span>
                    </div>
                    <div class="symptom-row">
                        <span>Limitación Movilidad</span>
                        <span class="level-indicator ${mobilityClass}">${rec.mobility || '-'}</span>
                    </div>
                    ${(rec.symptoms && rec.symptoms.length > 0) ? `<div class="tags-container" style="margin-top: 0.75rem;">${symptomsHTML}</div>` : ''}
                    ${(rec.joints && rec.joints.length > 0) ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Articulaciones:</p><div class="tags-container">${jointsHTML}</div>` : ''}
                    ${(rec.meds && rec.meds.length > 0) ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Medicación:</p><div class="tags-container">${medsHTML}</div>` : ''}
                     ${rec.notes ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem;">Notas:</p><p style="font-size: 0.9rem;">${rec.notes}</p>` : ''}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
    attachEventListeners(); // <-- 4. Llamar a listeners después de renderizar
}

/* --- Inyectar Estilos (Sin cambios) --- */
function injectArtritisStyles() {
    const styleId = 'artritis-dynamic-styles'; if (document.getElementById(styleId)) return; const style = document.createElement('style'); style.id = styleId;
    style.innerHTML = `
        .level-low { background-color: var(--success-light, #E8F5E9); color: var(--success-color, #2E7D32); }
        .level-medium { background-color: #FFF3E0; color: #E65100; }
        .level-high { background-color: var(--danger-light, #FFEBEE); color: var(--danger-color, #C62828); }
        .symptom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
        .symptom-row:last-of-type { border-bottom: none; }
        .level-indicator { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
        .tags-container { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
        .tag { background-color: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; }
        .tag button { margin-left: 4px; border: none; background: none; color: var(--danger-color); cursor: pointer; padding: 0; line-height: 1;}
        .data-label { margin-top: 0.75rem; font-weight: 500; color: var(--text-secondary); font-size: 0.9rem; }
    `;
    document.head.appendChild(style);
}

/* --- Variables globales del módulo para elementos del modal --- */
let formModal, form, medsListContainer, medInput;

/* --- Funciones del Modal --- */
function openFormModal(record = null) {
    if (!form || !formModal) return;
    form.reset();
    if(medsListContainer) medsListContainer.innerHTML = '';
    currentMedsModal = []; // Resetear meds del modal
    const now = new Date();
    document.getElementById('artritis-date').valueAsDate = now;
    document.getElementById('artritis-time').value = now.toTimeString().slice(0, 5);
    document.getElementById('artritis-id').value = '';
    document.getElementById('artritis-form-title').textContent = 'Nuevo Registro';
    document.getElementById('artritis-pain-level').value = '5'; // Valor por defecto

    if (record) { // Modo Editar
        document.getElementById('artritis-form-title').textContent = 'Editar Registro';
        document.getElementById('artritis-id').value = record.id;
        document.getElementById('artritis-date').value = record.date;
        document.getElementById('artritis-time').value = record.time;
        document.getElementById('artritis-pain-level').value = record.painLevel;
        document.getElementById('artritis-mobility').value = record.mobility;
        document.getElementById('artritis-notes').value = record.notes || '';
        (record.symptoms || []).forEach(symptom => { const el = form.querySelector(`input[name="symptoms"][value="${symptom}"]`); if (el) el.checked = true; });
        (record.joints || []).forEach(joint => { const el = form.querySelector(`input[name="joints"][value="${joint}"]`); if(el) el.checked = true; });
        currentMedsModal = [...(record.meds || [])];
        renderMedTags();
    }
    formModal?.classList.remove('hidden');
}

function closeFormModal() { formModal?.classList.add('hidden'); }

function renderMedTags() {
    if (!medsListContainer) return;
    medsListContainer.innerHTML = '';
    currentMedsModal.forEach((med, index) => {
        const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = med;
         const removeBtn = document.createElement('button'); removeBtn.textContent = 'x'; removeBtn.type = 'button';
         removeBtn.onclick = () => { currentMedsModal.splice(index, 1); renderMedTags(); };
         tag.appendChild(removeBtn);
        medsListContainer.appendChild(tag);
    });
}

/* --- Listeners (delegados al contenedor) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('artritis-list-container');
    if (!listContainer) return;
    const newContainer = listContainer.cloneNode(true);
    listContainer.parentNode.replaceChild(newContainer, listContainer);

    newContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        const recordIdStr = deleteBtn?.dataset.id || editBtn?.dataset.id;
        if (!recordIdStr) return; // No se hizo clic en un botón
        
        const recordId = parseInt(recordIdStr, 10);
        if (deleteBtn) {
            if (confirm('¿Eliminar este registro?')) {
                currentArtritisData = currentArtritisData.filter(rec => rec.id !== recordId);
                store.saveArtritisData(currentArtritisData); // <-- GUARDAR
                renderArtritisList(); // Re-renderizar
            }
        } else if (editBtn) {
            const record = currentArtritisData.find(rec => rec.id === recordId);
            if (record) openFormModal(record);
        }
    });
}

/* --- Función Principal --- */
export function init() {
    // 5. Cargar datos del store
    currentArtritisData = store.getArtritisData() || [];
    console.log("Cargado js/pages/artritis.js (conectado a store)");

    injectArtritisStyles();

    // Asignar variables globales del módulo
    formModal = document.getElementById('artritis-form-modal');
    form = document.getElementById('artritis-form');
    const addInitialBtn = document.getElementById('add-artritis-initial-btn');
    const addMainBtn = document.getElementById('add-artritis-main-btn');
    const cancelBtn = document.getElementById('cancel-artritis-btn');
    medInput = document.getElementById('artritis-med-input');
    const addMedBtn = document.getElementById('add-artritis-med-btn');
    medsListContainer = document.getElementById('artritis-meds-list');

    if (!formModal || !form || !addInitialBtn || !addMainBtn || !cancelBtn) {
         console.error("Faltan elementos HTML esenciales en artritis.html");
         document.getElementById('artritis-empty-state')?.classList.remove('hidden');
         return;
    }

    // Listeners de botones principales
    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);
    addMedBtn?.addEventListener('click', () => {
        const medName = medInput.value.trim();
        if (medName && !currentMedsModal.includes(medName)) {
            currentMedsModal.push(medName); medInput.value = ''; renderMedTags();
        }
    });

    // Listener del formulario
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const idValue = document.getElementById('artritis-id').value;
        const id = idValue ? parseInt(idValue, 10) : Date.now();
        const symptoms = Array.from(form.querySelectorAll('input[name="symptoms"]:checked')).map(el => el.value);
        const joints = Array.from(form.querySelectorAll('input[name="joints"]:checked')).map(el => el.value);
        
        const record = {
            id: id,
            date: document.getElementById('artritis-date').value,
            time: document.getElementById('artritis-time').value,
            painLevel: parseInt(document.getElementById('artritis-pain-level').value, 10),
            mobility: document.getElementById('artritis-mobility').value,
            symptoms, joints, meds: currentMedsModal,
            notes: document.getElementById('artritis-notes').value
        };

        if (idValue) { // Editando
            const index = currentArtritisData.findIndex(rec => rec.id === id);
            if (index > -1) currentArtritisData[index] = record;
        } else { // Agregando
            currentArtritisData.push(record);
        }
        
        store.saveArtritisData(currentArtritisData); // <-- 6. GUARDAR
        
        closeFormModal();
        renderArtritisList();
    });

    renderArtritisList(); // Renderizado inicial
}