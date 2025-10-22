// --- js/perfil.js ---
import { store } from './store.js';

let avatarDataUrl = null;
let tempAlergias = [];
let currentProfileData = null;

function renderProfileSummary() {
    const summaryContainer = document.getElementById('profile-summary-container');
    const emptyState = document.getElementById('profile-empty-state');
    const editBtn = document.getElementById('edit-profile-main-btn');
    // Añadir comprobaciones robustas para elementos principales
    if (!summaryContainer || !emptyState || !editBtn) {
        console.warn("Elementos principales del resumen (contenedor, estado vacío o botón editar) no encontrados.");
        return; // Salir si falta alguno de los elementos base
    }
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarUsername = document.getElementById('sidebar-username');

    if (currentProfileData === null) {
        summaryContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        editBtn.classList.add('hidden');
        if (sidebarAvatar) sidebarAvatar.src = 'images/avatar.png';
        if (sidebarUsername) sidebarUsername.textContent = 'Usuario';
    } else {
        summaryContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        editBtn.classList.remove('hidden');
        if (sidebarAvatar) sidebarAvatar.src = currentProfileData.avatar || 'images/avatar.png';
        if (sidebarUsername) sidebarUsername.textContent = currentProfileData.fullName || 'Usuario';

        // === INICIO DE LA SOLUCIÓN: Comprobaciones añadidas ===
        const personalSummaryEl = document.getElementById('personal-data-summary');
        if (personalSummaryEl) { // Verificar si el elemento existe
            personalSummaryEl.innerHTML = `
                <div class="profile-item-avatar"> <img src="${currentProfileData.avatar || 'images/avatar.png'}" alt="Avatar"> <span>${currentProfileData.fullName || 'N/A'}</span> </div>
                <div class="profile-item"><span class="profile-item-label">Correo</span><span class="profile-item-value">${currentProfileData.email || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Edad</span><span class="profile-item-value">${currentProfileData.age || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Tipo Sangre</span><span class="profile-item-value">${currentProfileData.bloodType || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Peso</span><span class="profile-item-value">${currentProfileData.weight ? currentProfileData.weight + ' Kg' : 'N/A'}</span></div>`;
        } else {
            console.warn("Elemento #personal-data-summary no encontrado en perfil.html");
        }

        const emergencySummaryEl = document.getElementById('emergency-data-summary');
        if (emergencySummaryEl) { // Verificar si el elemento existe
            emergencySummaryEl.innerHTML = `
                <div class="profile-item"><span class="profile-item-label">EPS</span><span class="profile-item-value">${currentProfileData.eps || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Teléfono EPS</span><span class="profile-item-value">${currentProfileData.epsPhone || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Contacto Emergencia</span><span class="profile-item-value">${currentProfileData.emergencyContactName || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Teléfono Emergencia</span><span class="profile-item-value">${currentProfileData.emergencyContactPhone || 'N/A'}</span></div>`;
        } else {
             console.warn("Elemento #emergency-data-summary no encontrado en perfil.html");
        }

        const medicalSummaryEl = document.getElementById('medical-data-summary');
        if (medicalSummaryEl) { // Verificar si el elemento existe
            const conditions = Array.isArray(currentProfileData.conditions) ? currentProfileData.conditions : [];
            const conditionsHTML = conditions.length > 0 ? conditions.map(c => `<span class="tag">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`).join('') : '<span class="profile-item-label">No hay condiciones seleccionadas.</span>';
            const alergias = Array.isArray(currentProfileData.alergias) ? currentProfileData.alergias : [];
            const alergiasHTML = alergias.length > 0 ? alergias.map(a => `<span class="tag">${a}</span>`).join('') : '<span class="profile-item-label">No hay alergias registradas.</span>';
            medicalSummaryEl.innerHTML = `
                <h4 class="profile-item-label" style="margin-bottom: 0.5rem;">Condiciones</h4> <div class="tags-container">${conditionsHTML}</div>
                <h4 class="profile-item-label" style="margin-top: 1rem; margin-bottom: 0.5rem;">Alergias</h4> <div class="tags-container">${alergiasHTML}</div>`;
        } else {
            console.warn("Elemento #medical-data-summary no encontrado en perfil.html");
        }
        // === FIN DE LA SOLUCIÓN ===
    }
}

function updateMainMenu(conditions) {
    const allConditions = ['renal', 'cardiaco', 'diabetes', 'artritis', 'tea', 'respiratorio', 'gastrico', 'general'];
    const accordion = document.querySelector('.nav-item-accordion');
    // === INICIO DE LA SOLUCIÓN: Comprobación añadida ===
    if (!accordion) {
        // console.warn("Elemento .nav-item-accordion no encontrado en el DOM.");
        // No hacer nada si el acordeón no existe aún
        // return; // Podrías descomentar esto si causa problemas, pero toggle('hidden', true) es seguro
    }
    // === FIN DE LA SOLUCIÓN ===

    let hasVisibleConditions = false;
    const safeConditions = Array.isArray(conditions) ? conditions : [];
    allConditions.forEach(condition => {
        const navLink = document.querySelector(`.nav-link[href="#${condition}"]`);
        if (navLink) {
            const listItem = navLink.closest('li');
            if (listItem) {
                listItem.classList.toggle('hidden', !safeConditions.includes(condition));
                if (safeConditions.includes(condition)) hasVisibleConditions = true;
            }
        }
    });
    // Si accordion es null, toggle no hará nada y no dará error.
    accordion?.classList.toggle('hidden', !hasVisibleConditions);
}

export function init() {
    currentProfileData = store.getProfile();
    console.log("Cargado js/perfil.js (Versión con comprobaciones)");

    const form = document.getElementById('profile-form');
    const formModal = document.getElementById('profile-form-modal');
    const addInitialBtn = document.getElementById('add-profile-initial-btn');
    const editBtn = document.getElementById('edit-profile-main-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');

    // --- (Función openFormModal y closeFormModal sin cambios) ---
    function openFormModal() {
        if (!form || !formModal) { console.error("Formulario o modal no encontrado."); return; }
        form.reset();
        avatarDataUrl = null;
        tempAlergias = [];
        document.getElementById('alergias-list')?.innerHTML = '';
        const renalInfoContainer = document.getElementById('renal-info-container');
        const fistulaLocationContainer = document.getElementById('fistula-location-container');
        const avatarPreview = document.getElementById('avatar-preview');
        renalInfoContainer?.classList.add('hidden');
        fistulaLocationContainer?.classList.add('hidden');
        avatarPreview?.setAttribute('src', 'images/avatar.png');

        if (currentProfileData) {
            document.getElementById('profile-form-title')?.textContent = 'Editar Perfil';
            Object.keys(currentProfileData).forEach(key => {
                if (form.elements[key] && !form.elements[key].length) {
                     if (key !== 'password' && key !== 'confirmPassword') form.elements[key].value = currentProfileData[key];
                }
            });
            const conditions = currentProfileData.conditions || [];
            form.querySelectorAll('input[name="conditions"]').forEach(check => { check.checked = conditions.includes(check.value); });
            if (conditions.includes('renal')) {
                const renalAccessRadio = form.querySelector(`input[name="renalAccess"][value="${currentProfileData.renalAccess}"]`);
                if (renalAccessRadio) renalAccessRadio.checked = true;
                const hemodialysisDaysRadio = form.querySelector(`input[name="hemodialysisDays"][value="${currentProfileData.hemodialysisDays}"]`);
                if (hemodialysisDaysRadio) hemodialysisDaysRadio.checked = true;
            }
            if (avatarPreview && currentProfileData.avatar) {
                avatarPreview.src = currentProfileData.avatar;
                avatarDataUrl = currentProfileData.avatar;
            }
            tempAlergias = currentProfileData.alergias || [];
            renderAlergiasList();
            const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
            renalCheckbox?.dispatchEvent(new Event('change'));
            const checkedAccess = form.querySelector('input[name="renalAccess"]:checked');
            checkedAccess?.dispatchEvent(new Event('change'));
        } else {
            document.getElementById('profile-form-title')?.textContent = 'Crear Perfil';
            tempAlergias = [];
        }
        formModal.classList.remove('hidden');
    }

    function closeFormModal() { formModal?.classList.add('hidden'); }

    // --- (Listeners botones principales sin cambios) ---
    addInitialBtn?.addEventListener('click', openFormModal);
    editBtn?.addEventListener('click', openFormModal);
    cancelBtn?.addEventListener('click', closeFormModal);

    // --- (Lógica del formulario y listeners internos sin cambios) ---
    if (!form) {
        console.warn("Elemento #profile-form no encontrado.");
        // Llamar a render y update ANTES de salir
        renderProfileSummary();
        updateMainMenu(currentProfileData ? currentProfileData.conditions : []); // Pasar condiciones
        if (sessionStorage.getItem('openProfileModal') === 'true') {
            sessionStorage.removeItem('openProfileModal');
            addInitialBtn?.click();
        }
        return; // Salir si no hay formulario
    }

    // --- Código que se ejecuta SOLO si el form SÍ existe ---
    const alergiasInput = document.getElementById('alergias-input');
    const addAlergiaBtn = document.getElementById('add-alergia-btn');
    const alergiasList = document.getElementById('alergias-list');

    function renderAlergiasList() {
        if (!alergiasList) return;
        alergiasList.innerHTML = '';
        tempAlergias.forEach((alergia, index) => {
            const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = alergia;
            const removeBtn = document.createElement('button'); removeBtn.textContent = 'x'; removeBtn.type = 'button';
            removeBtn.style = 'margin-left: 5px; border: none; background: none; cursor: pointer; color: red;';
            removeBtn.onclick = () => { tempAlergias.splice(index, 1); renderAlergiasList(); };
            tag.appendChild(removeBtn); alergiasList.appendChild(tag);
        });
    }

    addAlergiaBtn?.addEventListener('click', () => {
        if (!alergiasInput) return;
        const alergia = alergiasInput.value.trim();
        if (alergia && !tempAlergias.includes(alergia)) { tempAlergias.push(alergia); alergiasInput.value = ''; renderAlergiasList(); }
    });

    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    avatarUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => { avatarDataUrl = event.target.result; if (avatarPreview) avatarPreview.src = avatarDataUrl; };
        reader.readAsDataURL(file);
    });

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    function forceNumeric(e) { if (!['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !/[0-9]/.test(e.key)) e.preventDefault(); }
    passwordInput?.addEventListener('keydown', forceNumeric);
    confirmPasswordInput?.addEventListener('keydown', forceNumeric);

    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaRadio = form.querySelector('input[name="renalAccess"][value="fistula"]');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');
    renalCheckbox?.addEventListener('change', () => { if (renalInfoContainer) renalInfoContainer.classList.toggle('hidden', !renalCheckbox.checked); const inputs = renalInfoContainer?.querySelectorAll('input, select'); inputs?.forEach(input => input.required = renalCheckbox.checked); });
    form.querySelectorAll('input[name="renalAccess"]').forEach(radio => { radio.addEventListener('change', () => { const showFistula = fistulaRadio?.checked; if (fistulaLocationContainer) fistulaLocationContainer.classList.toggle('hidden', !showFistula); const select = fistulaLocationContainer?.querySelector('select'); if (select) select.required = showFistula; }); });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = form.elements.password?.value || '';
        const confirmPassword = form.elements.confirmPassword?.value || '';
        if (!currentProfileData || (currentProfileData && password !== '')) { if (password !== confirmPassword) { alert('Las contraseñas no coinciden.'); return; } }
        const formData = new FormData(form); const data = Object.fromEntries(formData.entries());
        data.conditions = formData.getAll('conditions'); data.alergias = tempAlergias; data.hemodialysisDays = formData.get('hemodialysisDays'); data.avatar = avatarDataUrl || currentProfileData?.avatar;
        if (currentProfileData && password === '') { data.password = currentProfileData.password; data.confirmPassword = currentProfileData.password; }
        store.saveProfile(data); currentProfileData = data;
        closeFormModal(); renderProfileSummary(); updateMainMenu(currentProfileData.conditions);
    });

    // --- Renderizado final y apertura modal ---
    // (Se llaman aquí porque el form SÍ existe)
    renderProfileSummary();
    updateMainMenu(currentProfileData ? currentProfileData.conditions : []);
    if (sessionStorage.getItem('openProfileModal') === 'true') {
        sessionStorage.removeItem('openProfileModal');
        openFormModal();
    }
}