// --- Base de Datos Temporal del Perfil ---
let tempProfileData = null; 
let avatarDataUrl = null;

// --- Funciones de Renderizado y UI ---

function renderProfileSummary() {
    const summaryContainer = document.getElementById('profile-summary-container');
    const emptyState = document.getElementById('profile-empty-state');
    const editBtn = document.getElementById('edit-profile-main-btn');

    if (!summaryContainer || !emptyState || !editBtn) return;
    
    if (tempProfileData === null) {
        summaryContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        editBtn.classList.add('hidden');
    } else {
        summaryContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        editBtn.classList.remove('hidden');
        
        document.getElementById('summary-avatar').src = tempProfileData.avatar || 'images/avatar.png';
        document.getElementById('summary-name').textContent = tempProfileData.fullName || 'N/A';
        document.getElementById('summary-email').textContent = tempProfileData.email || 'N/A';

        document.getElementById('personal-data-summary').innerHTML = `
            <div class="profile-item"><span class="profile-item-label">Edad</span><span class="profile-item-value">${tempProfileData.age || 'N/A'}</span></div>
        `;

        document.getElementById('contact-data-summary').innerHTML = `
            <div class="profile-item"><span class="profile-item-label">EPS</span><span class="profile-item-value">${tempProfileData.eps || 'N/A'}</span></div>
            <div class="profile-item"><span class="profile-item-label">Teléfono EPS</span><span class="profile-item-value">${tempProfileData.epsPhone || 'N/A'}</span></div>
            <div class="profile-item"><span class="profile-item-label">Contacto Emergencia</span><span class="profile-item-value">${tempProfileData.emergencyContactName || 'N/A'}</span></div>
            <div class="profile-item"><span class="profile-item-label">Teléfono Emergencia</span><span class="profile-item-value">${tempProfileData.emergencyContactPhone || 'N/A'}</span></div>
        `;

        const conditionsHTML = (tempProfileData.conditions && tempProfileData.conditions.length > 0)
            ? tempProfileData.conditions.map(c => `<span class="tag">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`).join('')
            : '<span class="profile-item-label">No hay condiciones seleccionadas.</span>';
        
        document.getElementById('medical-data-summary').innerHTML = `<div class="tags-container">${conditionsHTML}</div>`;
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


export function init() {
    const form = document.getElementById('profile-form');
    if (!form) {
        console.warn("Formulario de perfil aún no disponible. Se esperará a que el DOM cargue completamente.");
        document.addEventListener("DOMContentLoaded", () => {
            const formAfterLoad = document.getElementById('profile-form');
            if (formAfterLoad) init();
        }, { once: true });
        return;
    }

    const formModal = document.getElementById('profile-form-modal');
    const addInitialBtn = document.getElementById('add-profile-initial-btn');
    const editBtn = document.getElementById('edit-profile-main-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaRadio = form.querySelector('input[name="renalAccess"][value="fistula"]');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');
    const hemodialysisDaysCheckboxes = form.querySelectorAll('input[name="hemodialysisDays"]');

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

    hemodialysisDaysCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', () => {
            const checkedCount = form.querySelectorAll('input[name="hemodialysisDays"]:checked').length;
            if (checkedCount >= 3) {
                hemodialysisDaysCheckboxes.forEach(cb => {
                    if (!cb.checked) cb.disabled = true;
                });
            } else {
                hemodialysisDaysCheckboxes.forEach(cb => cb.disabled = false);
            }
        });
    });

    function openFormModal() {
        form.reset();
        avatarDataUrl = null;
        if(renalInfoContainer) renalInfoContainer.classList.add('hidden');
        if(fistulaLocationContainer) fistulaLocationContainer.classList.add('hidden');
        hemodialysisDaysCheckboxes.forEach(cb => cb.disabled = false);
        if(avatarPreview) avatarPreview.src = 'images/avatar.png';
        
        if (tempProfileData) {
            document.getElementById('profile-form-title').textContent = 'Editar Perfil';
            
            Object.keys(tempProfileData).forEach(key => {
                if (form.elements[key] && typeof form.elements[key] !== 'undefined' && !form.elements[key].length) {
                    form.elements[key].value = tempProfileData[key];
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
                    tempProfileData.hemodialysisDays.forEach(day => {
                        const check = form.querySelector(`input[name="hemodialysisDays"][value="${day}"]`);
                        if(check) check.checked = true;
                    });
                }
            }
            
            if(tempProfileData.avatar) {
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
        formModal?.classList.add('hidden');
    }

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
        data.conditions = formData.getAll('conditions');
        data.hemodialysisDays = formData.getAll('hemodialysisDays');
        data.avatar = avatarDataUrl || tempProfileData?.avatar;

        tempProfileData = data;

        closeFormModal();
        renderProfileSummary();
        updateMainMenu(tempProfileData.conditions);
    });

    renderProfileSummary();
    if(tempProfileData && tempProfileData.conditions) {
        updateMainMenu(tempProfileData.conditions);
    } else {
        updateMainMenu();
    }
}
