// --- Base de Datos Temporal ---
let tempArtritisDB = [];

// --- Funciones de Renderizado ---

function renderArtritisList() {
    const listContainer = document.getElementById('artritis-list-container');
    const emptyState = document.getElementById('artritis-empty-state');
    const addMainBtn = document.getElementById('add-artritis-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    if (tempArtritisDB.length === 0) {
        emptyState.classList.remove('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        addMainBtn.classList.remove('hidden');
        tempArtritisDB.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        tempArtritisDB.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            // Lógica para clasificar el dolor
            let painClass = 'level-low'; // Verde por defecto (0-3)
            if (rec.painLevel >= 4 && rec.painLevel <= 7) painClass = 'level-medium'; // Naranja (4-7)
            if (rec.painLevel >= 8) painClass = 'level-high'; // Rojo (8-10)

             // Lógica para clasificar la movilidad
            let mobilityClass = 'level-low'; // Verde por defecto (Leve)
            if (rec.mobility === 'Moderada') mobilityClass = 'level-medium'; // Naranja
            if (rec.mobility === 'Severa') mobilityClass = 'level-high'; // Rojo

            const jointsHTML = rec.joints.map(joint => `<span class="tag">${joint}</span>`).join('');
            const symptomsHTML = rec.symptoms.map(symptom => `<span class="tag">${symptom}</span>`).join('');
            const medsHTML = rec.meds.map(med => `<span class="tag">${med}</span>`).join('');

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title">${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} - ${rec.time}</p>
                    </div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="symptom-row">
                        <span>Nivel de Dolor</span>
                        <span class="level-indicator ${painClass}">${rec.painLevel}/10</span>
                    </div>
                    <div class="symptom-row">
                        <span>Limitación Movilidad</span>
                        <span class="level-indicator ${mobilityClass}">${rec.mobility}</span>
                    </div>
                    ${rec.symptoms.length > 0 ? `<div class="tags-container" style="margin-top: 0.75rem;">${symptomsHTML}</div>` : ''}
                    ${rec.joints.length > 0 ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 600;">Articulaciones:</p><div class="tags-container">${jointsHTML}</div>` : ''}
                    ${rec.meds.length > 0 ? `<p class="data-label" style="margin-top: 0.75rem; font-weight: 600;">Medicación:</p><div class="tags-container">${medsHTML}</div>` : ''}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

// --- Lógica de Estilos Dinámicos ---
function injectArtritisStyles() {
    const styleId = 'artritis-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .level-low { background-color: #E8F5E9; color: #2E7D32; } /* Verde */
        .level-medium { background-color: #FFF3E0; color: #E65100; } /* Naranja */
        .level-high { background-color: #FFEBEE; color: #C62828; } /* Rojo */
        .symptom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
        .level-indicator { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
        .tags-container { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
        .tag { background-color: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectArtritisStyles();

    const formModal = document.getElementById('artritis-form-modal');
    const form = document.getElementById('artritis-form');
    const addInitialBtn = document.getElementById('add-artritis-initial-btn');
    const addMainBtn = document.getElementById('add-artritis-main-btn');
    const cancelBtn = document.getElementById('cancel-artritis-btn');
    const listContainer = document.getElementById('artritis-list-container');
    const medInput = document.getElementById('artritis-med-input');
    const addMedBtn = document.getElementById('add-artritis-med-btn');
    const medsListContainer = document.getElementById('artritis-meds-list');
    
    let currentMeds = [];

    function openFormModal(record = null) {
        if (!form) return;
        form.reset();
        medsListContainer.innerHTML = '';
        currentMeds = [];
        const now = new Date();
        document.getElementById('artritis-date').valueAsDate = now;
        document.getElementById('artritis-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('artritis-id').value = '';
        document.getElementById('artritis-form-title').textContent = 'Nuevo Registro de Artritis';

        if (record) {
            document.getElementById('artritis-form-title').textContent = 'Editar Registro';
            document.getElementById('artritis-id').value = record.id;
            document.getElementById('artritis-date').value = record.date;
            document.getElementById('artritis-time').value = record.time;
            document.getElementById('artritis-pain-level').value = record.painLevel;
            document.getElementById('artritis-mobility').value = record.mobility;
            document.getElementById('artritis-notes').value = record.notes;
            record.symptoms.forEach(symptom => {
                const el = form.querySelector(`input[name="symptoms"][value="${symptom}"]`);
                if (el) el.checked = true;
            });
            record.joints.forEach(joint => {
                const el = form.querySelector(`input[name="joints"][value="${joint}"]`);
                if(el) el.checked = true;
            });
            currentMeds = [...record.meds] || [];
            renderMedTags();
        }
        formModal?.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal?.classList.add('hidden');
    }

    function renderMedTags() {
        medsListContainer.innerHTML = '';
        currentMeds.forEach((med, index) => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = ` ${med} X `;
            tag.onclick = () => {
                currentMeds.splice(index, 1);
                renderMedTags();
            };
            medsListContainer.appendChild(tag);
        });
    }

    addMedBtn?.addEventListener('click', () => {
        const medName = medInput.value.trim();
        if (medName && !currentMeds.includes(medName)) {
            currentMeds.push(medName);
            medInput.value = '';
            renderMedTags();
        }
    });

    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('artritis-id').value;
        const symptoms = Array.from(form.querySelectorAll('input[name="symptoms"]:checked')).map(el => el.value);
        const joints = Array.from(form.querySelectorAll('input[name="joints"]:checked')).map(el => el.value);
        
        const record = {
            id: id || Date.now(),
            date: document.getElementById('artritis-date').value,
            time: document.getElementById('artritis-time').value,
            painLevel: document.getElementById('artritis-pain-level').value,
            mobility: document.getElementById('artritis-mobility').value,
            symptoms,
            joints,
            meds: currentMeds,
            notes: document.getElementById('artritis-notes').value
        };

        if (id) {
            const index = tempArtritisDB.findIndex(rec => rec.id.toString() === id);
            if (index > -1) tempArtritisDB[index] = record;
        } else {
            tempArtritisDB.push(record);
        }
        
        closeFormModal();
        renderArtritisList();
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        if (deleteBtn) {
            if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                tempArtritisDB = tempArtritisDB.filter(rec => rec.id.toString() !== deleteBtn.dataset.id);
                renderArtritisList();
            }
        }
        if (editBtn) {
            const record = tempArtritisDB.find(rec => rec.id.toString() === editBtn.dataset.id);
            if (record) openFormModal(record);
        }
    });

    renderArtritisList();
}

