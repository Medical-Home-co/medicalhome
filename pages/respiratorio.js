import { createPageHandler } from '../page-handler.js';
import { getSectionData } from '../storage.js';

const SECTION_KEY = 'respiratorio';

async function renderItems() {
    const list = document.getElementById('respiratorio-list');
    const emptyMessage = document.getElementById('empty-respiratorio-list');
    const items = await getSectionData(SECTION_KEY);
    list.innerHTML = items.length ? 'Render items...' : 'No hay registros';
}

const handler = createPageHandler({
    sectionKey: SECTION_KEY,
    modalId: 'respiratorio-modal',
    renderItems,
});

export const init = handler.init;
