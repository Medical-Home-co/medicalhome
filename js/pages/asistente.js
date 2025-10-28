// --- Base de Datos Temporal para la Conversación ---
let chatHistory = [];
let systemInstruction = ""; 
let initialGreeting = "";
let currentAssistantKey = ""; 
let assistantSwitcher = null; // Para guardar el contenedor del switcher

// --- INICIO: Constantes para la API ---
const apiKey = "AIzaSyBp4pNNeJNCTKP72pVwhlA7HNk9puHdoxs"; 
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// ===================================================================
// Constantes de Personalidad (Sin cambios)
// ===================================================================
const personalities = {
    john: {
        greeting: "Hola, soy John. Estoy aquí para ayudarte con tus consultas generales de salud. ¿Qué te gustaría saber?",
        instruction: `Eres John, un experto en salud. Tu tono es profesional, claro y basado en datos.
        1.  **NO ERES MÉDICO:** No puedes diagnosticar, tratar o dar consejo médico personalizado.
        2.  **ENFOQUE:** Responde únicamente a preguntas sobre salud, biología, nutrición y bienestar general.
        3.  **Temas no médicos:** Si te preguntan de otros temas, responde amablemente que tu especialidad es solo la salud y que pueden reiniciar para hablar con otro asistente.
        4.  **Naturalidad:** Evita repetirte y no añadas advertencias en cada mensaje (la interfaz ya la tiene). Responde en español.`,
        imgSrc: "images/john_02.png", 
        colorClass: "info-john" 
    },
    yari: {
        greeting: "¡Hola! Soy Yari. ¡Podemos hablar de casi cualquier tema! ¿Qué tienes en mente hoy?",
        instruction: `Eres Yari, una experta en cultura y temas generales. Eres amigable, curiosa y te encanta hablar de historia, ciencia, arte, noticias y cultura pop.
        1.  **NO ERES MÉDICO:** Si te preguntan algo de salud, da una respuesta MUY general y breve, y sugiere que hablen con John para más detalles.
        2.  **Tono:** Tu tono es casual, entusiasta y conversacional. Responde en español.`,
        imgSrc: "images/yari_02.png", 
        colorClass: "info-yari"
    },
    danilejo: {
        greeting: "Hola, soy Danilejo. Estoy aquí para conversar sobre la naturaleza, la paz interior y la espiritualidad. ¿Cómo te sientes hoy?",
        instruction: `Eres Danilejo, un conversador tranquilo y reflexivo.
        1.  **ENFOQUE:** Tus temas son la naturaleza, la meditación, el mindfulness, la espiritualidad (no religiosa) y la filosofía de vida.
        2.  **Tono:** Eres empático, pausado y poético.
        3.  **NO ERES MÉDICO NI TERAPEUTA:** No puedes dar consejos de salud mental ni diagnósticos. Si la conversación se vuelve muy oscura, sugiere amablemente hablar con Marian o un profesional. Responde en español.`,
        imgSrc: "images/dani_02.png", 
        colorClass: "info-danilejo"
    },
    marian: {
        greeting: "Hola, soy Marian. Estoy aquí para escucharte y ofrecerte apoyo emocional. ¿Qué te gustaría compartir?",
        instruction: `Eres Marian, una consejera emocional empática.
        1.  **¡IMPORTANTE!:** NO ERES UNA TERAPEUTA. No puedes dar diagnósticos psicológicos ni planes de tratamiento. Tu rol es escuchar activamente, validar sentimientos y ofrecer apoyo general y frases de ánimo.
        2.  **Límites:** Si el usuario expresa ideas de hacerse daño o está en crisis, debes detener la conversación de apoyo y proporcionar recursos de líneas de ayuda profesional (busca números de ayuda genéricos si es necesario).
        3.  **Tono:** Eres muy amable, paciente y reconfortante. Responde en español.`,
        imgSrc: "images/marian_02.png", 
        colorClass: "info-marian"
    }
};
// --- FIN: Constantes ---


// --- Funciones de la Interfaz (Sin cambios) ---
function addMessageToChat(sender, message) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender === 'user' ? 'user' : 'assistant'}-message`;
    messageDiv.textContent = message;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight; 
}

function showTypingIndicator(show) {
    const chatWindow = document.getElementById('chat-window');
    let indicator = document.getElementById('typing-indicator');
    if (show) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'chat-message assistant-message typing-indicator'; 
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

// --- Funciones de Guardado/Llamada a IA (Sin cambios) ---
function saveChatHistory() {
    if (currentAssistantKey) {
        localStorage.setItem(currentAssistantKey, JSON.stringify(chatHistory));
        console.log(`Historial guardado en ${currentAssistantKey}`);
    }
}

async function getAIResponse(userMessage) {
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    saveChatHistory();
    const payload = { contents: chatHistory, systemInstruction: { parts: [{ text: systemInstruction }] } };
    let retries = 0; const maxRetries = 3; let delay = 1000; 
    while (retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                if (response.status === 429 || response.status >= 500) { throw new Error(`API Error ${response.status}`); }
                else { const errorData = await response.json(); const errorMessage = errorData?.error?.message || `Error ${response.status}`; const friendlyError = `Lo siento, hubo un problema al procesar tu solicitud (${errorMessage}). Por favor, intenta de nuevo más tarde.`; chatHistory.push({ role: 'model', parts: [{ text: friendlyError }] }); saveChatHistory(); return friendlyError; }
            }
            const result = await response.json();
            const candidate = result.candidates?.[0];
            let aiMessage = "Lo siento, no pude generar una respuesta."; 
            if (candidate && candidate.content?.parts?.[0]?.text) { aiMessage = candidate.content.parts[0].text; }
            else if (candidate?.finishReason === 'SAFETY') { aiMessage = "No puedo responder a esa pregunta debido a nuestras políticas de seguridad."; }
            chatHistory.push({ role: 'model', parts: [{ text: aiMessage }] });
            saveChatHistory();
            return aiMessage; 
        } catch (error) {
            console.error(`Intento ${retries + 1} fallido:`, error); retries++;
            if (retries >= maxRetries) { const networkError = "Lo siento, estoy teniendo problemas de conexión. Por favor, intenta de nuevo más tarde."; chatHistory.push({ role: 'model', parts: [{ text: networkError }] }); saveChatHistory(); return networkError; }
            await new Promise(resolve => setTimeout(resolve, delay)); delay *= 2; 
        }
    }
    const finalError = "Lo siento, no pude obtener una respuesta después de varios intentos.";
    chatHistory.push({ role: 'model', parts: [{ text: finalError }] });
    saveChatHistory();
    return finalError;
}

const handleSendMessage = async () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    if (!chatInput) return;
    const message = chatInput.value.trim();
    if (message) {
        addMessageToChat('user', message);
        chatInput.value = '';
        chatInput.disabled = true; sendBtn.disabled = true;  
        chatInput.style.height = 'auto'; 
        showTypingIndicator(true);
        const aiResponse = await getAIResponse(message);
        showTypingIndicator(false);
        addMessageToChat('assistant', aiResponse);
        chatInput.disabled = false; sendBtn.disabled = false;  
        chatInput.focus(); 
    }
};

// ===================================================================
// --- FUNCIONES SWITCHER (createAssistantSwitcher sin cambios) ---
// ===================================================================

function createAssistantSwitcher() {
    if (document.getElementById('assistant-switcher-container')) return;
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
        img.addEventListener('click', () => {
            if (currentAssistantKey !== `chatHistory_${key}`) {
                startChat(p, key); // Llama a startChat global
            }
        });
        assistantSwitcher.appendChild(img);
    }
    const pageHeader = document.querySelector('.page-header');
    // CORRECCIÓN: Usar insertBefore para ponerlo ANTES del <br>
    const lineBreak = pageHeader.nextElementSibling; // El <br>
    pageHeader.parentNode.insertBefore(assistantSwitcher, lineBreak); 
    assistantSwitcher.style.display = 'none';
}


/**
 * Actualiza la UI del switcher:
 * - Pone el activo a color y le añade la clase 'active-[key]'.
 * - Pone los demás en escala de grises y les quita la clase 'active-*'.
 */
function setActiveAssistantSwitcher(activeKey) {
    if (!assistantSwitcher) return;
    
    const avatars = assistantSwitcher.querySelectorAll('.switch-avatar');
    avatars.forEach(img => {
        const key = img.alt; // Obtenemos la key (john, yari, etc.) del alt
        
        // Limpiar clases activas de todos
        img.classList.remove('active-john', 'active-yari', 'active-danilejo', 'active-marian');

        if (key === activeKey) {
            img.classList.remove('grayscale');
            img.classList.add(`active-${key}`); // Añadir la clase específica
        } else {
            img.classList.add('grayscale');
            // img.classList.remove(`active-${key}`); // Ya se limpiaron arriba
        }
    });
}

// ===================================================================
// ¡FUNCIÓN INIT MODIFICADA!
// ===================================================================
export function init() {
    createAssistantSwitcher();
    const selectorScreen = document.getElementById('personality-selector');
    const btnJohn = document.getElementById('btn-john');
    const btnYari = document.getElementById('btn-yari');
    const btnDanilejo = document.getElementById('btn-danilejo');
    const btnMarian = document.getElementById('btn-marian');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const chatWindow = document.getElementById('chat-window');

    if(chatContainer) chatContainer.style.display = 'none';
    if(assistantSwitcher) assistantSwitcher.style.display = 'none';

    // ¡IMPORTANTE! Hacer startChat global para que los avatares puedan llamarla
    window.startChat = (personality, key) => {
        currentAssistantKey = `chatHistory_${key}`; 
        systemInstruction = personality.instruction;

        if(selectorScreen) selectorScreen.style.display = 'none';
        if(chatContainer) chatContainer.style.display = 'flex'; 
        if(assistantSwitcher) assistantSwitcher.style.display = 'flex'; 

        setActiveAssistantSwitcher(key); // ¡LLAMADA CLAVE!

        if(chatWindow){
            chatWindow.innerHTML = ''; 
            const savedHistory = localStorage.getItem(currentAssistantKey);
            if (savedHistory) {
                chatHistory = JSON.parse(savedHistory);
                chatHistory.forEach(message => {
                    const sender = message.role === 'user' ? 'user' : 'assistant';
                    addMessageToChat(sender, message.parts[0].text);
                });
            } else {
                initialGreeting = personality.greeting;
                chatHistory = [ { role: 'model', parts: [{ text: initialGreeting }] } ];
                addMessageToChat('assistant', initialGreeting);
                saveChatHistory(); 
            }
        }
        
        sendBtn?.removeEventListener('click', handleSendMessage);
        chatInput?.removeEventListener('keydown', handleKeydown);
        chatInput?.removeEventListener('input', handleInput);
        
        sendBtn?.addEventListener('click', handleSendMessage);
        chatInput?.addEventListener('keydown', handleKeydown);
        chatInput?.addEventListener('input', handleInput);

        chatInput?.focus();
    };
    
    const handleKeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };
    const handleInput = () => {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        chatInput.style.height = 'auto'; chatInput.style.height = (chatInput.scrollHeight) + 'px';
    };

    btnJohn?.addEventListener('click', () => window.startChat(personalities.john, 'john'));
    btnYari?.addEventListener('click', () => window.startChat(personalities.yari, 'yari'));
    btnDanilejo?.addEventListener('click', () => window.startChat(personalities.danilejo, 'danilejo'));
    btnMarian?.addEventListener('click', () => window.startChat(personalities.marian, 'marian'));
}