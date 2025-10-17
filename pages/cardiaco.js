import { createPageHandler } from '../page-handler.js';
import { getSectionData } from '../storage.js';

const SECTION_KEY = 'cardiaco';

async function renderItems() {
    const list = document.getElementById('cardiaco-list');
    const emptyMessage = document.getElementById('empty-cardiaco-list');
    const items = await getSectionData(SECTION_KEY);
    list.innerHTML = items.length ? 'Render items...' : 'No hay registros';
}

const handler = createPageHandler({
    sectionKey: SECTION_KEY,
    modalId: 'cardiaco-modal',
    renderItems,
});

export const init = handler.init;
