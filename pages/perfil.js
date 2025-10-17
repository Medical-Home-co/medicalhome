import { saveUserProfile, getUserProfile } from '../storage.js';
import { showToast } from '../ui.js';
import { auth } from '../firebase-config.js';

async function populateForm() {
    const profile = await getUserProfile();
    const form = document.getElementById('profile-form');
    if (!form) return;
    
    if(profile) {
        form.elements.fullName.value = profile.fullName || '';
        form.elements.age.value = profile.age || '';
        form.elements.bloodType.value = profile.bloodType || 'Seleccionar';
        form.elements.weight.value = profile.weight || '';
        form.elements.eps.value = profile.eps || '';
        form.elements.emergencyContactName.value = profile.emergencyContactName || '';
        form.elements.emergencyContactPhone.value = profile.emergencyContactPhone || '';
        
        if (profile.conditions && Array.isArray(profile.conditions)) {
            profile.conditions.forEach(condition => {
                const checkbox = form.querySelector(`input[name="conditions"][value="${condition}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const user = auth.currentUser;

    if (!user) {
        showToast('Error: No has iniciado sesión.');
        return;
    }

    const formData = new FormData(form);
    const profileData = {};

    for (let [key, value] of formData.entries()) {
        if (key === 'conditions') {
            if (!profileData[key]) profileData[key] = [];
            profileData[key].push(value);
        } else {
            profileData[key] = value;
        }
    }
    if (!profileData.conditions) {
        profileData.conditions = [];
    }
    
    profileData.email = user.email;

    await saveUserProfile(profileData);
    showToast('Perfil guardado exitosamente');
    window.location.hash = '#dashboard';
}

export function init() {
    const form = document.getElementById('profile-form');
    if (form) form.addEventListener('submit', handleFormSubmit);

    const ageSelect = document.getElementById('age-select');
    if (ageSelect && ageSelect.options.length <= 1) {
        for(let i = 1; i <= 100; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            ageSelect.appendChild(option);
        }
    }
    
    populateForm();
}