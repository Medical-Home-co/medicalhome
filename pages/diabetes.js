import { createPageHandler } from '../page-handler.js';
import { getSectionData } from '../storage.js';

const SECTION_KEY = 'diabetes';

async function renderItems() {
    const list = document.getElementById('diabetes-list');
    const emptyMessage = document.getElementById('empty-diabetes-list');
    const items = await getSectionData(SECTION_KEY);
    list.innerHTML = items.length ? 'Render items...' : 'No hay registros';
}

const handler = createPageHandler({
    sectionKey: SECTION_KEY,
    modalId: 'diabetes-modal',
    renderItems,
});

export const init = handler.init;
