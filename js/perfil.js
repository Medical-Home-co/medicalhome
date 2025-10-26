// --- js/perfil.js ---

import { store } from './store.js';
import { requestNotificationPermission } from './notifications.js';

let tempProfileData = null; 
let avatarDataUrl = null;

// --- Funciones de Renderizado y UI ---

function renderProfileSummary() {
    const summaryContainer = document.getElementById('profile-summary-container');
    const emptyState = document.getElementById('profile-empty-state');
    const editBtn = document.getElementById('edit-profile-main-btn');
    
    // --- INICIO DE LA CORRECCIÓN ---
    // También seleccionamos el botón de notificaciones
    const activateNotificationsBtn = document.getElementById('activate-notifications-btn'); 
    
    if (!summaryContainer || !emptyState || !editBtn || !activateNotificationsBtn) { // Añadido a la validación
        console.warn("Elementos principales del resumen de perfil no encontrados.");
        return;
    }
    
    if (tempProfileData === null) {
        summaryContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        editBtn.classList.add('hidden');
        activateNotificationsBtn.classList.add('hidden'); // Ocultarlo si no hay perfil
    } else {
        summaryContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        editBtn.classList.remove('hidden');
        activateNotificationsBtn.classList.remove('hidden'); // Mostrarlo si hay perfil
        // --- FIN DE LA CORRECCIÓN ---
        
        const avatarEl = document.getElementById('summary-avatar');
        const nameEl = document.getElementById('summary-name');
        const emailEl = document.getElementById('summary-email');
        const personalDataEl = document.getElementById('personal-data-summary');
        // --- CORRECCIÓN DE ID --- 
        // Tu HTML usa 'emergency-data-summary', no 'contact-data-summary'
        const contactDataEl = document.getElementById('emergency-data-summary'); 
        // --- FIN CORRECCIÓN DE ID ---
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
                <div class="profile-item"><span class="profile-item-label">Tipo Sangre</span><span class="profile-item-value">${tempProfileData.bloodType || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Peso</span><span class="profile-item-value">${tempProfileData.weight ? tempProfileData.weight + ' Kg' : 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Estatura</span><span class="profile-item-value">${tempProfileData.height ? tempProfileData.height + ' cm' : 'N/A'}</span></div>
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
    // ... (código idéntico) ...
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
    // ... (código idéntico) ...
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
            
            if (tempProfileData.hemodialysisDays) {
                const dayValue = Array.isArray(tempProfileData.hemodialysisDays) 
                    ? tempProfileData.hemodialysisDays[0] 
                    : tempProfileData.hemodialysisDays;

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
    // ... (código idéntico) ...
    const formModal = document.getElementById('profile-form-modal');
    formModal?.classList.add('hidden');
}

// Esta es la función principal que se exporta
export function init() {
    
    const form = document.getElementById('profile-form');
    
    if (!form) {
        console.warn("Formulario de perfil (profile-form) no encontrado. Reintentando en 10ms...");
        setTimeout(init, 10); 
        return;
    }
    
    console.log("Perfil DOM listo. Inicializando...");
    
    tempProfileData = store.getProfile();

    const addInitialBtn = document.getElementById('add-profile-initial-btn');
    const editBtn = document.getElementById('edit-profile-main-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    const activateNotificationsBtn = document.getElementById('activate-notifications-btn');
    
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaRadio = form.querySelector('input[name="renalAccess"][value="fistula"]');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');


    // Asignación de eventos
    avatarUpload?.addEventListener('change', (e) => {
        // ... (código idéntico) ...
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
        // ... (código idéntico) ...
        if(renalInfoContainer) renalInfoContainer.classList.toggle('hidden', !renalCheckbox.checked);
    });

    form.querySelectorAll('input[name="renalAccess"]').forEach(radio => {
        // ... (código idéntico) ...
        radio.addEventListener('change', () => {
            if(fistulaLocationContainer) fistulaLocationContainer.classList.toggle('hidden', !fistulaRadio.checked);
        });
    });

    addInitialBtn?.addEventListener('click', openFormModal);
    editBtn?.addEventListener('click', openFormModal);
    cancelBtn?.addEventListener('click', closeFormModal);

    // Listener para el botón de notificaciones
    activateNotificationsBtn?.addEventListener('click', (e) => {
        e.preventDefault(); 
        requestNotificationPermission();
    });

    form.addEventListener('submit', (e) => {
        // ... (código idéntico) ...
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

        // --- CORRECCIÓN LÓGICA HEMODIÁLISIS ---
        // Solo guardar días de hemodiálisis SI la condición renal está marcada
        if (data.conditions.includes('renal')) {
             data.hemodialysisDays = formData.getAll('hemodialysisDays');
        } else {
            // Limpiar datos renales si la casilla no está marcada
            delete data.renalAccess;
            delete data.fistulaLocation;
            delete data.hemodialysisDays;
            delete data.hemodialysisTime;
            delete data.clinicName;
        }
        // --- FIN CORRECCIÓN LÓGICA ---
        
        data.avatar = avatarDataUrl || tempProfileData?.avatar;

        tempProfileData = data;
        
        store.saveProfile(tempProfileData);

        closeFormModal();
        renderProfileSummary();
        updateMainMenu(tempProfileData.conditions);
    });

    // --- Renderizado y actualización inicial ---
    renderProfileSummary(); // Esta función ahora maneja la visibilidad de los botones
    if(tempProfileData && tempProfileData.conditions) {
        updateMainMenu(tempProfileData.conditions);
    } else {
        updateMainMenu();
    }

    // --- Lógica del Welcome Modal ---
    if (sessionStorage.getItem('openProfileModal') === 'true') {
        // ... (código idéntico) ...
        sessionStorage.removeItem('openProfileModal');
        openFormModal(); 
    }
}