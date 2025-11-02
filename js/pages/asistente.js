// --- pages/asistente.js ---

// --- Base de Datos Temporal para la Conversación ---
let chatHistory = [];
let systemInstruction = "";
let initialGreeting = "";
let currentAssistantKey = ""; // Guarda la clave de localStorage (ej: chatHistory_john)
let currentPersonalityKey = ""; // Guarda la clave de personalidad (ej: john)
let assistantSwitcher = null; // Para guardar el contenedor del switcher

// --- INICIO: Constantes para la API ---
// Asegúrate de reemplazar "TU_API_KEY_AQUI" con tu clave real
const apiKey = "AIzaSyBp4pNNeJNCTKP72pVwhlA7HNk9puHdoxs"; // ¡OJO! No expongas claves reales en código público

// ===================================================================
// --- SOLUCIÓN (Item 3): API y Modelo actualizados a versión estable v1
// ===================================================================
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
// ===================================================================


// ===================================================================
// Constantes de Personalidad
// ===================================================================
const personalities = {
    john: {
        greeting: "Hola, soy John. Estoy aquí para ayudarte con tus consultas generales de salud. ¿Qué te gustaría saber?",
        instruction: `Eres John, un experto en salud. Tu tono es profesional, claro y basado en datos.
        1.  **NO ERES MÉDICO:** No puedes diagnosticar, tratar o dar consejo médico personalizado. Deja esto claro si la conversación va en esa dirección.
        2.  **ENFOQUE:** Responde únicamente a preguntas sobre salud general, biología, nutrición, ejercicio, funcionamiento del cuerpo humano y bienestar general.
        3.  **Temas no médicos:** Si te preguntan de otros temas (historia, arte, etc.), responde amablemente que tu especialidad es solo la salud y que pueden reiniciar para hablar con otro asistente más adecuado.
        4.  **Naturalidad:** Evita repetirte y no añadas advertencias genéricas sobre consultar a un médico en cada mensaje (la interfaz ya tiene una advertencia general). Responde siempre en español de Colombia. Sé conciso cuando sea apropiado.`,
        imgSrc: "images/john_02.png", // Imagen para el switcher
        colorClass: "info-john" // Clase para el info-box
    },
    yari: {
        greeting: "¡Hola! Soy Yari. ¡Podemos hablar de casi cualquier tema! Ciencia, historia, arte, noticias... ¿Qué tienes en mente hoy?",
        instruction: `Eres Yari, una experta en cultura general y temas variados. Eres amigable, curiosa y te encanta compartir datos interesantes.
        1.  **NO ERES MÉDICO:** Si te preguntan algo específico de salud, da una respuesta MUY general y breve (1-2 frases), y sugiere amablemente que hablen con John para información más detallada sobre salud.
        2.  **ENFOQUE:** Tus temas son historia, ciencia (no médica profunda), arte, literatura, geografía, noticias actuales (hasta tu última actualización), cultura pop, tecnología, etc.
        3.  **Tono:** Tu tono es casual, entusiasta y conversacional. Usa emojis ocasionalmente si encaja. Responde siempre en español de Colombia.`,
        imgSrc: "images/yari_02.png",
        colorClass: "info-yari"
    },
    danilejo: {
        greeting: "Hola, soy Danilejo. Un espacio para conversar sobre la naturaleza, la paz interior y la espiritualidad. ¿Cómo te sientes hoy?",
        instruction: `Eres Danilejo, un conversador tranquilo, reflexivo y algo poético.
        1.  **ENFOQUE:** Tus temas principales son la naturaleza, la meditación, el mindfulness, la filosofía de vida, la gratitud, la conexión espiritual (no religiosa específica) y la búsqueda de paz interior.
        2.  **Tono:** Eres empático, pausado, usas lenguaje evocador y a veces metafórico. Transmites calma.
        3.  **NO ERES MÉDICO NI TERAPEUTA:** No puedes dar consejos de salud mental específicos, diagnósticos ni tratamientos. Si la conversación sugiere una crisis o angustia profunda, valida el sentimiento brevemente y sugiere amablemente hablar con Marian para apoyo emocional o buscar ayuda profesional externa. Responde siempre en español de Colombia.`,
        imgSrc: "images/dani_02.png",
        colorClass: "info-danilejo"
    },
    marian: {
        greeting: "Hola, soy Marian. Estoy aquí para escucharte y ofrecerte un espacio seguro para expresar tus emociones. ¿Qué te gustaría compartir?",
        instruction: `Eres Marian, una consejera de apoyo emocional empática y compasiva.
        1.  **¡IMPORTANTE!:** NO ERES UNA TERAPEUTA PROFESIONAL. Tu rol es la escucha activa, validar sentimientos, ofrecer frases de ánimo y apoyo general. No puedes dar diagnósticos psicológicos, planes de tratamiento ni consejos médicos.
        2.  **Límites Claros:** Si el usuario expresa ideas de hacerse daño a sí mismo o a otros, menciona estar en una crisis grave, o habla de abuso, debes detener la conversación de apoyo inmediatamente. Indica con calma que no estás equipada para manejar esa situación y proporciona información sobre líneas de ayuda profesional en Colombia (ej: Línea 106 de Salud Mental, Línea Púrpura 155 para mujeres) o sugiere buscar ayuda profesional urgente. No intentes manejar la crisis tú misma.
        3.  **Tono:** Eres muy amable, paciente, reconfortante y sin juicios. Usas frases que validan ("Entiendo que te sientas así", "Es normal sentirse..."). Responde siempre en español de Colombia.`,
        imgSrc: "images/marian_02.png",
        colorClass: "info-marian"
    }
};
// --- FIN: Constantes ---


// --- Funciones de la Interfaz ---
function addMessageToChat(sender, message) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender === 'user' ? 'user' : 'assistant'}-message`;

    // Convertir Markdown básico a HTML (negritas, listas simples)
    let formattedMessage = message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negritas **texto**
        .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Cursivas *texto* (opcional)

    // Convertir listas con '*' o '-'
    formattedMessage = formattedMessage.replace(/^\s*[\*\-]\s+(.*)/gm, '<li>$1</li>');
    formattedMessage = formattedMessage.replace(/<\/li>\n?<li>/g, '</li><li>'); // Limpiar saltos entre LIs
    if (formattedMessage.includes('<li>')) {
        formattedMessage = `<ul>${formattedMessage.replace(/<li>.*<\/li>/gs, (match) => match)}</ul>`.replace(/<\/ul>\n?<ul>/g, ''); // Envolver LIs en UL
    }

    messageDiv.innerHTML = formattedMessage; // Usar innerHTML para el formato
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator(show) {
    const chatWindow = document.getElementById('chat-window');
    let indicator = document.getElementById('typing-indicator');
    if (show) {
        if (!indicator && chatWindow) { // Añadir chequeo de chatWindow
            indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'chat-message assistant-message typing-indicator';
            indicator.textContent = 'Escribiendo...';
            chatWindow.appendChild(indicator);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    } else {
        indicator?.remove(); // Forma más corta de eliminar si existe
    }
}

// --- Funciones de Guardado/Llamada a IA ---
function saveChatHistory() {
    if (currentAssistantKey) {
        try {
            localStorage.setItem(currentAssistantKey, JSON.stringify(chatHistory));
        } catch (error) {
            console.error("Error al guardar historial:", error);
        }
    }
}

async function getAIResponse(userMessage) {
    // Añadir mensaje del usuario al historial local ANTES de la llamada
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    saveChatHistory(); // Guardar el mensaje del usuario inmediatamente

    // ===================================================================
    // --- SOLUCIÓN (Item 3): Formato de payload para v1/gemini-pro
    // ===================================================================
    // El modelo v1 no usa 'systemInstruction'.
    // Debemos insertarlo al principio del array 'contents'.
    const apiContents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: "Entendido. Estoy listo para ayudarte." }] }
    ];

    const payload = {
        // Concatenar la instrucción del sistema con el historial de chat
        contents: apiContents.concat(chatHistory)
        // 'systemInstruction' (eliminado)
    };
    // ===================================================================

    let retries = 0;
    const maxRetries = 3;
    let delay = 1000;

    showTypingIndicator(true); // Mostrar "Escribiendo..."

    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 || response.status >= 500) {
                    console.warn(`API Error ${response.status}. Reintentando...`);
                    throw new Error(`API Error ${response.status}`); // Forzar reintento
                } else {
                    const errorData = await response.json();
                    const errorMessage = errorData?.error?.message || `Error ${response.status}`;
                    console.error("Error no recuperable de API:", errorMessage);
                    const friendlyError = `Lo siento, hubo un problema técnico (${errorMessage}). Verifica tu conexión o inténtalo más tarde.`;
                    
                    chatHistory.push({ role: 'model', parts: [{ text: friendlyError }] });
                    saveChatHistory();
                    showTypingIndicator(false);
                    return friendlyError; // Devolver error al usuario
                }
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];
            let aiMessage = "Lo siento, no pude generar una respuesta en este momento.";

            if (candidate && candidate.content?.parts?.[0]?.text) {
                aiMessage = candidate.content.parts[0].text;
            } else if (candidate?.finishReason === 'SAFETY') {
                aiMessage = "No puedo responder a esa pregunta debido a nuestras políticas de seguridad.";
                console.warn("Respuesta bloqueada por seguridad.");
            } else if (candidate?.finishReason === 'MAX_TOKENS') {
                aiMessage += " (La respuesta fue cortada porque era muy larga)";
                console.warn("Respuesta cortada por MAX_TOKENS.");
            } else {
                console.warn("Respuesta inesperada de la API:", result);
            }

            chatHistory.push({ role: 'model', parts: [{ text: aiMessage }] });
            saveChatHistory();
            showTypingIndicator(false);
            return aiMessage; // Devolver respuesta

        } catch (error) {
            console.error(`Intento ${retries + 1} fallido:`, error);
            retries++;
            if (retries >= maxRetries) {
                const networkError = "Lo siento, estoy teniendo problemas de conexión con el asistente. Por favor, revisa tu internet e inténtalo de nuevo más tarde.";
                chatHistory.push({ role: 'model', parts: [{ text: networkError }] });
                saveChatHistory();
                showTypingIndicator(false);
                return networkError;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    
    showTypingIndicator(false);
    const finalError = "Lo siento, no pude obtener una respuesta después de varios intentos.";
    chatHistory.push({ role: 'model', parts: [{ text: finalError }] });
    saveChatHistory();
    return finalError;
}

// Manejador para enviar mensaje (click o Enter)
const handleSendMessage = async () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    if (!chatInput || !sendBtn) return;

    const message = chatInput.value.trim();

    if (message) {
        addMessageToChat('user', message);
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        chatInput.style.height = 'auto';

        const aiResponse = await getAIResponse(message);

        addMessageToChat('assistant', aiResponse);

        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
};

// --- Funciones del Switcher de Avatares ---
function createAssistantSwitcher() {
    if (document.getElementById('assistant-switcher-container')) {
        assistantSwitcher = document.getElementById('assistant-switcher-container');
        return;
    }

    assistantSwitcher = document.createElement('div');
    assistantSwitcher.id = 'assistant-switcher-container';
    assistantSwitcher.className = 'assistant-switcher';

    for (const key in personalities) {
        const p = personalities[key];
        const img = document.createElement('img');
        img.id = `switch-${key}`;
        img.src = p.imgSrc;
        img.alt = key;
        img.className = 'switch-avatar';
        img.title = `Hablar con ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        img.addEventListener('click', () => {
            if (currentPersonalityKey !== key) {
                if (window.startChat) {
                    window.startChat(p, key);
                }
            }
        });
        assistantSwitcher.appendChild(img);
    }

    const pageHeader = document.querySelector('.page-header');
    if (pageHeader && pageHeader.parentNode) {
        pageHeader.parentNode.insertBefore(assistantSwitcher, pageHeader.nextSibling);
    } else {
        console.error("No se encontró .page-header para insertar el switcher.");
    }

    assistantSwitcher.style.display = 'none';
}

function setActiveAssistantSwitcher(activeKey) {
    if (!assistantSwitcher) return;

    const avatars = assistantSwitcher.querySelectorAll('.switch-avatar');
    avatars.forEach(img => {
        const key = img.alt;

        img.classList.remove('active-john', 'active-yari', 'active-danilejo', 'active-marian');

        if (key === activeKey) {
            img.classList.remove('grayscale');
            img.classList.add(`active-${key}`);
        } else {
            img.classList.add('grayscale');
        }
    });
}

// --- Función Principal (init) ---
export function init() {
    console.log("Cargado js/pages/asistente.js (v8 - Theming y Layout)");
    createAssistantSwitcher();

    const selectorScreen = document.getElementById('personality-selector');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const chatWindow = document.getElementById('chat-window');

    if(chatContainer) chatContainer.style.display = 'none';
    if(assistantSwitcher) assistantSwitcher.style.display = 'none';
    if(selectorScreen) selectorScreen.style.display = 'block';

    // --- Definir startChat como función global ---
    window.startChat = (personality, key) => {
        currentAssistantKey = `chatHistory_${key}`;
        currentPersonalityKey = key;
        systemInstruction = personality.instruction;

        console.log(`Iniciando chat con: ${key}`);

        if(selectorScreen) selectorScreen.style.display = 'none';
        if(chatContainer) chatContainer.style.display = 'flex';
        if(assistantSwitcher) assistantSwitcher.style.display = 'flex';

        if (chatContainer) {
            chatContainer.classList.remove('chatting-with-john', 'chatting-with-yari', 'chatting-with-danilejo', 'chatting-with-marian');
            chatContainer.classList.add(`chatting-with-${key}`);
            console.log(`Clase de tema añadida: chatting-with-${key}`);
        }

        setActiveAssistantSwitcher(key);

        if(chatWindow){
            chatWindow.innerHTML = '';
            const savedHistory = localStorage.getItem(currentAssistantKey);
            if (savedHistory) {
                try {
                    chatHistory = JSON.parse(savedHistory);
                    if (!Array.isArray(chatHistory) || chatHistory.some(m => !m.role || !m.parts)) {
                        console.warn("Historial guardado inválido, iniciando de cero.");
                        chatHistory = [];
                    }
                } catch (e) {
                    console.error("Error parseando historial, iniciando de cero.", e);
                    chatHistory = [];
                }

                if (chatHistory.length > 0) {
                     chatHistory.forEach(message => {
                        const sender = message.role === 'user' ? 'user' : 'assistant';
                        addMessageToChat(sender, message.parts?.[0]?.text || '[Mensaje inválido]');
                    });
                }
            } else {
                 chatHistory = [];
            }

            if (chatHistory.length === 0) {
                initialGreeting = personality.greeting;
                chatHistory = [ { role: 'model', parts: [{ text: initialGreeting }] } ];
                addMessageToChat('assistant', initialGreeting);
                saveChatHistory();
            }

            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        sendBtn?.removeEventListener('click', handleSendMessage);
        chatInput?.removeEventListener('keydown', handleKeydown);
        chatInput?.removeEventListener('input', handleInput);

        sendBtn?.addEventListener('click', handleSendMessage);
        chatInput?.addEventListener('keydown', handleKeydown);
        chatInput?.addEventListener('input', handleInput);

        chatInput?.focus();
    };

    // --- Helper Functions para Listeners ---
    const handleKeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const handleInput = () => {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        chatInput.style.height = 'auto';
        const maxHeight = 150;
        chatInput.style.height = Math.min(chatInput.scrollHeight, maxHeight) + 'px';
    };

    // --- Asignar Listeners a los Botones de Selección Inicial ---
    document.getElementById('btn-john')?.addEventListener('click', () => window.startChat(personalities.john, 'john'));
    document.getElementById('btn-yari')?.addEventListener('click', () => window.startChat(personalities.yari, 'yari'));
    document.getElementById('btn-danilejo')?.addEventListener('click', () => window.startChat(personalities.danilejo, 'danilejo'));
    document.getElementById('btn-marian')?.addEventListener('click', () => window.startChat(personalities.marian, 'marian'));

     const lastActiveAssistant = sessionStorage.getItem('lastActiveAssistant');
     if (lastActiveAssistant && personalities[lastActiveAssistant]) {
         console.log("Restaurando último asistente activo:", lastActiveAssistant);
         setTimeout(() => {
             window.startChat(personalities[lastActiveAssistant], lastActiveAssistant);
         }, 0);
     } else {
         if (selectorScreen) selectorScreen.style.display = 'block';
         if (chatContainer) chatContainer.style.display = 'none';
         if (assistantSwitcher) assistantSwitcher.style.display = 'none';
     }

     window.addEventListener('beforeunload', () => {
         if (currentPersonalityKey) {
             sessionStorage.setItem('lastActiveAssistant', currentPersonalityKey);
         } else {
              sessionStorage.removeItem('lastActiveAssistant');
         }
     });

}