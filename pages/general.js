import { createPageHandler } from '../page-handler.js';
import { getSectionData } from '../storage.js';

const SECTION_KEY = 'general';

async function renderItems() {
    const list = document.getElementById('general-list');
    const emptyMessage = document.getElementById('empty-general-list');
    const items = await getSectionData(SECTION_KEY);
    list.innerHTML = items.length ? 'Render items...' : 'No hay registros';
}

const handler = createPageHandler({
    sectionKey: SECTION_KEY,
    modalId: 'general-modal',
    renderItems,
});

export const init = handler.init;
