/* --- js/pages/perfil.js (Corregido) --- */
import { store } from '../store.js';
// import { requestNotificationPermission } from '../notifications.js'; // Esta función no existe

// --- INICIO AUTH ---
import { auth } from '../firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"; // <-- CORREGIDO
// --- FIN AUTH ---

// --- INICIO FIRESTORE ---
import { db } from '../firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; // <-- CORREGIDO
// --- FIN FIRESTORE ---


let tempProfileData = null; 
let avatarDataUrl = null;

// --- Funciones de Renderizado y UI ---

function renderProfileSummary() {
    const summaryContainer = document.getElementById('profile-summary-container');
    const emptyState = document.getElementById('profile-empty-state');
    const editBtn = document.getElementById('edit-profile-main-btn');
    // const activateNotificationsBtn = document.getElementById('activate-notifications-btn'); 
    
    if (!summaryContainer || !emptyState || !editBtn) {
        console.warn("Elementos principales del resumen de perfil no encontrados.");
        return;
    }
    
    if (tempProfileData === null) {
        summaryContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        editBtn.classList.add('hidden');
        // activateNotificationsBtn.classList.add('hidden');
    } else {
        summaryContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        editBtn.classList.remove('hidden');
        // activateNotificationsBtn.classList.remove('hidden');
        
        // --- Lógica para rellenar los datos del resumen ---
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
             const conditionsHTML = (tempProfileData.conditions && tempProfileData.conditions.length > 0)
                ? tempProfileData.conditions.map(c => `<span class="tag">${c.charAt(0).toUpperCase() + c.slice(1)}</span>`).join('')
                : '<span class="profile-item-label">No hay condiciones seleccionadas.</span>';
             medicalDataEl.innerHTML = `<div class="tags-container">${conditionsHTML}</div>`;
        }
        if (emergencyDataEl) {
            emergencyDataEl.innerHTML = `
                <div class="profile-item"><span class="profile-item-label">Email</span><span class="profile-item-value">${tempProfileData.email || 'N/A'}</span></div>
                <div class="profile-item"><span class="profile-item-label">EPS</span><span class="profile-item-value">${tempProfileData.eps || 'N/A'}</span></div>
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
    document.getElementById('alergias-list').innerHTML = ''; // Limpiar alergias
    
    // Habilitar/deshabilitar campos de auth
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // `profileData` es el `tempProfileData` (perfil local)
    if (profileData) { // Editando perfil existente
        document.getElementById('profile-form-title').textContent = 'Editar Perfil';
        
        // Deshabilitar campos de email y contraseña
        if(emailInput) { emailInput.disabled = true; emailInput.style.backgroundColor = 'var(--border-color)'; }
        if(passwordInput) { passwordInput.disabled = true; passwordInput.placeholder = "Contraseña no se puede cambiar"; passwordInput.required = false; }
        if(confirmPasswordInput) { confirmPasswordInput.disabled = true; confirmPasswordInput.placeholder = "Contraseña no se puede cambiar"; confirmPasswordInput.required = false; }

        Object.keys(profileData).forEach(key => {
            const element = form.elements[key];
            if (element && typeof element !== 'undefined' && !element.length) {
                if (element.type !== 'file' && element.type !== 'password') {
                    element.value = profileData[key];
                }
            }
        });

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
        }
        
        if(profileData.avatar && avatarPreview) {
            avatarPreview.src = profileData.avatar;
            avatarDataUrl = profileData.avatar;
        }

        if (profileData.alergias) {
            profileData.alergias.forEach(alergia => renderAlergiaTag(alergia));
        }

        renalCheckbox?.dispatchEvent(new Event('change'));
        const checkedAccess = form.querySelector('input[name="renalAccess"]:checked');
        if(checkedAccess) checkedAccess.dispatchEvent(new Event('change'));

    } else { // Creando perfil nuevo
         document.getElementById('profile-form-title').textContent = 'Crear Perfil';
         form.reset(); // Asegurar que esté limpio
         
         const currentUser = auth.currentUser;
         if (currentUser && currentUser.providerData[0]?.providerId === 'google.com') {
             // Es un usuario de Google completando su perfil
             console.log("Rellenando perfil para usuario de Google...");
             
             if(emailInput) { 
                 emailInput.value = currentUser.email || '';
                 emailInput.disabled = true; // No pueden cambiar el email de Google
                 emailInput.style.backgroundColor = 'var(--border-color)';
             }
             if(passwordInput) { 
                 passwordInput.disabled = true; 
                 passwordInput.placeholder = "Autenticado con Google"; 
                 passwordInput.required = false; 
             }
             if(confirmPasswordInput) { 
                 confirmPasswordInput.disabled = true; 
                 confirmPasswordInput.placeholder = "Autenticado con Google"; 
                 confirmPasswordInput.required = false; 
             }
             
             form.elements.fullName.value = currentUser.displayName || '';
             if (currentUser.photoURL && avatarPreview) {
                 avatarPreview.src = currentUser.photoURL;
                 avatarDataUrl = currentUser.photoURL;
             }
             
         } else {
             // Es un usuario nuevo creando con Email/Pass
             if(emailInput) { 
                 emailInput.disabled = false; 
                 emailInput.style.backgroundColor = 'var(--bg-secondary)'; 
             }
             if(passwordInput) { 
                 passwordInput.disabled = false; 
                 passwordInput.placeholder = "Contraseña (solo números) *"; 
                 passwordInput.required = true; 
             }
             if(confirmPasswordInput) { 
                 confirmPasswordInput.disabled = false; 
                 confirmPasswordInput.placeholder = "Confirmar Contraseña *"; 
                 confirmPasswordInput.required = true; 
             }
         }
    }
    formModal?.classList.remove('hidden');
}

function closeFormModal() {
    const formModal = document.getElementById('profile-form-modal');
    formModal?.classList.add('hidden');
}

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

    removeBtn.onclick = (e) => {
        e.target.parentElement.remove();
    };
    tag.appendChild(removeBtn);
    alergiasList.appendChild(tag);
}

// --- Función Principal (init) ---
export function init() {
    const form = document.getElementById('profile-form');
    if (!form) {
        console.warn("Formulario de perfil (profile-form) no encontrado. Reintentando...");
        setTimeout(init, 50); 
        return;
    }
    
    console.log("Perfil DOM listo. Inicializando...");
    
    const localProfile = store.getProfile();
    const currentUser = auth.currentUser;

    if (localProfile) {
        tempProfileData = localProfile;
    } else if (currentUser) {
        tempProfileData = {
            fullName: currentUser.displayName,
            email: currentUser.email,
            avatar: currentUser.photoURL
        };
    } else {
        tempProfileData = null;
    }

    const addInitialBtn = document.getElementById('add-profile-initial-btn');
    const editBtn = document.getElementById('edit-profile-main-btn');
    const cancelBtn = document.getElementById('cancel-profile-btn');
    // const activateNotificationsBtn = document.getElementById('activate-notifications-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const avatarPreview = document.getElementById('avatar-preview');
    const renalCheckbox = form.querySelector('input[name="conditions"][value="renal"]');
    const renalInfoContainer = document.getElementById('renal-info-container');
    const fistulaRadio = form.querySelector('input[name="renalAccess"][value="fistula"]');
    const fistulaLocationContainer = document.getElementById('fistula-location-container');
    const alergiasInput = document.getElementById('alergias-input');
    const addAlergiaBtn = document.getElementById('add-alergia-btn');

    // --- Asignación de eventos ---
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

    addAlergiaBtn?.addEventListener('click', () => {
        const alergia = alergiasInput.value.trim();
        if (alergia) {
            renderAlergiaTag(alergia);
            alergiasInput.value = '';
        }
    });
    alergiasInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAlergiaBtn.click();
        }
    });

    addInitialBtn?.addEventListener('click', () => openFormModal(null));
    editBtn?.addEventListener('click', () => openFormModal(tempProfileData));
    cancelBtn?.addEventListener('click', closeFormModal);

    // activateNotificationsBtn?.addEventListener('click', (e) => {
    //     e.preventDefault(); 
    //     requestNotificationPermission();
    // });

    // --- Evento SUBMIT (CORREGIDO) ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = form.elements.password.value;
        const confirmPassword = form.elements.confirmPassword.value;

        const isNewUserCreation = (auth.currentUser === null);

        if (isNewUserCreation && password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        data.conditions = formData.getAll('conditions');
        data.alergias = Array.from(document.querySelectorAll('#alergias-list .tag')).map(tag => tag.textContent.slice(0, -1)); // Quitar la 'x'

        if (data.conditions.includes('renal')) {
             data.hemodialysisDays = formData.getAll('hemodialysisDays');
        } else {
            delete data.renalAccess; delete data.fistulaLocation; delete data.hemodialysisDays;
            delete data.hemodialysisTime; delete data.clinicName;
        }
        
        data.avatar = avatarDataUrl || tempProfileData?.avatar;

        // --- LÓGICA DE AUTENTICACIÓN Y GUARDADO (MODIFICADA) ---
        try {
            let user;
            
            if (isNewUserCreation) {
                // 1. Creando usuario con Email/Pass
                console.log("Creando usuario en Firebase Auth...");
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                user = userCredential.user;
                await updateProfile(user, { displayName: data.fullName, photoURL: data.avatar });
                
            } else {
                // 2. Usuario existente (Google o Email) guardando/actualizando perfil
                user = auth.currentUser;
                if (!user) {
                    alert("Error: No hay usuario autenticado. Por favor, inicia sesión de nuevo.");
                    window.location.hash = '';
                    window.location.reload();
                    return;
                }
                
                if (user.displayName !== data.fullName || user.photoURL !== data.avatar) {
                    await updateProfile(user, { displayName: data.fullName, photoURL: data.avatar });
                }
            }

            // --- Guardar perfil en Firestore ---
            console.log(`Guardando perfil en Firestore para ${user.uid}...`);
            const profileRef = doc(db, "users", user.uid);
            
            const profileData = { ...data };
            delete profileData.password;
            delete profileData.confirmPassword;
            delete profileData['avatar-upload'];
            profileData.uid = user.uid;
            
            await setDoc(profileRef, profileData);
            console.log("Perfil guardado en Firestore.");

            // Guardar en LocalStorage
            store.saveProfile(profileData);
            tempProfileData = profileData;
            
            closeFormModal();
            renderProfileSummary();
            updateMainMenu(tempProfileData.conditions);
            
            alert("¡Perfil guardado exitosamente!");
            sessionStorage.setItem('loginSuccess', 'true'); // Para el aviso
            window.location.hash = '#perfil';
            window.location.reload();

        } catch (error) {
            console.error("Error al crear/guardar perfil:", error);
            alert(`Error: ${getFirebaseErrorMessage(error)}`);
            return;
        }
        // --- FIN LÓGICA DE AUTENTICACIÓN Y GUARDADO ---
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
        if (!store.getProfile() || !store.getProfile().eps) {
            openFormModal(tempProfileData); 
        }
    }
}

// --- Función para traducir errores de Firebase (NUEVA) ---
function getFirebaseErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'El correo electrónico no es válido.';
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está en uso.';
        case 'auth/weak-password':
            return 'La contraseña es muy débil (mín. 6 caracteres).';
        default:
            return 'Ocurrió un error. Intenta de nuevo.';
    }
}