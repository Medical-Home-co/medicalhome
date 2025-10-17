import { createPageHandler } from '../page-handler.js';
import { getSectionData } from '../storage.js';

const SECTION_KEY = 'renal';

async function renderItems() {
    const list = document.getElementById('renal-list');
    const emptyMessage = document.getElementById('empty-renal-list');
    const items = await getSectionData(SECTION_KEY);
    list.innerHTML = items.length ? 'Render items...' : 'No hay registros';
}

const handler = createPageHandler({
    sectionKey: SECTION_KEY,
    modalId: 'renal-modal',
    renderItems,
});

export const init = handler.init;
