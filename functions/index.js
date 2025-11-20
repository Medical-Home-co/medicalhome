/* --- functions/index.js (FINAL - Optimizado para Despliegue v1) --- */

const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { VertexAI } = require("@google-cloud/vertexai");
// Inicializamos CORS para permitir peticiones desde cualquier origen (tu PWA)
const cors = require("cors")({ origin: true });

// Inicialización de Firebase Admin (Global)
initializeApp();

// Configuración de Vertex AI
// Asegúrate de que este ID corresponda a tu proyecto en Google Cloud
const PROJECT_ID = "gen-lang-client-0895489712";
const LOCATION = "us-central1";
const MODEL_NAME = "gemini-1.5-pro-001";

// Variables globales para Lazy Loading (Reutilización de instancias)
let vertex_ai;
let generativeModel;

/**
 * FUNCIÓN 1: Chatbot con Gemini (HTTP v1)
 * Soluciona errores de CORS y Timeout.
 */
exports.geminiChat = functions.https.onRequest((req, res) => {
  // Envolver en CORS para permitir peticiones desde tu web
  return cors(req, res, async () => {
    
    // 1. Validaciones básicas
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido. Usa POST." });
    }
    if (!req.body.history || !req.body.systemInstruction) {
      return res.status(400).json({ error: "Faltan datos: history o systemInstruction." });
    }

    try {
      // 2. Inicialización Perezosa de Vertex AI (Solo si no existe)
      // Esto evita el error "User code failed to load" durante el deploy
      if (!generativeModel) {
        console.log("Inicializando Vertex AI...");
        vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
        generativeModel = vertex_ai.preview.getGenerativeModel({
          model: MODEL_NAME,
        });
      }

      // 3. Preparar el contexto
      const reqHistory = req.body.history;
      const systemInstruction = req.body.systemInstruction;

      // Formatear historial: la API de Google usa 'model' en lugar de 'assistant'
      const contents = reqHistory.map(item => ({
        role: (item.role === 'assistant') ? 'model' : item.role,
        parts: item.parts
      }));

      // Extraer el último mensaje del usuario (el prompt actual)
      // Vertex AI prefiere recibir el historial previo y luego el mensaje nuevo aparte
      const lastMessageObj = contents.pop(); 
      const userMessageText = lastMessageObj.parts[0].text;

      // 4. Iniciar chat
      const chat = generativeModel.startChat({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        history: contents 
      });

      // 5. Enviar mensaje a la IA
      const result = await chat.sendMessage(userMessageText);
      const response = await result.response;
      
      // Verificar si hay respuesta válida
      if (!response.candidates || response.candidates.length === 0) {
          throw new Error("Gemini no devolvió candidatos.");
      }
      
      const text = response.candidates[0].content.parts[0].text;

      // 6. Responder al Frontend
      return res.status(200).json({ response: text });

    } catch (error) {
      console.error("Error crítico en geminiChat:", error);
      return res.status(500).json({ 
        error: "Error interno del servidor de IA.",
        details: error.message 
      });
    }
  });
});

/**
 * FUNCIÓN 2: Notificaciones Programadas (Cron Job v1)
 * Se ejecuta cada 5 minutos para enviar recordatorios.
 */
exports.sendScheduledNotifications = functions.pubsub.schedule("every 5 minutes")
  .onRun(async (context) => {
    const db = getFirestore();
    const messaging = getMessaging();
    const now = new Date();
    // Buscar alarmas en el rango de ahora hasta dentro de 5 minutos
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    console.log(`Cron ejecutado: ${now.toISOString()}. Buscando hasta: ${fiveMinutesFromNow.toISOString()}`);

    try {
      // 1. Buscar alarmas pendientes en Firestore
      const querySnapshot = await db.collectionGroup("alarms")
        .where("status", "==", "pending")
        .where("alarmTime", "<=", fiveMinutesFromNow.toISOString())
        .get();

      if (querySnapshot.empty) {
        console.log("No hay alarmas pendientes.");
        return null;
      }

      console.log(`Procesando ${querySnapshot.size} alarmas.`);

      // 2. Procesar alarmas en paralelo
      const tasks = querySnapshot.docs.map(async (doc) => {
        const alarm = doc.data();
        const alarmRef = doc.ref;

        // Obtener token del usuario (dispositivo)
        let token = "";
        try {
            const tokensSnap = await db.collection(`users/${alarm.userId}/fcmTokens`)
                .orderBy("registeredAt", "desc") // Intentar obtener el más reciente
                .limit(1)
                .get();
                
            if (!tokensSnap.empty) {
                token = tokensSnap.docs[0].id;
            } else {
                console.log(`No hay token para usuario ${alarm.userId}`);
                await alarmRef.update({ status: "failed_no_token" });
                return;
            }
        } catch (e) {
            // Fallback si no existe el índice de fecha
            try {
                 const tokensSnapFallback = await db.collection(`users/${alarm.userId}/fcmTokens`).limit(1).get();
                 if (!tokensSnapFallback.empty) token = tokensSnapFallback.docs[0].id;
            } catch (err2) {
                 console.error(`Error buscando token para ${alarm.userId}:`, e);
                 return;
            }
        }

        if (!token) return;

        // Payload de notificación
        const payload = {
          notification: {
            title: alarm.title || "Recordatorio MedicalHome",
            body: alarm.body || "Tienes una actividad pendiente.",
            // Usar URL absoluta es más seguro para notificaciones web
            icon: "https://medicalhomeapp-1a68b.web.app/images/icons/icon-192x192.png" 
          },
          token: token
        };

        // Enviar
        try {
          await messaging.send(payload);
          await alarmRef.update({ status: "sent", sentAt: new Date() });
          console.log(`Alarma ${alarm.alarmId} enviada.`);
        } catch (sendError) {
          console.error(`Fallo envío a ${token}:`, sendError);
          if (sendError.code === 'messaging/registration-token-not-registered') {
             // Token inválido, lo marcamos para no reintentar
             await alarmRef.update({ status: "failed_invalid_token" });
          }
        }
      });

      await Promise.all(tasks);
      console.log("Ciclo de notificaciones finalizado.");

    } catch (error) {
      console.error("Error fatal en cronjob:", error);
    }
    return null;
  });