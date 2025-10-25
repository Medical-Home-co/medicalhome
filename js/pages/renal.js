/* --- pages/renal.js --- */
import { store } from '../store.js';

// Siempre trabajaremos con un array de registros
let bcmHistory = [];

/* --- Funciones de Renderizado --- */

// Renderiza la vista principal (tarjeta o estado vacío) basado en el historial
function renderBcmDisplay() {
    const dataContainer = document.getElementById('bcm-data-container');
    const emptyState = document.getElementById('bcm-empty-state');
    const addBcmMainBtn = document.getElementById('add-bcm-main-btn');

    // Asegurar que bcmHistory sea un array y ordenarlo
    if (!Array.isArray(bcmHistory)) {
        bcmHistory = [];
    }
    bcmHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); // Más reciente primero

    const latestRecord = bcmHistory.length > 0 ? bcmHistory[0] : null;

    if (!latestRecord) {
        if (dataContainer) dataContainer.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (addBcmMainBtn) addBcmMainBtn.classList.add('hidden');
    } else {
        if (dataContainer) dataContainer.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (addBcmMainBtn) addBcmMainBtn.classList.remove('hidden');
        renderCombinedCard(latestRecord); // Mostrar siempre el más reciente
    }
}

// Renderiza la tarjeta combinada con datos de UN registro
function renderCombinedCard(record) {
    const combinedCard = document.getElementById('bcm-combined-card');
    if (!combinedCard || !record) return;

    const currentW = parseFloat(record.currentWeight);
    const dryW = parseFloat(record.dryWeight);
    const liquidGain = (!isNaN(currentW) && !isNaN(dryW)) ? (currentW - dryW).toFixed(1) : NaN;
    const recordDate = record.date
        ? new Date(record.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    updateText('bcm-display-date', recordDate);
    updateText('bcm-display-current', !isNaN(currentW) ? `${currentW} kg` : 'N/A');
    updateText('bcm-display-dry', !isNaN(dryW) ? `${dryW} kg` : 'N/A');
    updateText('bcm-display-gain', !isNaN(liquidGain) ? `${liquidGain} kg` : 'N/A');

    const liquidsToday = Array.isArray(record.liquids) ? record.liquids : [];
    const validLiquidGain = !isNaN(liquidGain) ? parseFloat(liquidGain) : 0;
    const liquidLimit = Math.max(0, validLiquidGain * 1000);
    const totalConsumed = liquidsToday.reduce((sum, liq) => sum + (liq.amount || 0), 0);
    const liquidRemaining = liquidLimit - totalConsumed;

    updateText('bcm-display-limit', `${liquidLimit.toFixed(0)} ml`);
    updateText('bcm-display-remaining', `${liquidRemaining.toFixed(0)} ml`);

    combinedCard.classList.toggle('limit-exceeded', liquidRemaining < 0);

    const liquidLog = document.getElementById('bcm-liquid-log');
    if (liquidLog) {
        liquidLog.innerHTML = '';
        if (liquidsToday.length > 0) {
            [...liquidsToday].reverse().forEach(liq => {
                const logEntry = document.createElement('div');
                logEntry.className = 'liquid-log-entry';
                logEntry.innerHTML = `<span>${liq.time || '??:??'}</span><span>${liq.amount || 0} ml</span>`;
                liquidLog.appendChild(logEntry);
            });
        } else {
            liquidLog.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 0.5rem 0;">No hay líquidos registrados para esta fecha.</p>';
        }
    }
}


export function init() {
    // Cargar historial y asegurar que sea array
    bcmHistory = store.getBcmData();
    if (!Array.isArray(bcmHistory)) {
        bcmHistory = [];
    }

    console.log("Cargado js/pages/renal.js (v8 - Enfoque historial simple)");

    // Referencias DOM
    const weightModal = document.getElementById('bcm-weight-modal');
    const liquidModal = document.getElementById('bcm-liquid-modal');
    const weightForm = document.getElementById('bcm-weight-form');
    const liquidForm = document.getElementById('bcm-liquid-form');
    const dateInput = document.getElementById('bcm-record-date');
    const currentWeightInput = document.getElementById('bcm-current-weight');
    const dryWeightInput = document.getElementById('bcm-dry-weight');
    const addInitialBtn = document.getElementById('add-bcm-initial-btn');
    const addMainBtn = document.getElementById('add-bcm-main-btn');
    const addLiquidBtn = document.getElementById('add-liquid-btn');
    const cancelWeightBtn = document.getElementById('cancel-weight-btn');
    const cancelLiquidBtn = document.getElementById('cancel-liquid-btn');


    // Funciones helper
    function openModal(modal) { if (modal) modal.classList.remove('hidden'); }
    function closeModal(modal) { if (modal) modal.classList.add('hidden'); }

    // Función para abrir el modal de NUEVO peso (siempre vacío)
    function openNewWeightModal() {
        if (weightForm && dateInput && currentWeightInput && dryWeightInput) {
            weightForm.reset(); // Limpiar todo
            dateInput.valueAsDate = new Date(); // Poner fecha actual
            currentWeightInput.value = ''; // Asegurar vacío
            dryWeightInput.value = ''; // Asegurar vacío
        } else {
             console.error("Elementos del formulario de peso no encontrados.");
             return;
        }
        openModal(weightModal);
    }

    // --- Listeners ---
    // Abrir modal de peso (botones inicial y principal)
    addInitialBtn?.addEventListener('click', openNewWeightModal);
    addMainBtn?.addEventListener('click', openNewWeightModal);

    // Abrir modal de líquido
    addLiquidBtn?.addEventListener('click', () => {
        bcmHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar por si acaso
        if (bcmHistory.length === 0) {
             alert("Primero debes agregar un registro de peso.");
             return;
        }
        if (liquidForm) liquidForm.reset();
        openModal(liquidModal);
    });

    // Cerrar modales
    cancelWeightBtn?.addEventListener('click', () => closeModal(weightModal));
    cancelLiquidBtn?.addEventListener('click', () => closeModal(liquidModal));

    // --- Formularios ---
    // Guardar NUEVO registro de peso
    weightForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const date = dateInput.value;
        const currentWeight = parseFloat(currentWeightInput.value);
        const dryWeight = parseFloat(dryWeightInput.value);

        // Validaciones
        if (!date) { alert('Por favor, selecciona una fecha.'); return; }
        if (isNaN(currentWeight) || isNaN(dryWeight)) { alert('Por favor, ingresa valores numéricos para los pesos.'); return; }
        if (dryWeight >= currentWeight) { alert('Error: El Peso Seco debe ser menor que el Peso Actual.'); return; } // Ajuste: >=
        if (currentWeight <= 0 || dryWeight <= 0) { alert('Los pesos deben ser valores positivos.'); return; }

        // Crear objeto nuevo
        const newRecord = {
            id: Date.now() + Math.random(), // ID único
            date: date,
            currentWeight: currentWeight,
            dryWeight: dryWeight,
            liquids: [] // Siempre lista vacía al crear
        };

        // Asegurar que bcmHistory es un array antes de añadir
        if (!Array.isArray(bcmHistory)) {
             bcmHistory = [];
        }

        bcmHistory.push(newRecord); // Añadir al historial en memoria
        bcmHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); // Reordenar

        store.saveBcmData(bcmHistory); // Guardar el historial completo
        closeModal(weightModal);
        renderBcmDisplay(); // Re-renderizar la vista principal
    });

    // Guardar líquido (añade al registro más reciente)
    liquidForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        bcmHistory.sort((a, b) => new Date(b.date) - new Date(a.date)); // Asegurar orden
        if (bcmHistory.length === 0) {
            alert("Error interno: No hay registro de peso al cual agregar líquido.");
            closeModal(liquidModal);
            return;
        }

        const amountInput = document.getElementById('bcm-liquid-amount');
        const amount = parseInt(amountInput.value);
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        if (isNaN(amount) || amount <= 0) {
            alert('Por favor, ingresa una cantidad válida de líquido (mayor que 0).'); return;
        }

        const latestRecord = bcmHistory[0]; // El más reciente
        if (!Array.isArray(latestRecord.liquids)) { // Asegurar que liquids exista
            latestRecord.liquids = [];
        }

        latestRecord.liquids.push({ time, amount }); // Añadir al array de líquidos del último registro

        store.saveBcmData(bcmHistory); // Guardar el historial completo actualizado
        closeModal(liquidModal);
        renderCombinedCard(latestRecord); // Solo re-renderizar la tarjeta que cambió
    });

    // Renderizado inicial al cargar la página
    renderBcmDisplay();
}