import { store } from '../store.js'; // <-- CAMBIO: Importar el store

// --- Base de Datos Temporal ---
// let tempRespiratorioDB = []; // <-- CAMBIO: No usar la base de datos temporal

// --- Funciones de Renderizado ---

function renderRespiratorioList() {
    const listContainer = document.getElementById('respiratorio-list-container');
    const emptyState = document.getElementById('respiratorio-empty-state');
    const addMainBtn = document.getElementById('add-respiratorio-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    const currentData = store.getRespiratorioData(); // <-- CAMBIO: Leer del store

    if (currentData.length === 0) { // <-- CAMBIO
        emptyState.classList.remove('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        addMainBtn.classList.remove('hidden');
        currentData.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time)); // <-- CAMBIO

        currentData.forEach(rec => { // <-- CAMBIO
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            let severityClass = 'level-low';
            if (rec.severity === 'Moderado') severityClass = 'level-medium';
            if (rec.severity === 'Severo') severityClass = 'level-high';

            const symptomsHTML = rec.symptoms.map(symptom => `<span class="tag">${symptom}</span>`).join('');

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
                        <span>Nivel General</span>
                        <span class="level-indicator ${severityClass}">${rec.severity}</span>
                    </div>
                    ${rec.peakFlow ? `<div class="symptom-row"><span>Flujo Máximo</span><span style="font-weight: 600;">${rec.peakFlow} L/min</span></div>` : ''}
                    ${rec.symptoms.length > 0 ? `<div class="tags-container" style="margin-top: 0.75rem;">${symptomsHTML}</div>` : ''}
                    ${rec.inhalerDose ? `<p class="info-row"><strong>Inhalador Rescate:</strong> ${rec.inhalerDose}</p>` : ''}
                    ${rec.oxygenDetails ? `<p class="info-row"><strong>Oxígeno Suplementario:</strong> ${rec.oxygenDetails}</p>` : ''}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

function injectRespiratorioStyles() {
    const styleId = 'respiratory-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .level-low { background-color: #E8F5E9; color: #2E7D32; }
        .level-medium { background-color: #FFF3E0; color: #E65100; }
        .level-high { background-color: #FFEBEE; color: #C62828; }
        .symptom-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); }
        .level-indicator { font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.9rem; }
        .tags-container { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
        .tag { background-color: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.85rem; }
        .info-row { margin-top: 0.75rem; font-size: 0.9rem; padding: 0.5rem; background-color: var(--bg-secondary); border-radius: 6px; }
        .form-section { border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; }
        .radio-group { display: flex; justify-content: space-between; align-items: center; }
    `;
    document.head.appendChild(style);
}

export function init() {
    injectRespiratorioStyles();

    const formModal = document.getElementById('respiratorio-form-modal');
    const form = document.getElementById('respiratorio-form');
    const listContainer = document.getElementById('respiratorio-list-container');
    
    // --- Lógica para campos condicionales ---
    const inhalerYes = document.getElementById('inhaler-yes');
    const inhalerNo = document.getElementById('inhaler-no');
    const inhalerDoseContainer = document.getElementById('inhaler-dose-container');
    
    const oxygenYes = document.getElementById('oxygen-yes');
    const oxygenNo = document.getElementById('oxygen-no');
    const oxygenDetailsContainer = document.getElementById('oxygen-details-container');

    inhalerYes?.addEventListener('change', () => inhalerDoseContainer.classList.remove('hidden'));
    inhalerNo?.addEventListener('change', () => inhalerDoseContainer.classList.add('hidden'));
    oxygenYes?.addEventListener('change', () => oxygenDetailsContainer.classList.remove('hidden'));
    oxygenNo?.addEventListener('change', () => oxygenDetailsContainer.classList.add('hidden'));


    function openFormModal(record = null) {
        if (!form) return;
        form.reset();
        inhalerDoseContainer.classList.add('hidden');
        oxygenDetailsContainer.classList.add('hidden');

        const now = new Date();
        document.getElementById('respiratorio-date').valueAsDate = now;
        document.getElementById('respiratorio-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('respiratorio-id').value = '';
        document.getElementById('respiratorio-form-title').textContent = 'Nuevo Registro Respiratorio';

        if (record) {
            document.getElementById('respiratorio-form-title').textContent = 'Editar Registro';
            document.getElementById('respiratorio-id').value = record.id;
            document.getElementById('respiratorio-date').value = record.date;
            document.getElementById('respiratorio-time').value = record.time;
            document.getElementById('respiratorio-severity').value = record.severity;
            record.symptoms.forEach(s => {
                const el = form.querySelector(`input[name="symptoms"][value="${s}"]`);
                if(el) el.checked = true;
            });
            document.getElementById('respiratorio-peakflow').value = record.peakFlow || '';
            document.getElementById('respiratorio-notes').value = record.notes || '';

            if (record.inhalerDose) {
                if(inhalerYes) inhalerYes.checked = true;
                inhalerDoseContainer.classList.remove('hidden');
                document.getElementById('respiratorio-inhaler-dose').value = record.inhalerDose;
            }
             if (record.oxygenDetails) {
                if(oxygenYes) oxygenYes.checked = true;
                oxygenDetailsContainer.classList.remove('hidden');
                document.getElementById('respiratorio-oxygen-details').value = record.oxygenDetails;
            }
        }
        formModal?.classList.remove('hidden');
    }

    function closeFormModal() {
        formModal?.classList.add('hidden');
    }

    document.getElementById('add-respiratorio-initial-btn')?.addEventListener('click', () => openFormModal());
    document.getElementById('add-respiratorio-main-btn')?.addEventListener('click', () => openFormModal());
    document.getElementById('cancel-respiratorio-btn')?.addEventListener('click', closeFormModal);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('respiratorio-id').value;
        const symptoms = Array.from(form.querySelectorAll('input[name="symptoms"]:checked')).map(el => el.value);
        
        const record = {
            id: id || Date.now(),
            date: document.getElementById('respiratorio-date').value,
            time: document.getElementById('respiratorio-time').value,
            severity: document.getElementById('respiratorio-severity').value,
            symptoms,
            peakFlow: document.getElementById('respiratorio-peakflow').value || null,
            inhalerDose: form.elements.usedInhaler.value === 'yes' ? document.getElementById('respiratorio-inhaler-dose').value : null,
            oxygenDetails: form.elements.usedOxygen.value === 'yes' ? document.getElementById('respiratorio-oxygen-details').value : null,
            notes: document.getElementById('respiratorio-notes').value
        };

        let currentData = store.getRespiratorioData(); // <-- CAMBIO: Leer del store

        if (id) {
            const index = currentData.findIndex(rec => rec.id.toString() === id); // <-- CAMBIO
            if (index > -1) currentData[index] = record; // <-- CAMBIO
        } else {
            currentData.push(record); // <-- CAMBIO
        }
        
        store.saveRespiratorioData(currentData); // <-- CAMBIO: Guardar en el store
        
        closeFormModal();
        renderRespiratorioList();
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        
        let currentData = store.getRespiratorioData(); // <-- CAMBIO: Leer del store

        if (deleteBtn) {
            if (confirm('¿Estás seguro?')) {
                currentData = currentData.filter(rec => rec.id.toString() !== deleteBtn.dataset.id); // <-- CAMBIO
                store.saveRespiratorioData(currentData); // <-- CAMBIO: Guardar en el store
                renderRespiratorioList();
            }
        }
        if (editBtn) {
            const record = currentData.find(rec => rec.id.toString() === editBtn.dataset.id); // <-- CAMBIO
            if (record) openFormModal(record);
        }
    });

    renderRespiratorioList();
}
