/* --- pages/agenda.js --- */
import { store } from '../store.js'; // Importar store

let currentAgendaData = []; // Variable local para datos

/* --- Función para renderizar la lista de contactos --- */
function renderAgendaList() {
    const listContainer = document.getElementById('agenda-list-container');
    const emptyState = document.getElementById('agenda-empty-state');
    const addMainBtn = document.getElementById('add-agenda-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) {
        console.error("Elementos de la UI de Agenda no encontrados.");
        return;
    }
    listContainer.innerHTML = '';

    if (currentAgendaData.length === 0) {
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
            
            // --- CORRECCIÓN: Usar una clase CSS en lugar de estilo en línea ---
            const emergencyBadge = contact.isEmergency ? 
                '<span class="tag tag-emergency">Emergencia</span>' : '';
            
            // Sanitizar número para enlaces
            const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
            const phoneLink = `tel:${cleanPhone}`;
            // Asumir un código de país si no está (ej. 57 para Colombia)
            const whatsappPhone = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : (cleanPhone.length > 8 ? cleanPhone : `57${cleanPhone}`);
            const whatsappLink = `https://wa.me/${whatsappPhone}`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600;">${contact.name}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">${contact.relation}</p>
                        <p style="font-size: 1rem; font-weight: 500; margin-top: 0.5rem; color: var(--primary-blue);">${contact.phone}</p>
                    </div>
                    
                    <!-- INICIO: Contenedor de acciones con clases añadidas -->
                    <div class="card-actions-grid">
                        <button class="icon-button edit-contact-btn" data-id="${contact.id}">
                            <img src="images/icons/edit.svg" alt="Editar" class="icon-edit">
                        </button>
                        <button class="icon-button delete-contact-btn" data-id="${contact.id}">
                            <img src="images/icons/trash-2.svg" alt="Eliminar" class="icon-delete">
                        </button>
                        
                        <a href="${phoneLink}" class="icon-button" aria-label="Llamar">
                            <img src="images/icons/phone.svg" alt="Llamar" class="icon-phone">
                        </a>
                        <a href="${whatsappLink}" class="icon-button" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <img src="images/icons/whatsapp.svg" alt="WhatsApp" class="icon-whatsapp">
                        </a>
                    </div>
                    <!-- FIN: Contenedor de acciones -->

                </div>
                ${emergencyBadge ? `<div style="border-top: 1px solid var(--border-color); margin-top: 1rem; padding-top: 1rem;">${emergencyBadge}</div>` : ''}
            `;
            listContainer.appendChild(card);
        });
    }
    attachEventListeners(); // Re-asignar listeners
}

/* --- Funciones del Modal --- */
function openFormModal(contact = null) {
// ... (código existente sin cambios) ...
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

/* --- Listener de Envío de Formulario --- */
function handleFormSubmit(e) {
// ... (código existente sin cambios) ...
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const entryId = document.getElementById('contact-id').value;

    const data = {
        name: formData.get('name'),
        relation: formData.get('relation'),
        phone: formData.get('phone'),
        isEmergency: formData.get('isEmergency') === 'on' // 'on' si está marcado
    };

    if (entryId) { // Editar
        const index = currentAgendaData.findIndex(c => c.id.toString() === entryId);
        if (index > -1) {
            currentAgendaData[index] = { ...data, id: parseInt(entryId) }; // Mantener ID
        } else { return; }
    } else { // Agregar
        data.id = Date.now();
        currentAgendaData.push(data);
    }
    
    store.saveAgenda(currentAgendaData); // Guardar en store
    closeFormModal();
    renderAgendaList();
}

/* --- Asignar Listeners (Editar/Eliminar) --- */
function attachEventListeners() {
// ... (código existente sin cambios) ...
    const listContainer = document.getElementById('agenda-list-container');
    if (!listContainer) return;
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
            // Reemplazar confirm por un modal custom en el futuro
            if (confirm("¿Eliminar este contacto?")) {
                currentAgendaData = currentAgendaData.filter(c => c.id !== entryId);
                store.saveAgenda(currentAgendaData);
                renderAgendaList();
            }
        }
    });
}

/* --- Función Principal --- */
export function init() {
// ... (código existente sin cambios) ...
    console.log("Cargado js/pages/agenda.js");
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

    attachEventListeners(); // Listeners para tarjetas
    renderAgendaList(); // Renderizado inicial
}

