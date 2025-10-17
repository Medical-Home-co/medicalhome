import { createPageHandler } from '../page-handler.js';
import { getSectionData } from '../storage.js';

const SECTION_KEY = 'gastrico';

async function renderItems() {
    const list = document.getElementById('gastrico-list');
    const emptyMessage = document.getElementById('empty-gastrico-list');
    const items = await getSectionData(SECTION_KEY);
    list.innerHTML = items.length ? 'Render items...' : 'No hay registros';
}

const handler = createPageHandler({
    sectionKey: SECTION_KEY,
    modalId: 'gastrico-modal',
    renderItems,
});

export const init = handler.init;
