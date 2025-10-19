// js/perfil.js

// Esta función se llamará desde main.js cuando se cargue la página
export function init() {
    console.log("Cargado js/perfil.js");

    const ageSelect = document.getElementById('age');
    if (ageSelect && ageSelect.options.length <= 1) {
        for(let i = 1; i <= 100; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            ageSelect.appendChild(option);
        }
    }

    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // FASE 2: Aquí irá la lógica de guardado
            console.log('Formulario enviado (aún no se guarda)');
            alert('Perfil guardado (simulación). Regresando al Dashboard.');
            window.location.hash = '#dashboard';
        });
    }
    
    // Lógica simple para agregar alergias (visual)
    const addAlergiaBtn = document.getElementById('add-alergia-btn');
    const alergiaInput = document.getElementById('alergias-input');
    const alergiaList = document.getElementById('alergias-list');
    
    if (addAlergiaBtn) {
        addAlergiaBtn.addEventListener('click', () => {
            const alergia = alergiaInput.value.trim();
            if (alergia) {
                const tag = document.createElement('span');
                tag.className = 'alergia-tag'; // (Deberíamos agregar un estilo para .alergia-tag en style.css)
                tag.textContent = alergia;
                alergiaList.appendChild(tag);
                alergiaInput.value = '';
            }
        });
    }
}