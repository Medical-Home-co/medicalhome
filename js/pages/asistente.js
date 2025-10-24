// --- Base de Datos Temporal para la Conversación ---
let chatHistory = [];

// --- Funciones de la Interfaz ---

function addMessageToChat(sender, message) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.textContent = message;

    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll hacia el final
}

function showTypingIndicator(show) {
    const chatWindow = document.getElementById('chat-window');
    let indicator = document.getElementById('typing-indicator');

    if (show) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'chat-message assistant-message';
            indicator.textContent = 'Escribiendo...';
            chatWindow.appendChild(indicator);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    } else {
        if (indicator) {
            indicator.remove();
        }
    }
}

// --- Simulación de la Llamada a la IA (Firebase Cloud Function) ---
async function getAIResponse(userMessage) {
    // AÑADIR A LA HISTORIA PARA CONTEXTO FUTURO
    chatHistory.push({ role: 'user', text: userMessage });

    // En el futuro, aquí irá la llamada a la Cloud Function:
    // const response = await fetch('URL_DE_TU_CLOUD_FUNCTION', { ... });
    // const data = await response.json();
    // const aiMessage = data.reply;

    // POR AHORA, SIMULAMOS UNA RESPUESTA CON UN RETRASO
    return new Promise(resolve => {
        setTimeout(() => {
            const simulatedResponse = `Has preguntado sobre "${userMessage}". Como asistente virtual, te recuerdo que solo puedo proporcionar información general y no consejo médico. Te recomiendo consultar a un profesional de la salud.`;
            chatHistory.push({ role: 'assistant', text: simulatedResponse });
            resolve(simulatedResponse);
        }, 2000);
    });
}


// --- Función Principal ---
export function init() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');

    const handleSendMessage = async () => {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToChat('user', message);
            chatInput.value = '';
            chatInput.style.height = 'auto'; // Resetear altura del textarea

            showTypingIndicator(true);

            const aiResponse = await getAIResponse(message);

            showTypingIndicator(false);
            addMessageToChat('assistant', aiResponse);
        }
    };
    
    sendBtn?.addEventListener('click', handleSendMessage);
    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Auto-ajustar altura del textarea
    chatInput?.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });
    
    // Inicializar historial de la sesión
    chatHistory = [{
        role: 'assistant',
        text: 'Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
    }];
}
