// --- Base de Datos Temporal ---
let tempAgendaDB = [];

// --- Funciones de Renderizado ---

function renderAgendaList() {
    const listContainer = document.getElementById('agenda-list-container');
    const emptyState = document.getElementById('agenda-empty-state');
    const addMainBtn = document.getElementById('add-agenda-main-btn');

    if (!listContainer || !emptyState || !addMainBtn) return;
    listContainer.innerHTML = '';

    if (tempAgendaDB.length === 0) {
        emptyState.classList.remove('hidden');
        listContainer.classList.add('hidden');
        addMainBtn.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        addMainBtn.classList.remove('hidden');

        tempAgendaDB.forEach(contact => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            
            // Limpiar número de teléfono para los enlaces de WhatsApp
            const cleanPhone = contact.phone.replace(/[^0-9]/g, '');

            card.innerHTML = `
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 class="card-title">${contact.name} ${contact.isEmergency ? '<span class="emergency-tag">★ Emergencia</span>' : ''}</h3>
                            <p class="card-subtitle">${contact.relation}</p>
                        </div>
                        <div class="card-actions">
                            <button class="icon-button edit-btn" data-id="${contact.id}"><img src="images/icons/edit.svg" alt="Editar"></button>
                            <button class="icon-button delete-btn" data-id="${contact.id}"><img src="images/icons/trash.svg" alt="Eliminar"></button>
                        </div>
                    </div>
                    <div class="contact-actions-footer">
                        <a href="tel:${cleanPhone}" class="button button-secondary contact-action-btn">
                            <img src="images/icons/phone.svg" alt="Llamar">
                            <span>Llamar</span>
                        </a>
                        <a href="https://wa.me/${cleanPhone}" target="_blank" class="button button-secondary contact-action-btn">
                            <img src="images/icons/whatsapp.svg" alt="WhatsApp">
                            <span>Mensaje</span>
                        </a>
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
}

// --- Lógica de Estilos Dinámicos ---
function injectAgendaStyles() {
    const styleId = 'agenda-dynamic-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
        .emergency-tag {
            font-size: 0.75rem;
            font-weight: 600;
            color: #E65100; /* Naranja */
            background-color: #FFF3E0;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            margin-left: 0.5rem;
        }
        .contact-actions-footer {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-top: 1rem;
            border-top: 1px solid var(--border-color);
            padding-top: 1rem;
        }
        .contact-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        .contact-action-btn img {
            width: 16px;
            height: 16px;
        }
    `;
    document.head.appendChild(style);
}

// --- Función Principal ---
export function init() {
    injectAgendaStyles();

    const formModal = document.getElementById('agenda-form-modal');
    const form = document.getElementById('agenda-form');
    const addInitialBtn = document.getElementById('add-agenda-initial-btn');
    const addMainBtn = document.getElementById('add-agenda-main-btn');
    const cancelBtn = document.getElementById('cancel-contact-btn');
    const listContainer = document.getElementById('agenda-list-container');

    function openFormModal(contact = null) {
        if (!form) return;
        form.reset();
        document.getElementById('contact-id').value = '';
        document.getElementById('agenda-form-title').textContent = 'Agregar Contacto';

        if (contact) {
            document.getElementById('agenda-form-title').textContent = 'Editar Contacto';
            document.getElementById('contact-id').value = contact.id;
            document.getElementById('contact-name').value = contact.name;
            document.getElementById('contact-relation').value = contact.relation;
            document.getElementById('contact-phone').value = contact.phone;
            document.getElementById('contact-emergency').checked = contact.isEmergency;
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
        const id = document.getElementById('contact-id').value;
        const formData = new FormData(form);
        
        const contactData = {
            id: id || Date.now(),
            name: formData.get('name'),
            relation: formData.get('relation'),
            phone: formData.get('phone'),
            isEmergency: formData.get('isEmergency') === 'on'
        };

        if (id) {
            const index = tempAgendaDB.findIndex(c => c.id.toString() === id);
            if (index > -1) tempAgendaDB[index] = contactData;
        } else {
            tempAgendaDB.push(contactData);
        }
        
        closeFormModal();
        renderAgendaList();
    });

    listContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        const editBtn = e.target.closest('.edit-btn');
        if (deleteBtn) {
            if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
                tempAgendaDB = tempAgendaDB.filter(c => c.id.toString() !== deleteBtn.dataset.id);
                renderAgendaList();
            }
        }
        if (editBtn) {
            const contact = tempAgendaDB.find(c => c.id.toString() === editBtn.dataset.id);
            if (contact) openFormModal(contact);
        }
    });

    renderAgendaList();
}
