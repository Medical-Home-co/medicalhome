/* --- js/pages/asistente.js (Versión Final - Gemini Cloud Function) --- */

let chatHistory = [];
let systemInstruction = "";
let initialGreeting = "";
let currentAssistantKey = "";
let currentPersonalityKey = "";
let assistantSwitcher = null;

// URL de tu Cloud Function (Vertex AI / Gemini)
// Asegúrate de que coincida con la URL desplegada en tu proyecto Firebase
const CLOUD_FUNCTION_URL = "https://us-central1-gen-lang-client-0895489712.cloudfunctions.net/geminiChat";

// ============================================================
// PERSONALIDADES (Diseño Original Intacto)
// ============================================================
const personalities = {
    john: {
        greeting: "Hola, soy John. Estoy aquí para ayudarte con tus consultas generales de salud. ¿Qué te gustaría saber?",
        instruction: "Eres John, un experto en salud. Tu tono es profesional, claro y basado en datos. No das diagnósticos personalizados, solo información general y educativa. Eres parte de la app MedicalHome.",
        imgSrc: "images/john_02.png",
        colorClass: "info-john"
    },
    yari: {
        greeting: "¡Hola! Soy Yari. ¡Podemos hablar de casi cualquier tema! Ciencia, historia, arte, noticias... ¿Qué tienes en mente hoy?",
        instruction: "Eres Yari, una experta en cultura general. Eres amigable, curiosa y entusiasta. Si te preguntan de salud, responde brevemente y sugiere amablemente hablar con John. Eres parte de la app MedicalHome.",
        imgSrc: "images/yari_02.png",
        colorClass: "info-yari"
    },
    danilejo: {
        greeting: "Hola, soy Danilejo. Un espacio para conversar sobre la naturaleza, la paz interior y la espiritualidad. ¿Cómo te sientes hoy?",
        instruction: "Eres Danilejo, un conversador tranquilo y reflexivo. Hablas sobre mindfulness, naturaleza, filosofía de vida y paz interior. Tu tono es calmado y sereno. Eres parte de la app MedicalHome.",
        imgSrc: "images/dani_02.png",
        colorClass: "info-danilejo"
    },
    marian: {
        greeting: "Hola, soy Marian. Estoy aquí para escucharte y ofrecerte un espacio seguro para expresar tus emociones. ¿Qué te gustaría compartir?",
        instruction: "Eres Marian, una consejera empática de apoyo emocional. No eres terapeuta profesional. Tu objetivo es escuchar, validar emociones y ofrecer comprensión y apoyo cálido. Eres parte de la app MedicalHome.",
        imgSrc: "images/marian_02.png",
        colorClass: "info-marian"
    }
};

// ============================================================
// FUNCIONES DE INTERFAZ (Diseño Original Intacto)
// ============================================================
function addMessageToChat(sender, message) {
    const chatWindow = document.getElementById("chat-window");
    if (!chatWindow) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender === "user" ? "user" : "assistant"}-message`;

    // Formateo básico de Markdown (Negrita, Cursiva, Listas)
    let formatted = message
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/^\s*[\*\-]\s+(.*)/gm, "<li>$1</li>"); // Detectar listas
    
    if (formatted.includes("<li>")) {
        formatted = "<ul>" + formatted + "</ul>";
    }

    messageDiv.innerHTML = formatted;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator(show) {
    const chatWindow = document.getElementById("chat-window");
    let indicator = document.getElementById("typing-indicator");
    
    if (show) {
        if (!indicator && chatWindow) {
            indicator = document.createElement("div");
            indicator.id = "typing-indicator";
            indicator.className = "chat-message assistant-message typing-indicator";
            indicator.textContent = "Escribiendo...";
            chatWindow.appendChild(indicator);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    } else {
        indicator?.remove();
    }
}

function saveChatHistory() {
    if (currentAssistantKey) {
        localStorage.setItem(currentAssistantKey, JSON.stringify(chatHistory));
    }
}

// ============================================================
// FUNCIÓN PRINCIPAL - Conexión con Cloud Function (GEMINI)
// ============================================================
async function getAIResponse(userMessage) {
    // 1. Agregar mensaje del usuario al historial local
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
    saveChatHistory();
    showTypingIndicator(true);

    try {
        // 2. Preparar payload para la Cloud Function
        const payload = {
            history: chatHistory, // Enviamos todo el historial para contexto
            systemInstruction: systemInstruction
        };

        // 3. Llamada a la Cloud Function
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.response; // La función devuelve { response: text }

        // 4. Agregar respuesta de la IA al historial local
        chatHistory.push({ role: "model", parts: [{ text: aiMessage }] });
        saveChatHistory();
        showTypingIndicator(false);
        return aiMessage;

    } catch (error) {
        console.error("Error al conectar con el Asistente (Cloud Function):", error);
        showTypingIndicator(false);
        
        const errorMsg = "Lo siento, tengo problemas para conectar con mi servidor en este momento. Por favor, intenta más tarde.";
        // No guardamos el mensaje de error en el historial para no ensuciarlo
        return errorMsg;
    }
}

// ============================================================
// ENVÍO DE MENSAJES (Lógica de Eventos)
// ============================================================
async function handleSendMessage() {
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-chat-btn");
    
    if (!chatInput || !sendBtn) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // UI: Mostrar mensaje usuario
    addMessageToChat("user", message);
    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // Lógica: Obtener respuesta
    const aiResponse = await getAIResponse(message);
    
    // UI: Mostrar respuesta IA
    addMessageToChat("assistant", aiResponse);

    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
}

// ============================================================
// AVATARES Y CONFIGURACIÓN DE INTERFAZ
// ============================================================
function createAssistantSwitcher() {
    if (document.getElementById("assistant-switcher-container")) {
        assistantSwitcher = document.getElementById("assistant-switcher-container");
        return;
    }

    assistantSwitcher = document.createElement("div");
    assistantSwitcher.id = "assistant-switcher-container";
    assistantSwitcher.className = "assistant-switcher";

    for (const key in personalities) {
        const p = personalities[key];
        const img = document.createElement("img");
        img.src = p.imgSrc;
        img.alt = key;
        img.className = "switch-avatar";
        img.title = `Hablar con ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        
        img.addEventListener("click", () => {
            // Cambiar de asistente solo si es diferente al actual
            if (currentPersonalityKey !== key && window.startChat) {
                window.startChat(p, key);
            }
        });
        
        assistantSwitcher.appendChild(img);
    }

    // Insertar switcher en el header de la página
    const header = document.querySelector(".page-header");
    if (header && header.parentNode) {
        header.parentNode.insertBefore(assistantSwitcher, header.nextSibling);
    }
    assistantSwitcher.style.display = "none"; // Oculto por defecto hasta elegir
}

function setActiveAssistantSwitcher(activeKey) {
    if (!assistantSwitcher) return;
    
    const avatars = assistantSwitcher.querySelectorAll(".switch-avatar");
    avatars.forEach(img => {
        const key = img.alt;
        // Limpiar clases activas previas
        img.classList.remove("active-john", "active-yari", "active-danilejo", "active-marian", "grayscale");
        
        if (key === activeKey) {
            // Activar el seleccionado con su color específico
            img.classList.add(`active-${key}`);
        } else {
            // Poner en gris los inactivos
            img.classList.add("grayscale");
        }
    });
}

// ============================================================
// INICIALIZACIÓN (Export para Router)
// ============================================================
export function init() {
    console.log("✅ asistente.js cargado (Conectado a Gemini Cloud Function)");
    
    createAssistantSwitcher();

    const selectorScreen = document.getElementById("personality-selector");
    const chatContainer = document.getElementById("chat-container");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-chat-btn");
    const chatWindow = document.getElementById("chat-window");

    // Resetear vista
    if (chatContainer) chatContainer.style.display = "none";
    if (assistantSwitcher) assistantSwitcher.style.display = "none";
    if (selectorScreen) selectorScreen.style.display = "block";

    // Función global para iniciar chat (usada por botones y switcher)
    window.startChat = (personality, key) => {
        currentAssistantKey = `chatHistory_${key}`;
        currentPersonalityKey = key;
        systemInstruction = personality.instruction;

        // UI: Cambio de pantallas
        if(selectorScreen) selectorScreen.style.display = "none";
        if(chatContainer) chatContainer.style.display = "flex";
        if(assistantSwitcher) assistantSwitcher.style.display = "flex";
        
        // Aplicar tema de color al chat
        if(chatContainer) chatContainer.className = `chat-container chatting-with-${key}`;
        
        // Actualizar avatares
        setActiveAssistantSwitcher(key);

        // Cargar historial
        if(chatWindow) chatWindow.innerHTML = "";
        const saved = localStorage.getItem(currentAssistantKey);
        chatHistory = saved ? JSON.parse(saved) : [];

        if (chatHistory.length === 0) {
            // Saludo inicial si es chat nuevo
            initialGreeting = personality.greeting;
            chatHistory = [{ role: "model", parts: [{ text: initialGreeting }] }];
            addMessageToChat("assistant", initialGreeting);
            saveChatHistory();
        } else {
            // Restaurar historial visual
            chatHistory.forEach(m => {
                const text = m.parts ? m.parts[0].text : m.content; // Compatibilidad hacia atrás
                addMessageToChat(m.role === "user" ? "user" : "assistant", text);
            });
        }

        // Setup de eventos de input
        if(sendBtn) sendBtn.onclick = handleSendMessage;
        if(chatInput) {
            chatInput.onkeydown = e => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            };
            setTimeout(() => chatInput.focus(), 100);
        }
    };

    // Listeners para botones de selección inicial
    document.getElementById("btn-john")?.addEventListener("click", () => window.startChat(personalities.john, "john"));
    document.getElementById("btn-yari")?.addEventListener("click", () => window.startChat(personalities.yari, "yari"));
    document.getElementById("btn-danilejo")?.addEventListener("click", () => window.startChat(personalities.danilejo, "danilejo"));
    document.getElementById("btn-marian")?.addEventListener("click", () => window.startChat(personalities.marian, "marian"));
}