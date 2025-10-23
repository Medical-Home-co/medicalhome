// --- js/perfil.js ---

import { store } from '../store.js';

let tempProfileData = null; 
let avatarDataUrl = null;

// --- Funciones de Renderizado y UI ---

function renderProfileSummary() {
    const summaryContainer = document.getElementById('profile-summary-container');
    const emptyState = document.getElementById('profile-empty-state');
    const editBtn = document.getElementById('edit-profile-main-btn');

    if (!summaryContainer || !emptyState || !editBtn) {
        console.warn("Elementos principales del resumen de perfil no encontrados.");
        return;
    }
    
    if (tempProfileData === null) {
        summaryContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        editBtn.classList.add('hidden');
    } else {
        summaryContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        editBtn.classList.remove('hidden');
        
        const avatarEl = document.getElementById('summary-avatar');
        const nameEl = document.getElementById('summary-name');
        const emailEl = document.getElementById('summary-email');
        const personalDataEl = document.getElementById('personal-data-summary');
        const contactDataEl = document.getElementById('contact-data-summary');
        const medicalDataEl = document.getElementById('medical-data-summary');

        if (avatarEl) {
            avatarEl.src = tempProfileData.avatar || 'images/avatar.png';
        }
        if (nameEl) {
            nameEl.textContent = tempProfileData.fullName || 'N/A';
        }
        if (emailEl) {
            emailEl.textContent = tempProfileData.email || 'N/A';
        }

        if (personalDataEl) {
            personalDataEl.innerHTML = `
                <div class="profile-item"><span class="profile-item-label">Edad</span><span class="profile-item-value">${tempProfileData.age || 'N/A'}</span></div>
            `;
        }

        if (contactDataEl) {
            contactDataEl.innerHTML = `
                <div class="profile-item"><span class="profile-item-label">EPS</span><span class="profile-item-value">${tempProfileData.eps || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Teléfono EPS</span><span class="profile-item-value">${tempProfileData.epsPhone || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Contacto Emergencia</span><span class="profile-item-value">${tempProfileData.emergencyContactName || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Teléfono Emergencia</span><span class="profile-item-value">${tempProfileData.emergencyContactPhone || 'N/A'}</span></div>
            `;
        }

        const conditionsHTML = (tempProfileData.conditions && tempProfileData.conditions.length > 0)
            ? tempProfileData.conditions.map(c => `<span class="tag">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`).join('')
            : '<span class="profile-item-label">No hay condiciones seleccionadas.</span>';
        
        if (medicalDataEl) {
            medicalDataEl.innerHTML = `<div class="tags-container">${conditionsHTML}</div>`;
        }
    }
}

function updateMainMenu(conditions = []) {
    const allConditions = ['renal', 'cardiaco', 'diabetes', 'artritis', 'tea', 'respiratorio', 'gastrico', 'general'];
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
    const form = document.getElementById('profile-form');
    if (!form) return; 

    const formModal = document.getElementById('profile-form-modal');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');
    const avatarPreview = document.getElementById('avatar-preview');
    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    
    form.reset();
    avatarDataUrl = null;
    if(renalInfoContainer) renalInfoContainer.classList.add('hidden');
    if(fistulaLocationContainer) fistulaLocationContainer.classList.add('hidden');
    if(avatarPreview) avatarPreview.src = 'images/avatar.png';
    
    // Deshabilitar los checkboxes de días (si es que la lógica aplicara, 
    // pero como ahora son radios, esta línea es solo de seguridad)
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
        
        if (tempProfileData.conditions && tempProfileData.conditions.includes('renal')) {
            const renalAccessRadio = form.querySelector(`input[name="renalAccess"][value="${tempProfileData.renalAccess}"]`);
            if(renalAccessRadio) renalAccessRadio.checked = true;

            // --- ¡CORRECCIÓN DEL ERROR! ---
            // Esta lógica maneja datos antiguos (string) y nuevos (array)
            if (tempProfileData.hemodialysisDays) {
                // Si es un array (método nuevo, ej: ["L-M-V"]), usa el primer valor.
                // Si es un string (método antiguo, ej: "L-M-V"), úsalo directamente.
                const dayValue = Array.isArray(tempProfileData.hemodialysisDays) 
                    ? tempProfileData.hemodialysisDays[0] 
                    : tempProfileData.hemodialysisDays;

                if (dayValue) {
                    const radio = form.querySelector(`input[name="hemodialysisDays"][value="${dayValue}"]`);
                    if(radio) radio.checked = true;
                }
            }
            // --- FIN DE LA CORRECCIÓN ---
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

// Esta es la función principal que se exporta
export function init() {
    
    const form = document.getElementById('profile-form');
    
    if (!form) {
        console.warn("Formulario de perfil (profile-form) no encontrado. Reintentando en 10ms...");
        setTimeout(init, 10); // Reintenta la función 'init' completa
        return;
    }
    
    console.log("Perfil DOM listo. Inicializando...");
    
    tempProfileData = store.getProfile();

    const addInitialBtn = document.getElementById('add-profile-initial-btn');
    const editBtn = document.getElementById('edit-profile-main-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaRadio = form.querySelector('input[name="renalAccess"][value="fistula"]');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');

    // --- ¡CÓDIGO ELIMINADO! ---
    // Se eliminó el "const hemodialysisDaysCheckboxes" y su .forEach,
    // ya que esa lógica era para checkboxes y tu HTML usa radios.

    // Asignación de eventos
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

    addInitialBtn?.addEventListener('click', openFormModal);
    editBtn?.addEventListener('click', openFormModal);
    cancelBtn?.addEventListener('click', closeFormModal);

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
        
        // Sobrescribir con .getAll() para asegurar que sean arrays
        data.conditions = formData.getAll('conditions');
        data.hemodialysisDays = formData.getAll('hemodialysisDays'); // Esto guardará ["L-M-V"]
        
        data.avatar = avatarDataUrl || tempProfileData?.avatar;

        tempProfileData = data;
        
        store.saveProfile(tempProfileData);

        closeFormModal();
        renderProfileSummary();
        updateMainMenu(tempProfileData.conditions);
    });

    // --- Renderizado y actualización inicial ---
    renderProfileSummary();
    if(tempProfileData && tempProfileData.conditions) {
        updateMainMenu(tempProfileData.conditions);
    } else {
        updateMainMenu();
    }

    // --- Lógica del Welcome Modal ---
    if (sessionStorage.getItem('openProfileModal') === 'true') {
        sessionStorage.removeItem('openProfileModal');
        openFormModal(); 
    }
}