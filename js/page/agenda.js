/* --- pages/agenda.js (v5 - Icono de Llamada Condicional) --- */
import { store } from '../store.js'; // Importar store

let currentAgendaData = []; // Variable local para datos

/* --- Función para renderizar la lista de contactos (CON ICONO DE LLAMADA CONDICIONAL) --- */
function renderAgendaList() {
    const listContainer = document.getElementById('agenda-list-container');
    const emptyState = document.getElementById('agenda-empty-state');
    const addMainBtn = document.getElementById('add-agenda-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) {
        console.error("Elementos de la UI de Agenda no encontrados.");
        return;
    }
    listContainer.innerHTML = '';

    // Asegurarse de que currentAgendaData es un array
    if (!Array.isArray(currentAgendaData) || currentAgendaData.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMainBtn.classList.remove('hidden');

        currentAgendaData.forEach(contact => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.style.padding = '1rem';

            const emergencyBadge = contact.isEmergency ?
                '<span class="tag tag-emergency">Emergencia</span>' : '';

            // --- INICIO: LÓGICA CONDICIONAL PARA ICONOS Y ENLACES ---
            const storedPhone = contact.phone || ""; // Número guardado
            let callIconSrc = 'images/icons/phone.svg'; // Icono de llamada por defecto
            let callIconAlt = 'Llamar Celular';
            let enableWhatsApp = false;

            // Limpiar número para procesar (quitar espacios)
            const cleanPhoneForLogic = storedPhone.replace(/\s+/g, '');

            // Determinar tipo, icono de llamada y habilitar WhatsApp
            if (cleanPhoneForLogic.startsWith('60')) {
                callIconSrc = 'images/icons/old-phone.svg'; // Cambiar icono de LLAMADA a fijo
                callIconAlt = 'Llamar Fijo';
                enableWhatsApp = false; // WhatsApp desactivado para fijos
            } else if (cleanPhoneForLogic.startsWith('3')) {
                callIconSrc = 'images/icons/phone.svg'; // Icono de LLAMADA es celular
                callIconAlt = 'Llamar Celular';
                enableWhatsApp = true; // WhatsApp activado si empieza con 3
            } else {
                 // Otro tipo de número (podría ser internacional corto o un error)
                 callIconSrc = 'images/icons/phone.svg'; // Dejar icono de celular por defecto
                 callIconAlt = 'Llamar';
                 enableWhatsApp = false; // WhatsApp desactivado por defecto
            }

            // Generar Enlace de Llamada (siempre usa el número guardado)
            const phoneLink = `tel:${storedPhone.replace(/\s+/g, '')}`; // Quitar espacios para tel:

            // Generar Enlace de WhatsApp (condicional)
            let whatsappLink = '#';
            let whatsappIconClass = 'icon-whatsapp disabled-icon'; // Clase por defecto (desactivado)
            let whatsappAriaLabel = 'WhatsApp (No disponible)';
            let whatsappTarget = ''; // No abrir nueva pestaña si está desactivado

            if (enableWhatsApp) {
                // Preparar número para wa.me/: quitar '+' si existe, asegurar '57'
                let whatsappNumber = cleanPhoneForLogic.replace(/^\+/, ''); // Quitar + inicial si lo tiene
                // Solo añadir 57 si NO empieza con 57 y tiene 10 dígitos (típico colombiano)
                if (!whatsappNumber.startsWith('57') && whatsappNumber.length === 10) {
                    whatsappNumber = `57${whatsappNumber}`;
                } else if (whatsappNumber.startsWith('57') && whatsappNumber.length > 12) {
                     // Si ya tiene 57 pero es muy largo, podría ser un error, mejor desactivar WA
                     enableWhatsApp = false;
                     whatsappLink = '#';
                     whatsappIconClass = 'icon-whatsapp disabled-icon';
                     whatsappAriaLabel = 'WhatsApp (Número inválido)';
                     whatsappTarget = '';
                } else if (!whatsappNumber.startsWith('57')) {
                    // Si no empieza con 57 y no tiene 10 dígitos, no asumir prefijo
                     enableWhatsApp = false;
                     whatsappLink = '#';
                     whatsappIconClass = 'icon-whatsapp disabled-icon';
                     whatsappAriaLabel = 'WhatsApp (Prefijo desconocido)';
                     whatsappTarget = '';
                }
                // Solo si sigue habilitado, generar link
                if(enableWhatsApp){
                    whatsappLink = `https://wa.me/${whatsappNumber}`;
                    whatsappIconClass = 'icon-whatsapp'; // Clase activa
                    whatsappAriaLabel = 'Enviar mensaje por WhatsApp';
                    whatsappTarget = 'target="_blank" rel="noopener noreferrer"'; // Abrir en nueva pestaña
                }
            }
            // --- FIN: LÓGICA CONDICIONAL PARA ICONOS Y ENLACES ---

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${contact.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">${contact.relation}</p>
                        
                        <p style="font-size: 1rem; font-weight: 500; margin-top: 0.5rem; color: var(--primary-blue);">${storedPhone}</p>
                    </div>

                    
                    <div class="card-actions-grid">
                        <button class="icon-button edit-contact-btn" data-id="${contact.id}">
                            <img src="images/icons/edit.svg" alt="Editar" class="icon-edit">
                        </button>
                        <button class="icon-button delete-contact-btn" data-id="${contact.id}">
                            <img src="images/icons/trash-2.svg" alt="Eliminar" class="icon-delete">
                        </button>

                        
                        <a href="${phoneLink}" class="icon-button" aria-label="${callIconAlt}">
                            <img src="${callIconSrc}" alt="${callIconAlt}" class="icon-phone"> 
                        </a>
                        
                        <a href="${whatsappLink}" class="icon-button ${!enableWhatsApp ? 'disabled-link' : ''}" ${whatsappTarget} aria-label="${whatsappAriaLabel}">
                            <img src="images/icons/whatsapp.svg" alt="WhatsApp" class="${whatsappIconClass}">
                        </a>
                    </div>
                </div>
                ${emergencyBadge ? `<div style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem;">${emergencyBadge}</div>` : ''}
            `;
            listContainer.appendChild(card);
        });
    }
    attachEventListeners(); // Re-asignar listeners
}

/* --- Funciones del Modal (Sin Cambios) --- */
function openFormModal(contact = null) {
    const formModal = document.getElementById('agenda-form-modal');
    const form = document.getElementById('agenda-form');
    const formTitle = document.getElementById('agenda-form-title');
    const entryIdInput = document.getElementById('contact-id');

    if (!formModal || !form || !formTitle || !entryIdInput) {
        console.error("Elementos del modal de Agenda no encontrados.");
        return;
    }

    form.reset();
    entryIdInput.value = '';

    if (contact) { // Modo Edición
        formTitle.textContent = 'Editar Contacto';
        entryIdInput.value = contact.id;
        form.elements['name'].value = contact.name || '';
        form.elements['relation'].value = contact.relation || '';
        form.elements['phone'].value = contact.phone || '';
        form.elements['isEmergency'].checked = contact.isEmergency || false;
    } else { // Modo Agregar
        formTitle.textContent = 'Agregar Contacto';
    }
    formModal.classList.remove('hidden');
}

function closeFormModal() {
    document.getElementById('agenda-form-modal')?.classList.add('hidden');
}

/* --- Listener de Envío de Formulario (Sin Cambios) --- */
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const entryId = document.getElementById('contact-id').value;

    const data = {
        name: formData.get('name'),
        relation: formData.get('relation'),
        phone: formData.get('phone').trim(), // Guardar limpio de espacios extras
        isEmergency: formData.get('isEmergency') === 'on'
    };

    // Validación básica opcional del número
    if (!data.phone || !/^[0-9\s+]{7,}$/.test(data.phone)) { // Acepta números, espacios y +
        alert("Por favor, ingresa un número de teléfono válido (mínimo 7 dígitos).");
        return;
    }


    if (entryId) { // Editar
        const index = currentAgendaData.findIndex(c => c.id.toString() === entryId);
        if (index > -1) {
            currentAgendaData[index] = { ...data, id: parseInt(entryId) };
        } else { return; }
    } else { // Agregar
        data.id = Date.now();
        // Evitar IDs duplicados (poco probable con Date.now, pero seguro)
        if (currentAgendaData.some(c => c.id === data.id)) {
             data.id = Date.now() + Math.random();
        }
        currentAgendaData.push(data);
    }

    store.saveAgenda(currentAgendaData); // Guardar en store
    closeFormModal();
    renderAgendaList();
}

/* --- Asignar Listeners (Editar/Eliminar) (Sin Cambios) --- */
function attachEventListeners() {
    const listContainer = document.getElementById('agenda-list-container');
    if (!listContainer) return;
    // Clonar y reemplazar para limpiar listeners anteriores DENTRO de las tarjetas
    const newContainer = listContainer.cloneNode(true);
    listContainer.parentNode.replaceChild(newContainer, listContainer);

    newContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-contact-btn');
        const deleteBtn = e.target.closest('.delete-contact-btn');

        if (editBtn) {
            const entryId = parseInt(editBtn.dataset.id, 10);
            const contactToEdit = currentAgendaData.find(c => c.id === entryId);
            if (contactToEdit) openFormModal(contactToEdit);
        } else if (deleteBtn) {
            const entryId = parseInt(deleteBtn.dataset.id, 10);
            if (confirm("¿Eliminar este contacto?")) {
                currentAgendaData = currentAgendaData.filter(c => c.id !== entryId);
                store.saveAgenda(currentAgendaData);
                renderAgendaList();
            }
        }
    });
}

/* --- Función Principal (Sin Cambios) --- */
export function init() {
    console.log("Cargado js/pages/agenda.js (v5 - Icono Llamada Condicional)");
    currentAgendaData = store.getAgenda() || []; // Cargar datos del store

    const formModal = document.getElementById('agenda-form-modal');
    const addInitialBtn = document.getElementById('add-agenda-initial-btn');
    const addMainBtn = document.getElementById('add-agenda-main-btn');
    const cancelBtn = document.getElementById('cancel-contact-btn');
    const form = document.getElementById('agenda-form');

    if (!formModal || !addInitialBtn || !addMainBtn || !cancelBtn || !form) {
        console.error("Elementos clave para Agenda no encontrados.");
        document.getElementById('agenda-list-container')?.classList.add('hidden');
        document.getElementById('agenda-empty-state')?.classList.remove('hidden');
        return;
    }

    /* Asignar Listeners */
    addInitialBtn.addEventListener('click', () => openFormModal());
    addMainBtn.addEventListener('click', () => openFormModal());
    cancelBtn.addEventListener('click', closeFormModal);
    form.addEventListener('submit', handleFormSubmit);

    injectAgendaStyles(); // Llamar para estilos del icono desactivado
    renderAgendaList(); // Renderizado inicial (esto llama a attachEventListeners)
}

// Opcional: Añadir estilos para el icono deshabilitado
function injectAgendaStyles() {
    const styleId = 'agenda-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        /* Estilos para icono y enlace desactivados */
        .disabled-icon {
            opacity: 0.3;
            filter: grayscale(80%); /* Opcional: hacerlo gris */
        }
        .disabled-link {
             cursor: not-allowed;
             pointer-events: none; /* Evita que se pueda hacer clic */
        }
        /* Ajustar el tamaño de todos los iconos de acción */
        .card-actions-grid img {
             width: 20px;
             height: 20px;
             transition: opacity 0.2s; /* Suavizar hover */
        }
        /* Hover solo para enlaces activos */
        .card-actions-grid a:not(.disabled-link) img:hover,
        .card-actions-grid button img:hover {
            opacity: 0.7; /* Ligeramente transparente al pasar el mouse */
        }

        /* Estilo específico para la etiqueta de emergencia */
        .tag-emergency {
             background-color: var(--danger-light-bg) !important;
             color: var(--danger-light-text) !important;
             border: 1px solid var(--danger-light-border) !important;
             font-weight: 500 !important;
             padding: 0.25rem 0.5rem;
             font-size: 0.8rem;
             border-radius: 6px;
             display: inline-block; /* Asegura que se muestre correctamente */
        }
    `;
    document.head.appendChild(style);
}

// Llamar a la inyección de estilos si la defines
// injectAgendaStyles(); // Se llama en init()