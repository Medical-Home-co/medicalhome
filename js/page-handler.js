import { getSectionData, addSectionDataItem, updateSectionDataItem, deleteSectionDataItem } from './storage.js';
import { openModal, closeModal, showToast } from './ui.js';

export function createPageHandler(config) {
    const { sectionKey, modalId, renderItems, populateForm, getItemDataFromForm } = config;

    async function handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const editingId = form.elements.editingId.value;
        const itemData = getItemDataFromForm(form);

        if (editingId) {
            await updateSectionDataItem(sectionKey, editingId, itemData);
            showToast('Registro actualizado');
        } else {
            itemData.id = `${sectionKey}_${Date.now()}`;
            itemData.timestamp = Date.now();
            if (sectionKey === 'citas' || sectionKey === 'terapias') {
                itemData.status = 'pendiente';
            }
            await addSectionDataItem(sectionKey, itemData);
            showToast('Registro guardado');
        }

        form.reset();
        form.elements.editingId.value = '';
        closeModal(modalId);
        renderItems();
    }

    async function handleActionsClick(event) {
        const target = event.target.closest('button');
        if (!target) return;

        const itemId = target.dataset.id;
        if (target.classList.contains('delete-btn')) {
            await deleteSectionDataItem(sectionKey, itemId);
            showToast('Registro eliminado');
        } else if (target.classList.contains('edit-btn')) {
            const items = await getSectionData(sectionKey);
            const item = items.find(i => i.id === itemId);
            if (item) {
                populateForm(item);
                openModal(modalId);
            }
        } else if (target.classList.contains('attendance-btn')) {
            await updateSectionDataItem(sectionKey, itemId, { status: target.dataset.status });
        }
        
        renderItems();
    }

    function init() {
        const form = document.getElementById(`${sectionKey}-form`);
        const listContainer = document.getElementById(`${sectionKey}-list-container`);
        const addBtn = document.getElementById(`add-${sectionKey}-btn`);
        
        addBtn?.addEventListener('click', () => {
            if(form) {
                form.reset();
                form.elements.editingId.value = '';
            }
            openModal(modalId);
        });

        document.querySelectorAll(`.modal-close-btn[data-modal-id="${modalId}"]`).forEach(btn => {
            btn.addEventListener('click', () => closeModal(modalId));
        });

        form?.addEventListener('submit', handleFormSubmit);
        listContainer?.addEventListener('click', handleActionsClick);
        
        renderItems();
    }

    return { init };
}