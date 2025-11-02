// SOLUCIÓN: Importar el store
import { store } from '../store.js';

// --- Datos para los selectores dinámicos ---
const moods = { 'Feliz': '😊', 'Tranquilo': '😌', 'Ansioso': '😟', 'Triste': '😢', 'Enojado': '😠' };
const socialInteractions = ['Positivas', 'Neutrales', 'Con Dificultad'];
const sensoryTriggers = ['Ruidos fuertes', 'Luces brillantes', 'Multitudes', 'Olores', 'Texturas'];

// --- Funciones de Renderizado ---
// SOLUCIÓN: Aceptar datos como argumento
function renderTeaList(data) {
    const listContainer = document.getElementById('tea-list-container');
    const emptyState = document.getElementById('tea-empty-state');
    const addMainBtn = document.getElementById('add-tea-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    // SOLUCIÓN: Usar la longitud de los datos pasados
    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden'); // Ocultar grid
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden'); // Mostrar grid
        addMainBtn.classList.remove('hidden');

        // SOLUCIÓN: Usar los datos pasados
        const sortedData = [...data].sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        sortedData.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'summary-card';

            const socialHTML = rec.social.map(s => `<span class="tag">${s}</span>`).join('');
            const sensoryHTML = rec.sensory.map(s => `<span class="tag">${s}</span>`).join('');

            card.innerHTML = `
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <p class="card-title">${new Date(rec.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} - ${rec.time}</p>
                    <div class="card-actions">
                        <button class="icon-button edit-btn" data-id="${rec.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                        <button class="icon-button delete-btn" data-id="${rec.id}"><img src="images/icons/trash.svg" class="icon-delete" alt="Eliminar"></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="tea-summary-row"><span class="tea-summary-label">Estado de Ánimo:</span><span class="tea-summary-value mood-value">${moods[rec.mood] || ''} ${rec.mood}</span></div>
                    <div class="tea-summary-row"><span class="tea-summary-label">Nivel de Ansiedad:</span><span class="tea-summary-value">${rec.anxietyLevel}/10</span></div>
                    ${rec.social.length > 0 ? `<div class="tags-container" style="margin-top: 0.5rem;">${socialHTML}</div>` : ''}
                    ${rec.sensory.length > 0 ? `<p class="data-label" style="margin-top: 0.75rem;">Disparadores Sensoriales:</p><div class="tags-container">${sensoryHTML}</div>` : ''}
                    ${rec.positiveMoment ? `<div class="positive-moment-summary"><p><strong>Momento Positivo:</strong> ${rec.positiveMoment}</p></div>` : ''}
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

// --- Lógica de Estilos Dinámicos ---
function injectTeaStyles() { /* ... (Sin cambios aquí) ... */ 
    const styleId = 'tea-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .emoji-selector { display: flex; justify-content: space-around; padding: 0.5rem 0; }
        .emoji-btn { font-size: 2rem; background: none; border: 2px solid transparent; border-radius: 50%; padding: 0.25rem; cursor: pointer; transition: all 0.2s; }
        .emoji-btn.selected { border-color: var(--primary-blue); background-color: var(--bg-secondary); }
        .form-range { width: 100%; -webkit-appearance: none; appearance: none; height: 8px; background: var(--border-color); border-radius: 5px; outline: none; }
        .form-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: var(--primary-blue); cursor: pointer; border-radius: 50%; }
        .form-range::-moz-range-thumb { width: 20px; height: 20px; background: var(--primary-blue); cursor: pointer; border-radius: 50%; }
        .range-value { font-weight: 600; font-size: 1.1rem; color: var(--primary-blue); }
        .form-section { border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .tags-selector { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag-btn { background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer; color: var(--text-primary); }
        .tag-btn.selected { background-color: var(--primary-blue); color: white; border-color: var(--primary-blue); }
        body.dark-theme .tag-btn.selected { color: white !important; }
        .radio-group { display: flex; gap: 1rem; align-items: center; }
        .radio-label { display: flex; align-items: center; gap: 0.5rem; }
        .tea-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; }
        .tea-summary-label { color: var(--text-secondary); }
        .tea-summary-value { font-weight: 600; color: var(--text-primary); }
        .mood-value { font-size: 1.2rem; }
        .positive-moment-summary { background-color: #E8F5E9; color: #2E7D32; padding: 0.75rem; border-radius: 8px; margin-top: 1rem; font-size: 0.9rem; }
        body.dark-theme .positive-moment-summary { background-color: #1c3b1e; color: #a5d6a7; }
        body.dark-theme .positive-moment-summary p, body.dark-theme .positive-moment-summary strong { color: #a5d6a7 !important; }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectTeaStyles();

    // SOLUCIÓN: Cargar datos del store
    let currentData = store.getTeaData();

    const formModal = document.getElementById('tea-form-modal');
    const form = document.getElementById('tea-form');
    const addInitialBtn = document.getElementById('add-tea-initial-btn');
    const addMainBtn = document.getElementById('add-tea-main-btn');
    const cancelBtn = document.getElementById('cancel-tea-btn');
    const listContainer = document.getElementById('tea-list-container');
    const anxietySlider = document.getElementById('anxiety-level');
    const anxietyValue = document.getElementById('anxiety-level-value');
    const moodContainer = document.getElementById('tea-mood-container');
    
    // --- Lógica para poblar selectores dinámicos ---
    if (moodContainer) { /* ... (Sin cambios aquí) ... */ 
        moodContainer.innerHTML = ''; // Limpiar por si acaso
        for (const [name, emoji] of Object.entries(moods)) {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'emoji-btn'; btn.textContent = emoji; btn.dataset.mood = name;
            btn.onclick = () => {
                moodContainer.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('tea-mood-value').value = name;
            };
            moodContainer.appendChild(btn);
        }
    }

    function createTagSelector(containerId, items) { /* ... (Sin cambios aquí) ... */ 
        const container = document.getElementById(containerId);
        if(!container) return;
        container.innerHTML = ''; 
        items.forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.className = 'tag-btn'; btn.textContent = item; btn.dataset.value = item;
            btn.onclick = () => btn.classList.toggle('selected');
            container.appendChild(btn);
        });
    }
    createTagSelector('tea-social-container', socialInteractions);
    createTagSelector('tea-sensory-triggers-container', sensoryTriggers);
    
    // --- Lógica general ---
    function openFormModal(record = null) { /* ... (Sin cambios aquí, solo llena el form) ... */ 
        if (!form) return;
        form.reset();
        document.querySelectorAll('.emoji-btn, .tag-btn').forEach(b => b.classList.remove('selected'));
        const now = new Date();
        document.getElementById('tea-date').valueAsDate = now;
        document.getElementById('tea-time').value = now.toTimeString().slice(0, 5);
        document.getElementById('tea-id').value = '';
        document.getElementById('tea-form-title').textContent = 'Nuevo Registro Diario';
        anxietySlider.value = 5; 
        anxietyValue.textContent = 5;

        if (record) {
            document.getElementById('tea-form-title').textContent = 'Editar Registro';
            document.getElementById('tea-id').value = record.id;
            document.getElementById('tea-date').value = record.date;
            document.getElementById('tea-time').value = record.time;
            const moodBtn = moodContainer?.querySelector(`[data-mood="${record.mood}"]`);
            if(moodBtn) moodBtn.click();
            anxietySlider.value = record.anxietyLevel;
            anxietyValue.textContent = record.anxietyLevel;
            form.elements.emotionNotes.value = record.emotionNotes || '';
            (record.social || []).forEach(val => document.querySelector(`#tea-social-container [data-value="${val}"]`)?.classList.add('selected'));
            (record.sensory || []).forEach(val => document.querySelector(`#tea-sensory-triggers-container [data-value="${val}"]`)?.classList.add('selected'));
            form.elements.socialNotes.value = record.socialNotes || '';
            form.elements.sensoryOverload.value = record.sensoryOverload || 'No';
            form.elements.routineChange.value = record.routineChange || 'No';
            form.elements.changeHandling.value = record.changeHandling || '';
            form.elements.sleepQuality.value = record.sleepQuality || 'Buena';
            form.elements.appetite.value = record.appetite || 'Normal';
            form.elements.positiveMoment.value = record.positiveMoment || '';
        }
        formModal?.classList.remove('hidden');
    }
    
    function closeFormModal() { formModal?.classList.add('hidden'); }
    
    anxietySlider?.addEventListener('input', () => anxietyValue.textContent = anxietySlider.value);
    addInitialBtn?.addEventListener('click', () => openFormModal());
    addMainBtn?.addEventListener('click', () => openFormModal());
    cancelBtn?.addEventListener('click', closeFormModal);

    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('tea-id').value;
        const selectedSocial = Array.from(document.querySelectorAll('#tea-social-container .tag-btn.selected')).map(b => b.dataset.value);
        const selectedSensory = Array.from(document.querySelectorAll('#tea-sensory-triggers-container .tag-btn.selected')).map(b => b.dataset.value);

        const record = {
            id: id ? parseInt(id) : Date.now(),
            date: document.getElementById('tea-date').value,
            time: document.getElementById('tea-time').value,
            mood: document.getElementById('tea-mood-value').value,
            anxietyLevel: anxietySlider.value,
            emotionNotes: form.elements.emotionNotes.value,
            social: selectedSocial,
            socialNotes: form.elements.socialNotes.value,
            sensoryOverload: form.elements.sensoryOverload.value,
            sensory: selectedSensory,
            routineChange: form.elements.routineChange.value,
            changeHandling: form.elements.changeHandling.value,
            sleepQuality: form.elements.sleepQuality.value,
            appetite: form.elements.appetite.value,
            positiveMoment: form.elements.positiveMoment.value
        };

        if (id) {
            const index = currentData.findIndex(rec => rec.id.toString() === id);
            if (index > -1) currentData[index] = record;
        } else {
            currentData.push(record);
        }
        
        // SOLUCIÓN: Guardar en el store
        store.saveTeaData(currentData);
        
        closeFormModal();
        // SOLUCIÓN: Pasar datos actualizados al render
        renderTeaList(currentData);
    });

     listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');

        if (deleteBtn) {
            if(confirm('¿Estás seguro de que quieres eliminar este registro?')) {
                // SOLUCIÓN: Modificar currentData y guardar
                currentData = currentData.filter(rec => rec.id.toString() !== deleteBtn.dataset.id);
                store.saveTeaData(currentData);
                renderTeaList(currentData);
            }
        }

        if(editBtn) {
            // SOLUCIÓN: Buscar en currentData
            const record = currentData.find(rec => rec.id.toString() === editBtn.dataset.id);
            if(record) openFormModal(record);
        }
    });

    // SOLUCIÓN: Render inicial con datos del store
    renderTeaList(currentData);
}