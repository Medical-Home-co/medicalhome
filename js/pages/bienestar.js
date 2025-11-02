// --- Función Principal ---
export function init() {
    const categoryCards = document.querySelectorAll('.category-card');
    const closeButtons = document.querySelectorAll('.close-wellness-modal-btn');
    const modals = document.querySelectorAll('.modal-overlay');

    // Función para abrir un modal
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    };

    // Función para cerrar todos los modales de bienestar
    const closeAllModals = () => {
        modals.forEach(modal => {
            // Solo cerrar modales de esta sección
            if(modal.id.startsWith('wellness-')) {
                modal.classList.add('hidden');
            }
        });
    };

    // Añadir evento de clic a cada tarjeta de categoría
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.dataset.modalTarget;
            if (modalId) {
                openModal(modalId);
            }
        });
    });

    // Añadir evento de clic a cada botón de cerrar
    closeButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    // Añadir evento para cerrar el modal si se hace clic fuera del contenido
    modals.forEach(modal => {
        if(modal.id.startsWith('wellness-')) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        }
    });
}

