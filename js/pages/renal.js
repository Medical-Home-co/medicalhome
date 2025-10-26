/* --- pages/renal.js (Corregido v13) --- */
import { store } from '../store.js'; // Asumiendo que store.js está en la carpeta padre

/* --- Funciones de Renderizado --- */

// Renderiza la vista principal (lista de tarjetas o estado vacío)
function renderBcmDisplay() {
    console.log("[RenderDisplay] Re-renderizando BCM...");
    const historyContainer = document.getElementById('bcm-history-container');
    const emptyState = document.getElementById('bcm-empty-state');
    const addBcmMainBtn = document.getElementById('add-bcm-main-btn');

    // 1. Leer historial FRESCO del store
    let bcmHistory = store.getBcmData();
    if (!Array.isArray(bcmHistory)) bcmHistory = [];

    // 2. **ORDENAR: Más reciente primero** (Clave para 'isLatest' y orden visual)
    bcmHistory.sort((a, b) => b.id - a.id); // CAMBIO: Ordenar por ID (fecha de creación) descendente
    console.log("[RenderDisplay] Historial leído y ordenado:", bcmHistory.length, "registros");

    // 3. Limpiar contenedor ANTES de añadir tarjetas
    if (!historyContainer) { console.error("Contenedor del historial no encontrado!"); return; }
    historyContainer.innerHTML = '';

    // 4. Decidir si mostrar historial o estado vacío
    if (bcmHistory.length === 0) {
        console.log("[RenderDisplay] Mostrando estado vacío.");
        historyContainer.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (addBcmMainBtn) addBcmMainBtn.classList.add('hidden');
    } else {
        console.log("[RenderDisplay] Renderizando tarjetas...");
        historyContainer.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (addBcmMainBtn) addBcmMainBtn.classList.remove('hidden');

        // 5. Crear una tarjeta para CADA registro en el orden correcto
        bcmHistory.forEach((record) => {
            createAndAppendBcmCard(record, historyContainer);
        });
        console.log("[RenderDisplay] Tarjetas renderizadas.");
    }
}

// Crea UNA tarjeta para UN registro BCM y la añade al contenedor
function createAndAppendBcmCard(record, container) {
    if (!record || typeof record.id === 'undefined' || !container) { // Verificar ID
        console.warn("Intento de crear tarjeta con datos inválidos:", record);
        return;
    }

    const card = document.createElement('div');
    card.className = 'summary-card'; // Clase base
    const recordId = record.id.toString();

    // Calcular valores de peso
    const currentW = parseFloat(record.currentWeight);
    const dryW = parseFloat(record.dryWeight);
    const liquidGain = (!isNaN(currentW) && !isNaN(dryW)) ? (currentW - dryW).toFixed(1) : NaN;
    const recordDate = record.date
        ? new Date(record.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

    // (Asumiendo que usas SVG inline o tus rutas de imágenes funcionan)
    const editIcon = `<img src="images/icons/edit.svg" alt="Editar">`;
    const trashIcon = `<img src="images/icons/trash.svg" alt="Eliminar">`;

    // Construir HTML de la sección de Peso (SIEMPRE presente)
    const weightHTML = `
        <div class="bcm-card-header">
            <div>
                 <h3 class="card-title" style="border: none; padding: 0; margin: 0;">Registro del ${recordDate}</h3>
            </div>
            <div class="bcm-card-actions">
                <button class="icon-button edit-btn" data-id="${recordId}" aria-label="Editar registro">${editIcon}</button>
                <button class="icon-button delete-btn" data-id="${recordId}" aria-label="Eliminar registro">${trashIcon}</button>
            </div>
        </div>
        <div class="card-data-row"> <span>Peso Actual</span> <span class="data-value">${!isNaN(currentW) ? `${currentW} kg` : '-- kg'}</span> </div>
        <div class="card-data-row"> <span>Peso Seco</span> <span class="data-value">${!isNaN(dryW) ? `${dryW} kg` : '-- kg'}</span> </div>
        <div class="card-data-row highlight"> <span>Ganancia</span> <span class="data-value">${!isNaN(liquidGain) ? `${liquidGain} kg` : '-- kg'}</span> </div>
    `;

    // --- Lógica de líquidos AHORA SE EJECUTA SIEMPRE ---
    
    // Calcular valores de líquidos
    const liquidsToday = Array.isArray(record.liquids) ? record.liquids : [];
    const validLiquidGain = !isNaN(liquidGain) ? parseFloat(liquidGain) : 0;
    const liquidLimit = Math.max(0, validLiquidGain * 1000);
    const totalConsumed = liquidsToday.reduce((sum, liq) => sum + (liq.amount || 0), 0);
    const liquidRemaining = liquidLimit - totalConsumed;

    // Construir el log de líquidos
    let liquidLogHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0 0 0;">No hay líquidos registrados.</p>';
    if (liquidsToday.length > 0) {
        liquidLogHTML = [...liquidsToday].reverse().map(liq => // .reverse() para mostrar último primero
            `<div class="liquid-log-entry"><span>${liq.time || '--:--'}</span><span>${liq.amount || 0} ml</span></div>`
        ).join('');
    }

    // Construir HTML de la sección de líquidos completa
    const liquidHTML = `
        <div class="bcm-separator"></div>
        <div class="bcm-liquid-section"> 
             <h3 class="card-title" style="border: none; padding-bottom: 0.5rem;">Control Líquidos</h3>
            <div class="card-data-row dotted"> <span>Límite Diario</span> <span class="data-value">${liquidLimit.toFixed(0)} ml</span> </div>
            <div class="card-data-row highlight"> <span>Restante</span> <span class="data-value">${liquidRemaining.toFixed(0)} ml</span> </div>
            
            <button class="button button-primary add-liquid-btn" style="width: 100%; margin-top: 1rem;" data-record-id="${recordId}">+ Agregar Líquido</button>
            
            <div class="bcm-liquid-log" style="margin-top: 1rem;">${liquidLogHTML}</div>
        </div>
    `;

    // Aplicar clase de límite excedido a la tarjeta principal
    if(liquidRemaining < 0) card.classList.add('limit-exceeded');

    // Combinar HTML de peso y (si aplica) líquidos
    card.innerHTML = `
        ${weightHTML}
        ${liquidHTML}
    `;

    // **AÑADIR AL CONTENEDOR** (appendChild es correcto porque el array ya está ordenado)
    container.appendChild(card);
}


// --- Función Principal de Inicialización ---
export function init() {
    console.log("Cargado js/pages/renal.js (v13 - CORREGIDO)");

    // Referencias DOM
    const weightModal = document.getElementById('bcm-weight-modal');
    const liquidModal = document.getElementById('bcm-liquid-modal');
    const weightForm = document.getElementById('bcm-weight-form');
    const liquidForm = document.getElementById('bcm-liquid-form');
    const recordIdInput = document.getElementById('bcm-record-id');
    const dateInput = document.getElementById('bcm-record-date');
    const currentWeightInput = document.getElementById('bcm-current-weight');
    const dryWeightInput = document.getElementById('bcm-dry-weight');
    const addInitialBtn = document.getElementById('add-bcm-initial-btn');
    const addMainBtn = document.getElementById('add-bcm-main-btn');
    // addLiquidBtn se busca dinámicamente
    const cancelWeightBtn = document.getElementById('cancel-weight-btn');
    const cancelLiquidBtn = document.getElementById('cancel-liquid-btn');
    const historyContainer = document.getElementById('bcm-history-container');
    const weightModalTitle = document.getElementById('bcm-weight-modal-title');
    
    // Referencia al input oculto en el modal de líquidos
    // (Asegúrate que este input exista en tu 'renal.html')
    // <input type="hidden" id="bcm-liquid-target-id">
    const liquidTargetIdInput = document.getElementById('bcm-liquid-target-id');


    function openModal(modal) { if (modal) modal.classList.remove('hidden'); }
    function closeModal(modal) { if (modal) modal.classList.add('hidden'); }

    // Abrir modal para NUEVO peso (siempre limpio)
    function openNewWeightModal() {
        if (!weightForm) return;
        weightForm.reset();
        recordIdInput.value = ''; // ID vacío para nuevo
        if (dateInput) dateInput.valueAsDate = new Date();
        if (currentWeightInput) currentWeightInput.value = '';
        if (dryWeightInput) dryWeightInput.value = '';
        if (weightModalTitle) weightModalTitle.textContent = "Registrar Peso";
        openModal(weightModal);
    }

    // Abrir modal para EDITAR peso
    function openEditWeightModal(record) {
         if (!weightForm || !record) return;
         weightForm.reset();
         recordIdInput.value = record.id; // ID del registro a editar
         if (dateInput) dateInput.value = record.date;
         if (currentWeightInput) currentWeightInput.value = record.currentWeight;
         if (dryWeightInput) dryWeightInput.value = record.dryWeight;
         if (weightModalTitle) weightModalTitle.textContent = "Editar Registro de Peso";
         openModal(weightModal);
    }

    // --- Listeners ---
    addInitialBtn?.addEventListener('click', openNewWeightModal);
    addMainBtn?.addEventListener('click', openNewWeightModal);

    // Listener delegado para botones DENTRO del historial
    historyContainer?.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const recordIdStr = button.dataset.id || button.dataset.recordId;

        // Botón "+ Agregar Líquido" (por CLASE)
        if (button.classList.contains('add-liquid-btn')) {
             if (liquidForm) liquidForm.reset();
             
             // Guardar el ID del registro en el modal
             if(liquidTargetIdInput && recordIdStr) {
                  liquidTargetIdInput.value = recordIdStr;
                  console.log("Abriendo modal de líquido para recordId:", recordIdStr);
                  openModal(liquidModal);
             } else {
                 console.error("No se pudo encontrar el ID del registro o el input oculto 'bcm-liquid-target-id'.");
             }
        }
        // Botón Editar
        else if (button.classList.contains('edit-btn') && recordIdStr) {
            let currentHistory = store.getBcmData();
            if (!Array.isArray(currentHistory)) currentHistory = [];
            const recordToEdit = currentHistory.find(r => r.id.toString() === recordIdStr);
            if (recordToEdit) {
                openEditWeightModal(recordToEdit);
            } else {
                console.error("No se encontró registro para editar:", recordIdStr);
            }
        }
        // Botón Borrar
        else if (button.classList.contains('delete-btn') && recordIdStr) {
             // Reemplaza 'confirm' con tu propio modal de confirmación
             if (confirm('¿Eliminar este registro de peso? (Los líquidos asociados también se borrarán)')) {
                 let currentHistory = store.getBcmData();
                 if (!Array.isArray(currentHistory)) currentHistory = [];
                 const updatedHistory = currentHistory.filter(r => r.id.toString() !== recordIdStr);
                 store.saveBcmData(updatedHistory);
                 renderBcmDisplay(); // Re-renderizar
             }
        }
    });

    cancelWeightBtn?.addEventListener('click', () => closeModal(weightModal));
    cancelLiquidBtn?.addEventListener('click', () => closeModal(liquidModal));

    // --- Formularios ---
    // Guardar registro de peso (NUEVO o EDITADO)
    weightForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const recordIdValue = recordIdInput.value; // Puede ser string vacío o ID
        const date = dateInput.value;
        const currentWeight = parseFloat(currentWeightInput.value);
        const dryWeight = parseFloat(dryWeightInput.value);

        if (!date || isNaN(currentWeight) || isNaN(dryWeight) || currentWeight <= 0 || dryWeight <= 0) {
            alert('Datos inválidos. Verifica la fecha y que los pesos sean positivos.'); // Reemplazar con modal
            return;
        }

        if (dryWeight >= currentWeight) {
            alert('El Peso Seco no puede ser mayor o igual al Peso Actual.'); // Reemplazar con modal
            return;
        }

        let currentHistory = store.getBcmData(); // Leer estado actual
        if (!Array.isArray(currentHistory)) currentHistory = [];

        if (recordIdValue) { // --- Editar ---
            const recordId = parseInt(recordIdValue); // ID a buscar
            const recordIndex = currentHistory.findIndex(r => r.id === recordId);
            if (recordIndex > -1) {
                // Actualizar, manteniendo líquidos
                currentHistory[recordIndex] = {
                    ...currentHistory[recordIndex], // Mantener ID y líquidos
                    date: date,
                    currentWeight: currentWeight,
                    dryWeight: dryWeight
                };
                console.log("Registro EDITADO:", currentHistory[recordIndex]);
            } else {
                 alert("Error al editar: Registro no encontrado."); return; // Reemplazar con modal
            }
        } else { // --- Nuevo ---
            const newRecord = {
                id: Date.now(), // ID nuevo
                date: date,
                currentWeight: currentWeight,
                dryWeight: dryWeight,
                liquids: []
            };
            currentHistory.push(newRecord);
            console.log("Registro NUEVO añadido:", newRecord);
        }

        // Guardar el historial modificado
        store.saveBcmData(currentHistory);
        closeModal(weightModal);
        renderBcmDisplay(); // Re-renderizar todo
    });

    // Guardar líquido (añade al registro específico)
    liquidForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        let currentHistory = store.getBcmData();
        if (!Array.isArray(currentHistory)) currentHistory = [];
        
        // Obtener el ID del registro del input oculto
        const targetRecordIdStr = liquidTargetIdInput.value;

        if (!targetRecordIdStr) {
            alert("Error: No se seleccionó ningún registro. Cierra el modal e inténtalo de nuevo."); // Reemplazar con modal
            return;
        }

        // Encontrar el registro específico para actualizar
        const recordToUpdate = currentHistory.find(r => r.id.toString() === targetRecordIdStr);

        if (!recordToUpdate) {
            alert("Error: No se encontró el registro para añadir el líquido."); // Reemplazar con modal
            closeModal(liquidModal); 
            return;
        }

        const amountInput = document.getElementById('bcm-liquid-amount');
        const amount = parseInt(amountInput.value);
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        if (isNaN(amount) || amount <= 0) {
            alert('Cantidad inválida.'); return; // Reemplazar con modal
        }

        // Modificar el registro encontrado
        if (!Array.isArray(recordToUpdate.liquids)) recordToUpdate.liquids = [];
        recordToUpdate.liquids.push({ time, amount });
        console.log("Líquido añadido al registro:", targetRecordIdStr);


        store.saveBcmData(currentHistory); // Guardar
        closeModal(liquidModal);
        renderBcmDisplay(); // Re-renderizar todo
    });

    // Renderizado inicial
    renderBcmDisplay();
}
