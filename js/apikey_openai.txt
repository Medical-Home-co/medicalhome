/* =========================================================
Asistente Virtual - Integración OpenAI GPT-4o-mini
Versión final compatible con router modular (main.js)
========================================================= */

let chatHistory = [];
let systemInstruction = "";
let initialGreeting = "";
let currentAssistantKey = "";
let currentPersonalityKey = "";
let assistantSwitcher = null;

// ============================================================
// CONFIGURACIÓN OPENAI
// ============================================================
const apiKey = "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"; // ⬅️ Reemplázala con tu clave real
const apiUrl = "[https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)";
const model = "gpt-4o-mini"; // o "gpt-4-turbo" si prefieres más capacidad

// ============================================================
// PERSONALIDADES
// ============================================================
const personalities = {
john: {
greeting: "Hola, soy John. Estoy aquí para ayudarte con tus consultas generales de salud. ¿Qué te gustaría saber?",
instruction: "Eres John, un experto en salud. Tu tono es profesional, claro y basado en datos. No das diagnósticos personalizados.",
imgSrc: "images/john_02.png",
colorClass: "info-john"
},
yari: {
greeting: "¡Hola! Soy Yari. ¡Podemos hablar de casi cualquier tema! Ciencia, historia, arte, noticias... ¿Qué tienes en mente hoy?",
instruction: "Eres Yari, una experta en cultura general. Eres amigable y curiosa. Si te preguntan de salud, responde brevemente y sugiere hablar con John.",
imgSrc: "images/yari_02.png",
colorClass: "info-yari"
},
danilejo: {
greeting: "Hola, soy Danilejo. Un espacio para conversar sobre la naturaleza, la paz interior y la espiritualidad. ¿Cómo te sientes hoy?",
instruction: "Eres Danilejo, un conversador tranquilo y reflexivo. Hablas sobre mindfulness, naturaleza y filosofía de vida.",
imgSrc: "images/dani_02.png",
colorClass: "info-danilejo"
},
marian: {
greeting: "Hola, soy Marian. Estoy aquí para escucharte y ofrecerte un espacio seguro para expresar tus emociones. ¿Qué te gustaría compartir?",
instruction: "Eres Marian, una consejera empática de apoyo emocional. No eres terapeuta profesional. Validar emociones, ofrecer comprensión y apoyo general.",
imgSrc: "images/marian_02.png",
colorClass: "info-marian"
}
};

// ============================================================
// FUNCIONES DE INTERFAZ
// ============================================================
function addMessageToChat(sender, message) {
const chatWindow = document.getElementById("chat-window");
if (!chatWindow) return;

```
const messageDiv = document.createElement("div");
messageDiv.className = `chat-message ${sender === "user" ? "user" : "assistant"}-message`;

let formatted = message
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^\s*[\*\-]\s+(.*)/gm, "<li>$1</li>");
if (formatted.includes("<li>")) formatted = "<ul>" + formatted + "</ul>";

messageDiv.innerHTML = formatted;
chatWindow.appendChild(messageDiv);
chatWindow.scrollTop = chatWindow.scrollHeight;
```

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
if (currentAssistantKey)
localStorage.setItem(currentAssistantKey, JSON.stringify(chatHistory));
}

// ============================================================
// FUNCIÓN PRINCIPAL - Conexión con OpenAI
// ============================================================
async function getAIResponse(userMessage) {
chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
saveChatHistory();
showTypingIndicator(true);

```
const payload = {
    model,
    messages: [
        { role: "system", content: systemInstruction },
        ...chatHistory.map(m => {
            const role = m.role === "model" ? "assistant" : m.role;
            const content = m.parts ? m.parts[0].text : m.content;
            return { role, content };
        })
    ]
};

try {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `Error ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    chatHistory.push({ role: "model", parts: [{ text: aiMessage }] });
    saveChatHistory();
    showTypingIndicator(false);
    return aiMessage;

} catch (error) {
    console.error("Error OpenAI:", error);
    showTypingIndicator(false);
    const msg = "Lo siento, hubo un problema al conectar con el asistente. Intenta más tarde.";
    chatHistory.push({ role: "model", parts: [{ text: msg }] });
    saveChatHistory();
    return msg;
}
```

}

// ============================================================
// ENVÍO DE MENSAJES
// ============================================================
async function handleSendMessage() {
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-chat-btn");
if (!chatInput || !sendBtn) return;

```
const message = chatInput.value.trim();
if (!message) return;

addMessageToChat("user", message);
chatInput.value = "";
chatInput.disabled = true;
sendBtn.disabled = true;

const aiResponse = await getAIResponse(message);
addMessageToChat("assistant", aiResponse);

chatInput.disabled = false;
sendBtn.disabled = false;
chatInput.focus();
```

}

// ============================================================
// AVATARES Y CONFIGURACIÓN
// ============================================================
function createAssistantSwitcher() {
if (document.getElementById("assistant-switcher-container")) {
assistantSwitcher = document.getElementById("assistant-switcher-container");
return;
}

```
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
        if (currentPersonalityKey !== key && window.startChat)
            window.startChat(p, key);
    });
    assistantSwitcher.appendChild(img);
}

const header = document.querySelector(".page-header");
header?.parentNode.insertBefore(assistantSwitcher, header.nextSibling);
assistantSwitcher.style.display = "none";
```

}

function setActiveAssistantSwitcher(activeKey) {
if (!assistantSwitcher) return;
const avatars = assistantSwitcher.querySelectorAll(".switch-avatar");
avatars.forEach(img => {
const key = img.alt;
img.classList.remove("active-john", "active-yari", "active-danilejo", "active-marian");
if (key === activeKey) img.classList.add(`active-${key}`);
else img.classList.add("grayscale");
});
}

// ============================================================
// INICIALIZACIÓN (módulo para main.js)
// ============================================================
export function init() {
console.log("✅ asistente.js inicializado correctamente");
createAssistantSwitcher();

```
const selectorScreen = document.getElementById("personality-selector");
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-chat-btn");
const chatWindow = document.getElementById("chat-window");

if (chatContainer) chatContainer.style.display = "none";
if (assistantSwitcher) assistantSwitcher.style.display = "none";
if (selectorScreen) selectorScreen.style.display = "block";

window.startChat = (personality, key) => {
    currentAssistantKey = `chatHistory_${key}`;
    currentPersonalityKey = key;
    systemInstruction = personality.instruction;

    selectorScreen.style.display = "none";
    chatContainer.style.display = "flex";
    assistantSwitcher.style.display = "flex";
    chatContainer.className = `chat-container chatting-with-${key}`;
    setActiveAssistantSwitcher(key);

    chatWindow.innerHTML = "";
    const saved = localStorage.getItem(currentAssistantKey);
    chatHistory = saved ? JSON.parse(saved) : [];

    if (chatHistory.length === 0) {
        initialGreeting = personality.greeting;
        chatHistory = [{ role: "model", parts: [{ text: initialGreeting }] }];
        addMessageToChat("assistant", initialGreeting);
        saveChatHistory();
    } else {
        chatHistory.forEach(m =>
            addMessageToChat(m.role === "user" ? "user" : "assistant", m.parts?.[0]?.text)
        );
    }

    sendBtn.onclick = handleSendMessage;
    chatInput.onkeydown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
};

document.getElementById("btn-john")?.addEventListener("click", () => window.startChat(personalities.john, "john"));
document.getElementById("btn-yari")?.addEventListener("click", () => window.startChat(personalities.yari, "yari"));
document.getElementById("btn-danilejo")?.addEventListener("click", () => window.startChat(personalities.danilejo, "danilejo"));
document.getElementById("btn-marian")?.addEventListener("click", () => window.startChat(personalities.marian, "marian"));
```

}
