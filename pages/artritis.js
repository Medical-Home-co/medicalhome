import { createPageHandler } from '../page-handler.js';
import { getSectionData } from '../storage.js';

const SECTION_KEY = 'artritis';

async function renderItems() {
    const list = document.getElementById('artritis-list');
    const emptyMessage = document.getElementById('empty-artritis-list');
    const items = await getSectionData(SECTION_KEY);
    list.innerHTML = items.length ? 'Render items...' : 'No hay registros';
}

const handler = createPageHandler({
    sectionKey: SECTION_KEY,
    modalId: 'artritis-modal',
    renderItems,
});

export const init = handler.init;
