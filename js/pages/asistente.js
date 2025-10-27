// --- Base de Datos Temporal para la Conversación ---
let chatHistory = [];
let systemInstruction = ""; 
let initialGreeting = "";
// ¡NUEVO! Esta variable rastreará qué historial guardar/cargar
let currentAssistantKey = ""; 

// --- INICIO: Constantes para la API ---

// Pega tu API Key de Google AI Studio aquí
const apiKey = "AIzaSyBp4pNNeJNCTKP72pVwhlA7HNk9puHdoxs"; 

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// ===================================================================
// Constantes de Personalidad (Rutas ya corregidas)
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
    // Usamos 'user' y 'model' (asistente) para que coincida con el historial
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

// --- ¡NUEVA FUNCIÓN PARA GUARDAR EL HISTORIAL! ---
function saveChatHistory() {
    if (currentAssistantKey) {
        localStorage.setItem(currentAssistantKey, JSON.stringify(chatHistory));
        console.log(`Historial guardado en ${currentAssistantKey}`);
    }
}

// --- Llamada REAL a la IA (Modificada para guardar historial) ---
async function getAIResponse(userMessage) {
    // 1. Añadir mensaje del usuario al historial para la API
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    // 2. ¡GUARDAR!
    saveChatHistory();

    // Construir el payload para la API
    const payload = {
        contents: chatHistory, 
        systemInstruction: { 
            parts: [{ text: systemInstruction }] 
        },
    };

    let retries = 0;
    const maxRetries = 3;
    let delay = 1000; 

    while (retries < maxRetries) {
        try {
            console.log("Enviando a Gemini:", JSON.stringify(payload)); 
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 || response.status >= 500) {
                     throw new Error(`API Error ${response.status}`);
                } else {
                    const errorData = await response.json();
                    console.error("Error de API (no reintento):", errorData);
                    const errorMessage = errorData?.error?.message || `Error ${response.status}`;
                     const friendlyError = `Lo siento, hubo un problema al procesar tu solicitud (${errorMessage}). Por favor, intenta de nuevo más tarde.`;
                     // 3. Añadir error al historial
                     chatHistory.push({ role: 'model', parts: [{ text: friendlyError }] });
                     // 4. ¡GUARDAR!
                     saveChatHistory();
                    return friendlyError;
                }
            }

            const result = await response.json();
            console.log("Respuesta de Gemini:", JSON.stringify(result)); 

            const candidate = result.candidates?.[0];
            let aiMessage = "Lo siento, no pude generar una respuesta."; 

            if (candidate && candidate.content?.parts?.[0]?.text) {
                aiMessage = candidate.content.parts[0].text;
            } else if (candidate?.finishReason === 'SAFETY') {
                 aiMessage = "No puedo responder a esa pregunta debido a nuestras políticas de seguridad.";
            } else {
                 console.error("Respuesta inesperada de la API:", result);
            }

            // 5. Añadir respuesta de la IA al historial
            chatHistory.push({ role: 'model', parts: [{ text: aiMessage }] });
            // 6. ¡GUARDAR!
            saveChatHistory();
            return aiMessage; 

        } catch (error) {
            console.error(`Intento ${retries + 1} fallido:`, error);
            retries++;
            if (retries >= maxRetries) {
                const networkError = "Lo siento, estoy teniendo problemas de conexión. Por favor, intenta de nuevo más tarde.";
                // 7. Añadir error de red al historial
                chatHistory.push({ role: 'model', parts: [{ text: networkError }] });
                // 8. ¡GUARDAR!
                saveChatHistory();
                return networkError;
            }
             await new Promise(resolve => setTimeout(resolve, delay));
             delay *= 2; 
        }
    }
     const finalError = "Lo siento, no pude obtener una respuesta después de varios intentos.";
     // 9. Añadir error final al historial
     chatHistory.push({ role: 'model', parts: [{ text: finalError }] });
     // 10. ¡GUARDAR!
     saveChatHistory();
     return finalError;
}

// --- Función Principal de Envío (Sin cambios) ---
const handleSendMessage = async () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (message) {
        addMessageToChat('user', message);
        chatInput.value = '';
        chatInput.disabled = true; 
        sendBtn.disabled = true;  
        chatInput.style.height = 'auto'; 

        showTypingIndicator(true);

        // getAIResponse AHORA se encarga de guardar
        // el mensaje del usuario y la respuesta de la IA
        const aiResponse = await getAIResponse(message);

        showTypingIndicator(false);
        addMessageToChat('assistant', aiResponse);

        chatInput.disabled = false; 
        sendBtn.disabled = false;  
        chatInput.focus(); 
    }
};


// ===================================================================
// ¡FUNCIÓN INIT MODIFICADA!
// ===================================================================
export function init() {
    // Obtener elementos de la PANTALLA DE SELECCIÓN
    const selectorScreen = document.getElementById('personality-selector');
    const btnJohn = document.getElementById('btn-john');
    const btnYari = document.getElementById('btn-yari');
    const btnDanilejo = document.getElementById('btn-danilejo');
    const btnMarian = document.getElementById('btn-marian');

    // Obtener elementos de la PANTALLA DE CHAT
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat-btn');
    const chatWindow = document.getElementById('chat-window');

    // Obtener elementos del INFO-BOX
    const infoBox = document.getElementById('info-box');
    const infoImg = document.getElementById('info-box-img');
    const infoText = document.getElementById('info-box-text');

    // Asegurarse de que el chat esté oculto al inicio
    if(chatContainer) chatContainer.style.display = 'none';

    // Función que se llamará al elegir una personalidad
    // ¡MODIFICADO! Ahora acepta una "key" (ej: "john")
    const startChat = (personality, key) => {
        // 1. Establecer las variables globales
        currentAssistantKey = `chatHistory_${key}`; // ej: "chatHistory_john"
        systemInstruction = personality.instruction;

        // 2. Ocultar el selector y mostrar el chat
        if(selectorScreen) selectorScreen.style.display = 'none';
        if(chatContainer) chatContainer.style.display = 'flex'; 

        // 3. --- ¡LÓGICA DE CARGA DE HISTORIAL! ---
        if(chatWindow){
            chatWindow.innerHTML = ''; // Limpiar chat para recargar
            const savedHistory = localStorage.getItem(currentAssistantKey);

            if (savedHistory) {
                // Si hay historial, cárgalo
                console.log(`Historial encontrado para ${currentAssistantKey}, cargando...`);
                chatHistory = JSON.parse(savedHistory);
                // Volver a dibujar el chat guardado
                chatHistory.forEach(message => {
                    // message.role es 'user' o 'model'
                    // addMessageToChat espera 'user' o 'assistant'
                    const sender = message.role === 'user' ? 'user' : 'assistant';
                    addMessageToChat(sender, message.parts[0].text);
                });
            } else {
                // Si NO hay historial, usa el saludo inicial
                console.log(`No hay historial para ${currentAssistantKey}, creando uno nuevo.`);
                initialGreeting = personality.greeting;
                chatHistory = [
                    { role: 'model', parts: [{ text: initialGreeting }] }
                ];
                addMessageToChat('assistant', initialGreeting);
                saveChatHistory(); // Guarda el saludo inicial
            }
        }
        
        // 4. --- Actualizar el Info-Box ---
        if (infoBox && infoImg) {
            infoImg.src = personality.imgSrc;
            infoImg.style.display = 'block';
            infoBox.classList.remove('info-john', 'info-yari', 'info-danilejo', 'info-marian');
            infoBox.classList.add(personality.colorClass);
        }

        // 5. Añadir los event listeners del chat
        sendBtn?.addEventListener('click', handleSendMessage);
        chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // Auto-ajustar altura del textarea
        chatInput?.addEventListener('input', () => {
            if (!chatInput) return;
            chatInput.style.height = 'auto';
            chatInput.style.height = (chatInput.scrollHeight) + 'px';
        });

        // 6. Poner foco en el input del chat
        chatInput?.focus();
    };

    // Asignar los clics de los botones de personalidad
    // ¡MODIFICADO! Pasa la clave de texto para el localStorage
    btnJohn?.addEventListener('click', () => startChat(personalities.john, 'john'));
    btnYari?.addEventListener('click', () => startChat(personalities.yari, 'yari'));
    btnDanilejo?.addEventListener('click', () => startChat(personalities.danilejo, 'danilejo'));
    btnMarian?.addEventListener('click', () => startChat(personalities.marian, 'marian'));
}