/* --- pages/asistente.js --- */
import { store } from '../store.js'; // Importar store

// --- Función para simular una respuesta del asistente ---
function getAssistantResponse(message) {
    const profile = store.getProfile(); // Leer perfil
    const meds = store.getMeds(); // Leer medicamentos
    
    let response = "No entiendo esa pregunta. Intenta preguntar sobre tu perfil o medicamentos.";
    message = message.toLowerCase();

    if (message.includes("hola") || message.includes("saludos")) {
        const name = profile ? `, ${profile.fullName}` : '';
        response = `¡Hola${name}! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`;
    } 
    else if (message.includes("perfil") || message.includes("nombre")) {
        if (profile) {
            response = `Tu nombre registrado es ${profile.fullName} y tienes ${profile.age} años.`;
        } else {
            response = "Aún no has creado un perfil. Ve a la sección 'Perfil' para empezar.";
        }
    }
    else if (message.includes("medicamentos") || message.includes("medicina")) {
        if (meds.length > 0) {
            response = `Tienes ${meds.length} medicamentos registrados. El primero es ${meds[0].name}. ¿Quieres saber más?`;
        } else {
            response = "No tienes medicamentos registrados. Ve a la sección 'Medicamentos' para añadirlos.";
        }
    }
    else if (message.includes("condiciones")) {
        if (profile && profile.conditions && profile.conditions.length > 0) {
            response = `Según tu perfil, tus condiciones médicas incluyen: ${profile.conditions.join(', ')}.`;
        } else {
            response = "No has registrado ninguna condición médica en tu perfil.";
        }
    }
    
    return response;
}

/* --- Función para añadir mensajes al chat --- */
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('asistente-chat-messages');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`; // 'user' o 'assistant'
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = message;
    
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    
    // Auto-scroll al fondo
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* --- Inyectar Estilos --- */
function injectAsistenteStyles() {
    const styleId = 'asistente-dynamic-styles'; if (document.getElementById(styleId)) return;
    const style = document.createElement('style'); style.id = styleId;
    style.innerHTML = `
        .chat-container { display: flex; flex-direction: column; height: 70vh; max-height: 600px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
        .chat-messages { flex-grow: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .chat-message { display: flex; }
        .chat-message.user { justify-content: flex-end; }
        .chat-message.assistant { justify-content: flex-start; }
        .chat-bubble { max-width: 80%; padding: 0.75rem 1rem; border-radius: 18px; line-height: 1.4; }
        .chat-message.user .chat-bubble { background-color: var(--primary-blue); color: white; border-bottom-right-radius: 4px; }
        .chat-message.assistant .chat-bubble { background-color: var(--bg-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; }
        .chat-input-area { display: flex; gap: 0.5rem; padding: 1rem; border-top: 1px solid var(--border-color); background-color: var(--bg-primary); }
        .chat-input-area .form-input { flex-grow: 1; }
        .chat-input-area .button-primary { flex-shrink: 0; }
    `;
    document.head.appendChild(style);
}

/* --- Función Principal --- */
export function init() {
    console.log("Cargado js/pages/asistente.js (leyendo de store)");
    injectAsistenteStyles();

    const form = document.getElementById('asistente-form');
    const input = document.getElementById('asistente-input');

    if (!form || !input) {
        console.error("Elementos clave de Asistente no encontrados.");
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = input.value.trim();
        if (userMessage === '') return;
        
        // 1. Mostrar mensaje del usuario
        addMessageToChat(userMessage, 'user');
        input.value = ''; // Limpiar input
        
        // 2. Simular respuesta del asistente (leyendo del store)
        setTimeout(() => {
            const assistantMessage = getAssistantResponse(userMessage);
            addMessageToChat(assistantMessage, 'assistant');
        }, 800); // Pequeño retraso para simular respuesta
    });
    
    // Mensaje inicial de bienvenida
    const profile = store.getProfile();
    const name = profile ? `, ${profile.fullName}` : '';
    addMessageToChat(`¡Hola${name}! Soy tu asistente virtual. Pregúntame sobre tu perfil o medicamentos.`, 'assistant');
}