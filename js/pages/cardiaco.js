// js/pages/cardiaco.js
import { store } from '../store.js';

// --- Funciones de Renderizado ---
function renderCardiacoList(data) {
    const listContainer = document.getElementById('cardiaco-list-container');
    const emptyState = document.getElementById('cardiaco-empty-state');
    const addMainBtn = document.getElementById('add-cardiaco-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) {
        console.error("Elementos UI cardiaco faltantes.");
        return;
    }

    listContainer.innerHTML = ''; // Limpiar antes de renderizar

    if (!data || data.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMainBtn.classList.remove('hidden');

        const sortedData = [...data].sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        sortedData.forEach(rec => {
            if (!rec || rec.id === undefined || rec.id === null) {
                 console.warn("Registro inválido encontrado (sin ID):", rec);
                 return; // Saltar este registro
            }

            const card = document.createElement('div');
            card.className = 'summary-card';

            let pressureClass = 'pressure-normal';
            let pressureText = 'Normal';
            const sys = parseInt(rec.systolic);
            const dia = parseInt(rec.diastolic);

            if (!isNaN(sys) && !isNaN(dia)) {
                if (sys >= 140 || dia >= 90) {
                    pressureClass = 'pressure-high'; pressureText = 'Alta';
                } else if (sys < 90 || dia < 60) {
                    if ((sys < 90 && dia < 60) || sys < 80 || dia < 50) {
                         pressureClass = 'pressure-low'; pressureText = 'Baja';
                    }
                }
            } else {
                 pressureClass = 'pressure-unknown';
                 pressureText = 'Inválida';
            }

            let symptomsHTML = '';
            if (rec.symptoms && rec.symptoms.length > 0) {
                 symptomsHTML = `
                <p style="margin-top: 0.75rem; font-size: 0.9rem;">
                    <strong>• Síntomas:</strong> ${rec.symptoms.join(' • ')}
                </p>`;
            }

            const entryId = rec.id.toString();

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <p class="card-title" style="margin-bottom: 0.25rem;">
                            ${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} - ${rec.time}
                        </p>
                        
                        <p class="card-subtitle" style="margin-top: 0.25rem;">
                            ${
                                (() => { // Usar IIFE para lógica compleja dentro de template literal
                                    let formattedTime = rec.measurementTime ? (rec.measurementTime.replace(/_/g, ' ').charAt(0).toUpperCase() + rec.measurementTime.replace(/_/g, ' ').slice(1)) : '';
                                    let notesText = rec.notes || '';
                                    
                                    if (formattedTime && notesText) {
                                        return `${formattedTime}: ${notesText}`; // Ambos existen
                                    } else if (formattedTime) {
                                        return formattedTime; // Solo momento
                                    } else if (notesText) {
                                        return notesText; // Solo notas
                                    } else {
                                        return 'Sin notas adicionales'; // Ninguno existe
                                    }
                                })() // Ejecutar la IIFE
                            }
                        </p>
                        
                    </div>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${entryId}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${entryId}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; margin-top: 1rem;">
                    <div><p class="data-label">Sistólica</p><p class="data-value">${!isNaN(sys) ? sys : '--'} <span class="data-unit">mmHg</span></p></div>
                    <div><p class="data-label">Diastólica</p><p class="data-value">${!isNaN(dia) ? dia : '--'} <span class="data-unit">mmHg</span></p></div>
                    <div><p class="data-label">Pulso</p><p class="data-value">${!isNaN(parseInt(rec.heartRate)) ? rec.heartRate : '--'} <span class="data-unit">BPM</span></p></div>
                </div>
                ${symptomsHTML}
                <div class="card-footer ${pressureClass}" style="text-align: center; margin-top: 1rem; padding: 0.5rem; border-radius: 8px;">
                    <span style="font-weight: 600;">Presión ${pressureText}</span>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

function injectCardiacoStyles() {
    const styleId = 'cardiaco-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .pressure-normal { background-color: #E8F5E9; color: #2E7D32; }
        .pressure-high { background-color: #FFEBEE; color: #C62828; }
        .pressure-low { background-color: #E0F7FA; color: #006064; }
        .pressure-unknown { background-color: var(--bg-secondary); color: var(--text-secondary); border: 1px solid var(--border-color); }
        body.dark-theme .pressure-low { background-color: #00373e; color: #4dd0e1; }
        .data-label { font-size: 0.8rem; color: var(--text-secondary); }
        .data-value { font-size: 1.5rem; font-weight: 600; }
        .data-unit { font-size: 0.9rem; font-weight: 400; color: var(--text-secondary); }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectCardiacoStyles();
    let currentData = store.getCardiacoData();

    const formModal = document.getElementById('cardiaco-form-modal');
    const form = document.getElementById('cardiaco-form');
    const addInitialBtn = document.getElementById('add-cardiaco-initial-btn');
    const addMainBtn = document.getElementById('add-cardiaco-main-btn');
    const cancelBtn = document.getElementById('cancel-cardiaco-btn');
    const listContainer = document.getElementById('cardiaco-list-container');

    function openFormModal(record = null) {
        if (!form) return;
        form.reset();
        form.querySelectorAll('input[name="symptoms"]').forEach(cb => cb.checked = false);

        const now = new Date();
        form.elements['date'].valueAsDate = now;
        form.elements['time'].value = now.toTimeString().slice(0, 5);
        form.elements['cardiaco-id'].value = '';
        document.getElementById('cardiaco-form-title').textContent = 'Agregar Registro de Presión';

        if (record) {
            document.getElementById('cardiaco-form-title').textContent = 'Editar Registro de Presión';
            form.elements['cardiaco-id'].value = record.id;
            form.elements['date'].value = record.date;
            form.elements['time'].value = record.time;
            form.elements['systolic'].value = record.systolic;
            form.elements['diastolic'].value = record.diastolic;
            form.elements['heartRate'].value = record.heartRate;
            form.elements['notes'].value = record.notes || '';
            form.elements['measurementTime'].value = record.measurementTime || '';
            if (record.symptoms && Array.isArray(record.symptoms)) {
                record.symptoms.forEach(symptomValue => {
                    const checkbox = form.querySelector(`input[name="symptoms"][value="${symptomValue}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
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
        const id = form.elements['cardiaco-id'].value;
        const formData = new FormData(form);
        const record = {
            id: id ? parseInt(id) : Date.now(),
            date: formData.get('date'),
            time: formData.get('time'),
            measurementTime: formData.get('measurementTime'),
            systolic: parseInt(formData.get('systolic')),
            diastolic: parseInt(formData.get('diastolic')),
            heartRate: parseInt(formData.get('heartRate')),
            symptoms: formData.getAll('symptoms'),
            notes: formData.get('notes')
        };

        if (isNaN(record.systolic) || isNaN(record.diastolic) || isNaN(record.heartRate)) {
            alert("Por favor, ingresa valores numéricos válidos para la presión y el pulso.");
            return;
        }

        const existingIndex = id ? currentData.findIndex(rec => rec.id.toString() === id) : -1;
        if (existingIndex > -1) {
            currentData[existingIndex] = record;
        } else {
            if (currentData.some(rec => rec.id === record.id)) {
                 record.id = Date.now() + Math.random();
            }
            currentData.push(record);
        }

        store.saveCardiacoData(currentData);
        closeFormModal();
        renderCardiacoList(currentData);
    });

    listContainer?.addEventListener('click', (e) => {
        const button = e.target.closest('.icon-button');
        if (!button) return;

        const targetId = button.dataset.id;
        if (!targetId) return;

        if (button.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                currentData = currentData.filter(rec => rec.id.toString() !== targetId);
                store.saveCardiacoData(currentData);
                renderCardiacoList(currentData);
            }
        } else if (button.classList.contains('edit-btn')) {
            const record = currentData.find(rec => rec.id.toString() === targetId);
            if (record) {
                openFormModal(record);
            } else {
                console.error("No se encontró el registro para editar con ID:", targetId, "en", currentData);
            }
        }
    });

    renderCardiacoList(currentData); // Render inicial
}