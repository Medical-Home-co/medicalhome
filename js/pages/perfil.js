/* --- js/pages/perfil.js (SOLUCIÓN: Restaurado y con Rutas Absolutas) --- */
import { store } from '/js/store.js';
import { requestNotificationPermission } from '/js/notifications.js';
import { auth } from '/js/firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// NINGUNA inicialización de initializeAppCheck() va aquí

let tempProfileData = null; 
let avatarDataUrl = null;

// --- Funciones de Renderizado y UI ---
function renderProfileSummary() {
    const summaryContainer = document.getElementById('profile-summary-container');
    const emptyState = document.getElementById('profile-empty-state');
    const editBtn = document.getElementById('edit-profile-main-btn');
    const activateNotificationsBtn = document.getElementById('activate-notifications-btn'); 
    if (!summaryContainer || !emptyState || !editBtn || !activateNotificationsBtn) { console.warn("Elementos principales del resumen de perfil no encontrados."); return; }
    if (tempProfileData === null) {
        summaryContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        editBtn.classList.add('hidden');
        activateNotificationsBtn.classList.add('hidden');
    } else {
        summaryContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        editBtn.classList.remove('hidden');
        activateNotificationsBtn.classList.remove('hidden');
        const personalDataEl = document.getElementById('personal-data-summary');
        const medicalDataEl = document.getElementById('medical-data-summary');
        const emergencyDataEl = document.getElementById('emergency-data-summary');
        if (personalDataEl) {
             personalDataEl.innerHTML = `
                <div class="profile-item"><span class="profile-item-label">Nombre</span><span class="profile-item-value">${tempProfileData.fullName || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Edad</span><span class="profile-item-value">${tempProfileData.age || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Tipo Sangre</span><span class="profile-item-value">${tempProfileData.bloodType || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Peso</span><span class="profile-item-value">${tempProfileData.weight ? tempProfileData.weight + ' Kg' : 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Estatura</span><span class="profile-item-value">${tempProfileData.height ? tempProfileData.height + ' cm' : 'N/A'}</span></div>
            `;
        }
        if (medicalDataEl) {
             const alergiasHTML = (tempProfileData.alergias && tempProfileData.alergias.length > 0)
                ? `<div class="profile-item-label" style="margin-bottom: 0.5rem; margin-top: 0.5rem; font-weight: 600;">Alergias:</div><div class="tags-container">${tempProfileData.alergias.map(a => `<span class="tag">${a}</span>`).join('')}</div>`
                : '';
             const conditionsHTML = (tempProfileData.conditions && tempProfileData.conditions.length > 0)
                ? `<div class="profile-item-label" style="margin-bottom: 0.5rem; margin-top: 1rem; font-weight: 600;">Condiciones:</div><div class="tags-container">
                    ${tempProfileData.conditions.map(c => 
                        `<a href="#${c}" style="text-decoration: none;">
                            <span class="tag tag-link">${c.charAt(0).toUpperCase() + c.slice(1)}</span>
                        </a>`
                    ).join('')}
                  </div>`
                : '<span class="profile-item-label" style="margin-top: 1rem;">No hay condiciones seleccionadas.</span>';
             medicalDataEl.innerHTML = alergiasHTML + conditionsHTML;
        }
        if (emergencyDataEl) {
            emergencyDataEl.innerHTML = `
                <div class="profile-item"><span class="profile-item-label">Email</span><span class="profile-item-value">${tempProfileData.email || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">EPS</span><span class="profile-item-value">${tempProfileData.eps || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Tel. EPS</span><span class="profile-item-value">${tempProfileData.epsPhone || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Contacto Emerg.</span><span class="profile-item-value">${tempProfileData.emergencyContactName || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">Tel. Emerg.</span><span class="profile-item-value">${tempProfileData.emergencyContactPhone || 'N/A'}</span></div>
            `;
        }
    }
}
function updateMainMenu(conditions = []) {
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
                } else { listItem.classList.add('hidden'); }
            }
        }
    });
    if (accordion) accordion.classList.toggle('hidden', !hasVisibleConditions);
}
function openFormModal(profileData) {
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
    document.getElementById('alergias-list').innerHTML = ''; 
    form.querySelectorAll('.password-toggle-btn').forEach(button => {
        const input = button.closest('.input-with-icon').querySelector('input');
        const icon = button.querySelector('img');
        if (input) input.type = 'password';
        if (icon) { icon.src = 'images/icons/eye.svg'; icon.alt = 'Mostrar contraseña'; }
        button.setAttribute('aria-label', 'Mostrar contraseña');
    });
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    const renalInputs = document.querySelectorAll('#renal-info-container [required]');
    renalInputs.forEach(input => input.required = false);
    
    if (profileData) { // Editando perfil existente
        document.getElementById('profile-form-title').textContent = 'Editar Perfil';
        if(emailInput) { emailInput.disabled = true; emailInput.style.backgroundColor = 'var(--border-color)'; }
        if(passwordInput) { passwordInput.disabled = true; passwordInput.placeholder = "Contraseña no se puede cambiar"; passwordInput.required = false; }
        if(confirmPasswordInput) { confirmPasswordInput.disabled = true; confirmPasswordInput.placeholder = "Contraseña no se puede cambiar"; confirmPasswordInput.required = false; }
        Object.keys(profileData).forEach(key => {
            const element = form.elements[key];
            if (element && typeof element !== 'undefined' && !element.length) {
                if (element.type !== 'file' && element.type !== 'password' && element.type !== 'select-one') {
                    element.value = profileData[key];
                }
            }
        });
        form.elements.bloodType.value = profileData.bloodType || '';
        form.elements.fistulaLocation.value = profileData.fistulaLocation || '';
        if (profileData.conditions) {
            form.querySelectorAll('input[name="conditions"]').forEach(check => {
                check.checked = profileData.conditions.includes(check.value);
            });
        }
        if (profileData.conditions && profileData.conditions.includes('renal')) {
            const renalAccessRadio = form.querySelector(`input[name="renalAccess"][value="${profileData.renalAccess}"]`);
            if(renalAccessRadio) renalAccessRadio.checked = true;
            if (profileData.hemodialysisDays) {
                const dayValue = Array.isArray(profileData.hemodialysisDays) ? profileData.hemodialysisDays[0] : profileData.hemodialysisDays;
                if (dayValue) {
                    const radio = form.querySelector(`input[name="hemodialysisDays"][value="${dayValue}"]`);
                    if(radio) radio.checked = true;
                }
            }
            renalInputs.forEach(input => input.required = true);
            if (form.querySelector('input[name="renalAccess"][value="fistula"]').checked === false) {
                 document.getElementById('fistulaLocation').required = false;
            }
        }
        if(profileData.avatar && avatarPreview) { avatarPreview.src = profileData.avatar; avatarDataUrl = profileData.avatar; }
        if (profileData.alergias) { profileData.alergias.forEach(alergia => renderAlergiaTag(alergia)); }
        renalCheckbox?.dispatchEvent(new Event('change'));
        const checkedAccess = form.querySelector('input[name="renalAccess"]:checked');
        if(checkedAccess) checkedAccess.dispatchEvent(new Event('change'));
    } else { // Creando perfil nuevo
         document.getElementById('profile-form-title').textContent = 'Crear Perfil';
         if(emailInput) { emailInput.disabled = false; emailInput.style.backgroundColor = 'var(--bg-secondary)'; }
         if(passwordInput) { passwordInput.disabled = false; passwordInput.placeholder = "Contraseña (solo números)"; passwordInput.required = true; }
         if(confirmPasswordInput) { confirmPasswordInput.disabled = false; confirmPasswordInput.placeholder = "Confirmar Contraseña"; confirmPasswordInput.required = true; }
    }
    formModal?.classList.remove('hidden');
}
function closeFormModal() { document.getElementById('profile-form-modal')?.classList.add('hidden'); }
function renderAlergiaTag(alergia) {
    const alergiasList = document.getElementById('alergias-list');
    if (!alergiasList) return;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = alergia;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.style.marginLeft = '5px';
    removeBtn.style.fontSize = '1.1em';
    removeBtn.style.color = 'var(--danger-color)';
    removeBtn.style.lineHeight = '1';
    removeBtn.onclick = (e) => { e.target.parentElement.remove(); };
    tag.appendChild(removeBtn);
    alergiasList.appendChild(tag);
}
export function init() {
    const form = document.getElementById('profile-form');
    if (!form) { console.warn("Formulario de perfil (profile-form) no encontrado. Reintentando..."); setTimeout(init, 50); return; }
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
    const renalInputs = renalInfoContainer.querySelectorAll('input[name="renalAccess"], input[name="hemodialysisDays"], #hemodialysisTime, #clinicName');
    
    const fistulaRadio = form.querySelector('input[name="renalAccess"][value="fistula"]');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');
    const fistulaSelect = document.getElementById('fistulaLocation');

    avatarUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => { avatarDataUrl = event.target.result; if(avatarPreview) avatarPreview.src = avatarDataUrl; };
            reader.readAsDataURL(file);
        }
    });

    renalCheckbox?.addEventListener('change', () => {
        const isRenalChecked = renalCheckbox.checked;
        renalInfoContainer.classList.toggle('hidden', !isRenalChecked);
        renalInputs.forEach(input => input.required = isRenalChecked);
        
        if (isRenalChecked && fistulaRadio.checked) {
            fistulaSelect.required = true;
        } else {
            fistulaSelect.required = false;
        }
    });
    
    form.querySelectorAll('input[name="renalAccess"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const isFistulaChecked = fistulaRadio.checked;
            fistulaLocationContainer.classList.toggle('hidden', !isFistulaChecked);
            fistulaSelect.required = isFistulaChecked;
        });
    });
    
    const alergiasInput = document.getElementById('alergias-input');
    const addAlergiaBtn = document.getElementById('add-alergia-btn');

    addAlergiaBtn?.addEventListener('click', () => {
        const alergia = alergiasInput.value.trim();
        if (alergia) { renderAlergiaTag(alergia); alergiasInput.value = ''; }
    });
    alergiasInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addAlergiaBtn.click(); } });
    addInitialBtn?.addEventListener('click', () => openFormModal(null));
    editBtn?.addEventListener('click', () => openFormModal(tempProfileData));
    
    cancelBtn?.addEventListener('click', () => {
        const isNewUserFlow = (tempProfileData === null) && (auth.currentUser === null);
        if (isNewUserFlow) {
            console.log("Creación de perfil cancelada, volviendo a login.");
            window.location.hash = '#login';
        } else {
            closeFormModal();
        }
    });

    function updateNotificationButtonState() {
        if (!activateNotificationsBtn) return;
        if (window.Notification && Notification.permission === 'granted') {
            activateNotificationsBtn.classList.add('is-active');
            activateNotificationsBtn.disabled = true; 
            if (window.lucide) { try { window.lucide.createIcons(); } catch(e){} } 
        } else {
            activateNotificationsBtn.classList.remove('is-active');
            activateNotificationsBtn.disabled = false;
        }
    }
    activateNotificationsBtn?.addEventListener('click', async (e) => {
        e.preventDefault(); 
        if (activateNotificationsBtn.disabled) return;
        await requestNotificationPermission(); 
        updateNotificationButtonState();
    });
    updateNotificationButtonState(); 
    document.querySelectorAll('.password-toggle-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const input = btn.closest('.input-with-icon').querySelector('input');
            const icon = btn.querySelector('img');
            if (!input || !icon) return;
            if (input.type === 'password') {
                input.type = 'text';
                icon.src = 'images/icons/eye-closed.svg';
                icon.alt = 'Ocultar contraseña';
                btn.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                input.type = 'password';
                icon.src = 'images/icons/eye.svg';
                icon.alt = 'Mostrar contraseña';
                btn.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = form.elements.password.value;
        const confirmPassword = form.elements.confirmPassword.value;
        const isNewUser = (tempProfileData === null) || (auth.currentUser === null);
        
        if (isNewUser && password.length < 6) {
             alert('La contraseña debe tener al menos 6 dígitos.');
             return;
        }
        if (isNewUser && password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.conditions = formData.getAll('conditions');
        data.alergias = Array.from(document.querySelectorAll('#alergias-list .tag')).map(tag => tag.textContent.slice(0, -1));
        if (data.conditions.includes('renal')) {
             data.hemodialysisDays = formData.get('hemodialysisDays');
        } else {
            delete data.renalAccess; delete data.fistulaLocation; delete data.hemodialysisDays;
            delete data.hemodialysisTime; delete data.clinicName;
        }
        data.avatar = avatarDataUrl || tempProfileData?.avatar;
        if (isNewUser) {
            try {
                console.log("Creando usuario en Firebase Auth...");
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                console.log("Usuario de Firebase creado:", userCredential.user);
                await updateProfile(auth.currentUser, { displayName: data.fullName });
                tempProfileData = data;
                store.saveProfile(tempProfileData);
                closeFormModal();
                renderProfileSummary();
                updateMainMenu(tempProfileData.conditions);
                alert("¡Perfil creado exitosamente!");
            } catch (error) {
                console.error("Error al crear usuario en Firebase:", error);
                alert(`Error al crear usuario: ${getFirebaseErrorMessage(error)}`);
                return;
            }
        } else {
            data.email = tempProfileData.email; 
            data.password = tempProfileData.password; 
            tempProfileData = data;
            store.saveProfile(tempProfileData);
            if (auth.currentUser && auth.currentUser.displayName !== tempProfileData.fullName) {
                 await updateProfile(auth.currentUser, { displayName: tempProfileData.fullName });
            }
            closeFormModal();
            renderProfileSummary();
            updateMainMenu(tempProfileData.conditions);
            alert("Perfil actualizado.");
            window.location.reload(); // Recargar para actualizar sidebar
        }
    });
    renderProfileSummary();
    if(tempProfileData && tempProfileData.conditions) { updateMainMenu(tempProfileData.conditions); }
    else { updateMainMenu(); }
    if (sessionStorage.getItem('openProfileModal') === 'true') {
        sessionStorage.removeItem('openProfileModal');
        if (!auth.currentUser && !tempProfileData) { openFormModal(null); }
        else if (auth.currentUser && !tempProfileData) { openFormModal(null); }
    }
}
function getFirebaseErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email': return 'El correo electrónico no es válido.';
        case 'auth/email-already-in-use': return 'Este correo electrónico ya está en uso.';
        case 'auth/weak-password': return 'La contraseña es muy débil (mín. 6 caracteres).';
        case 'auth/network-request-failed':
            return 'Ocurrió un error de red. Verifica tu conexión o la configuración de App Check (reCAPTCHA).';
        default: return 'Ocurrió un error. Intenta de nuevo.';
    }
}