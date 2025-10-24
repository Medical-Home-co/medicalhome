// --- js/perfil.js ---

import { store } from '../store.js';

let tempProfileData = null; 
let avatarDataUrl = null;

// --- Función helper para crear tags de Alergia ---
function renderAlergiaTag(alergia, listContainer) {
    if (!listContainer) return;
    const existente = listContainer.querySelector(`[data-value="${alergia.toLowerCase()}"]`);
    if (existente) return;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.dataset.value = alergia.toLowerCase(); 
    tag.textContent = alergia.charAt(0).toUpperCase() + alergia.slice(1);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.innerHTML = '&times;';
    removeBtn.setAttribute('aria-label', `Quitar ${alergia}`);
    removeBtn.onclick = () => { tag.remove(); };
    tag.appendChild(removeBtn);
    listContainer.appendChild(tag);
}

// --- Función 'renderProfileSummary' actualizada ---
function renderProfileSummary() {
    // ... (El contenido de esta función es el de la respuesta anterior, no ha cambiado)
    const summaryContainer = document.getElementById('profile-summary-container');
    const emptyState = document.getElementById('profile-empty-state');
    const editBtn = document.getElementById('edit-profile-main-btn');
    if (!summaryContainer || !emptyState || !editBtn) { return; }
    if (tempProfileData === null) {
        summaryContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        editBtn.classList.add('hidden');
    } else {
        summaryContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        editBtn.classList.remove('hidden');
        const personalDataEl = document.getElementById('personal-data-summary');
        const medicalDataEl = document.getElementById('medical-data-summary');
        const emergencyDataEl = document.getElementById('emergency-data-summary');
        if (personalDataEl) {
            personalDataEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <div style="flex-shrink: 0;">
                        <img src="${tempProfileData.avatar || 'images/avatar.png'}" alt="Avatar" class="profile-summary-avatar-img">
                    </div>
                    <div style="flex-grow: 1;">
                        <h4 style="font-size: 1.25rem; font-weight: 600; margin: 0; color: var(--text-primary);">${tempProfileData.fullName || 'N/A'}</h4>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem; word-break: break-all;">${tempProfileData.email || 'N/A'}</p>
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <div class="profile-item"><span class="profile-item-label">Edad</span><span class="profile-item-value">${tempProfileData.age || 'N/A'}</span></div>
                    <div class="profile-item"><span class="profile-item-label">Tipo de Sangre</span><span class="profile-item-value">${tempProfileData.bloodType || 'N/A'}</span></div>
                    <div class="profile-item"><span class="profile-item-label">Peso</span><span class="profile-item-value">${tempProfileData.weight ? tempProfileData.weight + ' Kg' : 'N/A'}</span></div>
                    <div class="profile-item"><span class="profile-item-label">Estatura</span><span class="profile-item-value">${tempProfileData.height ? tempProfileData.height + ' cm' : 'N/A'}</span></div>
                </div>
            `;
        }
        if (medicalDataEl) {
            const conditionsHTML = (tempProfileData.conditions && tempProfileData.conditions.length > 0) ? tempProfileData.conditions.map(c => `<span class="tag">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`).join('') : '<span class="profile-item-label" style="font-size: 0.9rem;">No hay condiciones.</span>';
            const alergiasHTML = (tempProfileData.alergias && tempProfileData.alergias.length > 0) ? tempProfileData.alergias.map(a => `<span class="tag">${a.charAt(0).toUpperCase() + a.slice(1)}</span>`).join('') : '<span class="profile-item-label" style="font-size: 0.9rem;">No hay alergias.</span>';
            let fistulaHTML = '';
            if (tempProfileData.conditions && tempProfileData.conditions.includes('renal') && tempProfileData.renalAccess === 'fistula') {
                fistulaHTML = `<div class="profile-item" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem;"><span class="profile-item-label">Acceso Renal</span><span class="profile-item-value">Fístula (${tempProfileData.fistulaLocation || 'N/A'})</span></div>`;
            }
            medicalDataEl.innerHTML = `
                <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Condiciones</h4>
                <div class="tags-container">${conditionsHTML}</div>
                <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 1rem; margin-bottom: 0.5rem;">Alergias</h4>
                <div class="tags-container">${alergiasHTML}</div>
                ${fistulaHTML}
            `;
        }
        if (emergencyDataEl) {
            emergencyDataEl.innerHTML = `
                <div class="profile-item"><span class="profile-item-label">EPS</span><span class="profile-item-value">${tempProfileData.eps || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Contacto Emergencia</span><span class="profile-item-value">${tempProfileData.emergencyContactName || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Teléfono Emergencia</span><span class="profile-item-value">${tempProfileData.emergencyContactPhone || 'N/A'}</span></div>
            `;
        }
    }
}


function updateMainMenu(conditions = []) {
    // ... (El contenido de esta función es el de la respuesta anterior, no ha cambiado)
    const allConditions = ['renal', 'cardiaco', 'diabetes', 'artritis', 'tea', 'respiratorio', 'gastrico', 'ocular', 'general'];
    const accordion = document.querySelector('.nav-item-accordion');
    let hasVisibleConditions = false;
    allConditions.forEach(condition => {
        const navLink = document.querySelector(`.nav-link[href="#${condition}"]`);
        if (navLink) {
            const listItem = navLink.closest('li');
            if (listItem) {
                if (conditions.includes(condition)) {
                    listItem.classList.remove('hidden');
                    hasVisibleConditions = true;
                } else {
                    listItem.classList.add('hidden');
                }
            }
        }
    });
    if (accordion) {
        accordion.classList.toggle('hidden', !hasVisibleConditions);
    }
}

function openFormModal() {
    // ... (El contenido de esta función es el de la respuesta anterior, no ha cambiado)
    const form = document.getElementById('profile-form');
    if (!form) return; 
    const formModal = document.getElementById('profile-form-modal');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');
    const avatarPreview = document.getElementById('avatar-preview');
    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    const alergiasList = document.getElementById('alergias-list');
    form.reset();
    avatarDataUrl = null;
    if(renalInfoContainer) renalInfoContainer.classList.add('hidden');
    if(fistulaLocationContainer) fistulaLocationContainer.classList.add('hidden');
    if(avatarPreview) avatarPreview.src = 'images/avatar.png';
    if(alergiasList) alergiasList.innerHTML = '';
    form.querySelectorAll('input[name="hemodialysisDays"]').forEach(cb => cb.disabled = false);
    if (tempProfileData) {
        document.getElementById('profile-form-title').textContent = 'Editar Perfil';
        Object.keys(tempProfileData).forEach(key => {
            const element = form.elements[key];
            if (element && typeof element !== 'undefined' && !element.length) {
                if (element.type !== 'file') {
                    element.value = tempProfileData[key];
                }
            }
        });
        if (tempProfileData.conditions) {
            form.querySelectorAll('input[name="conditions"]').forEach(check => {
                check.checked = tempProfileData.conditions.includes(check.value);
            });
        }
        if (tempProfileData.alergias && Array.isArray(tempProfileData.alergias)) {
            tempProfileData.alergias.forEach(alergia => renderAlergiaTag(alergia, alergiasList));
        }
        if (tempProfileData.conditions && tempProfileData.conditions.includes('renal')) {
            const renalAccessRadio = form.querySelector(`input[name="renalAccess"][value="${tempProfileData.renalAccess}"]`);
            if(renalAccessRadio) renalAccessRadio.checked = true;
            if (tempProfileData.hemodialysisDays) {
                const dayValue = Array.isArray(tempProfileData.hemodialysisDays) ? tempProfileData.hemodialysisDays[0] : tempProfileData.hemodialysisDays;
                if (dayValue) {
                    const radio = form.querySelector(`input[name="hemodialysisDays"][value="${dayValue}"]`);
                    if(radio) radio.checked = true;
                }
            }
        }
        if(tempProfileData.avatar && avatarPreview) {
            avatarPreview.src = tempProfileData.avatar;
            avatarDataUrl = tempProfileData.avatar;
        }
        renalCheckbox?.dispatchEvent(new Event('change'));
        const checkedAccess = form.querySelector('input[name="renalAccess"]:checked');
        if(checkedAccess) checkedAccess.dispatchEvent(new Event('change'));
    } else {
         document.getElementById('profile-form-title').textContent = 'Crear Perfil';
    }
    formModal?.classList.remove('hidden');
}

function closeFormModal() {
    const formModal = document.getElementById('profile-form-modal');
    formModal?.classList.add('hidden');
}

// --- Función Principal ---
export function init() {
    
    const form = document.getElementById('profile-form');
    if (!form) {
        console.warn("Formulario de perfil (profile-form) no encontrado. Reintentando en 10ms...");
        setTimeout(init, 10);
        return;
    }
    console.log("Perfil DOM listo. Inicializando...");
    tempProfileData = store.getProfile();

    // ... (Declaraciones de variables: addInitialBtn, editBtn, etc. sin cambios)
    const addInitialBtn = document.getElementById('add-profile-initial-btn');
    const editBtn = document.getElementById('edit-profile-main-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaRadio = form.querySelector('input[name="renalAccess"][value="fistula"]');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');
    const addAlergiaBtn = document.getElementById('add-alergia-btn');
    const alergiasInput = document.getElementById('alergias-input');
    const alergiasList = document.getElementById('alergias-list');

    // ... (Event listeners de alergias y avatar sin cambios)
    addAlergiaBtn?.addEventListener('click', () => {
        const alergia = alergiasInput.value.trim();
        if (alergia) {
            renderAlergiaTag(alergia, alergiasList);
            alergiasInput.value = '';
        }
    });
    alergiasInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAlergiaBtn.click();
        }
    });
    avatarUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                avatarDataUrl = event.target.result;
                if(avatarPreview) avatarPreview.src = avatarDataUrl;
            };
            reader.readAsDataURL(file);
        }
    });
    renalCheckbox?.addEventListener('change', () => {
        if(renalInfoContainer) renalInfoContainer.classList.toggle('hidden', !renalCheckbox.checked);
    });
    form.querySelectorAll('input[name="renalAccess"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if(fistulaLocationContainer) fistulaLocationContainer.classList.toggle('hidden', !fistulaRadio.checked);
        });
    });

    // ... (Event listeners de botones del modal sin cambios)
    addInitialBtn?.addEventListener('click', openFormModal);
    editBtn?.addEventListener('click', openFormModal);
    cancelBtn?.addEventListener('click', closeFormModal);

    // --- Evento Submit del Formulario (MODIFICADO) ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = form.elements.password.value;
        const confirmPassword = form.elements.confirmPassword.value;
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.conditions = formData.getAll('conditions');
        data.hemodialysisDays = formData.getAll('hemodialysisDays');
        
        const alergiasList = document.getElementById('alergias-list');
        const alergias = [];
        if (alergiasList) {
            alergiasList.querySelectorAll('.tag').forEach(tag => {
                alergias.push(tag.textContent.slice(0, -1)); // Quita la '×'
            });
        }
        data.alergias = alergias;
        data.avatar = avatarDataUrl || tempProfileData?.avatar;
        tempProfileData = data;
        
        store.saveProfile(tempProfileData);

        // --- SOLUCIÓN: Actualizar Sidebar Inmediatamente ---
        try {
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            const sidebarUsername = document.getElementById('sidebar-username');
            if (sidebarAvatar) {
                sidebarAvatar.src = tempProfileData.avatar || 'images/avatar.png';
            }
            if (sidebarUsername) {
                // Limitar el nombre si es muy largo
                const name = tempProfileData.fullName ? tempProfileData.fullName.split(' ')[0] : 'Invitado';
                sidebarUsername.textContent = `Hola, ${name}`;
            }
        } catch (e) {
            console.error("Error al actualizar sidebar en perfil.js:", e);
        }
        // --- FIN SOLUCIÓN ---

        closeFormModal();
        renderProfileSummary();
        updateMainMenu(tempProfileData.conditions);
    });

    // ... (Resto del código sin cambios)
    renderProfileSummary();
    if(tempProfileData && tempProfileData.conditions) {
        updateMainMenu(tempProfileData.conditions);
    } else {
        updateMainMenu();
    }
    if (sessionStorage.getItem('openProfileModal') === 'true') {
        sessionStorage.removeItem('openProfileModal');
        openFormModal(); 
    }
}