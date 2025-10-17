// --- Constantes y Configuración ---
const API_KEY = ""; // La clave se inyectará en el entorno de ejecución.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
const SYSTEM_INSTRUCTION = `
    Eres "MedicalHome AI", un asistente virtual informativo de salud. Tu propósito es proporcionar información clara y general sobre condiciones médicas, medicamentos y bienestar.
    
    Reglas estrictas que SIEMPRE debes seguir:
    1.  NUNCA proporciones un diagnóstico médico.
    2.  NUNCA crees un plan de tratamiento.
    3.  SIEMPRE, al final de CADA respuesta, sin excepción, incluye el siguiente descargo de responsabilidad en una línea separada y en negrita:
        **"Recuerda: Esta información es solo para fines educativos y no reemplaza el consejo, diagnóstico o tratamiento de un profesional médico."**
    4.  Responde en español.
    5.  Mantén tus respuestas concisas y fáciles de entender para un público no especializado.
`;

// --- Elementos del DOM ---
let chatMessages, aiForm, aiInput, sendBtn;

// --- Funciones de la UI del Chat ---

/**
 * Añade un mensaje a la ventana del chat.
 * @param {string} text - El contenido del mensaje.
 * 'user' o 'ai'
 */
function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    
    // Convertir Markdown simple a HTML (negritas y saltos de línea)
    let htmlContent = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negritas
        .replace(/\n/g, '<br>'); // Saltos de línea

    bubble.innerHTML = `<p>${htmlContent}</p>`;
    
    messageElement.appendChild(bubble);
    chatMessages.appendChild(messageElement);

    // Desplazarse al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Muestra un indicador de que el "AI está escribiendo...".
 */
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.className = 'chat-message ai';
    typingIndicator.innerHTML = `
        <div class="chat-bubble">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Elimina el indicador de "escribiendo...".
 */
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}


// --- Lógica de la API ---

/**
 * Llama a la API de Gemini para obtener una respuesta.
 * @param {string} prompt - La pregunta del usuario.
 */
async function getAIResponse(prompt) {
    showTypingIndicator();
    sendBtn.disabled = true;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        },
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error de la API: ${response.statusText}`);
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiText) {
            addMessage(aiText, 'ai');
        } else {
            addMessage('No he podido procesar esa respuesta. Por favor, intenta con otra pregunta.', 'ai');
        }

    } catch (error) {
        console.error('Error al llamar a la API de Gemini:', error);
        addMessage('Ha ocurrido un error de conexión. Por favor, revisa tu conexión a internet y vuelve a intentarlo.', 'ai');
    } finally {
        hideTypingIndicator();
        sendBtn.disabled = false;
        aiInput.focus();
    }
}


// --- Inicialización ---

/**
 * Manejador para el envío del formulario.
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    const userPrompt = aiInput.value.trim();

    if (userPrompt) {
        addMessage(userPrompt, 'user');
        aiInput.value = '';
        await getAIResponse(userPrompt);
    }
}

export function init() {
    chatMessages = document.getElementById('chat-messages');
    aiForm = document.getElementById('ai-form');
    aiInput = document.getElementById('ai-input');
    sendBtn = document.getElementById('ai-send-btn');
    
    if (aiForm) {
        aiForm.addEventListener('submit', handleFormSubmit);
    }
}