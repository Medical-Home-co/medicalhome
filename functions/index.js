/* --- functions/index.js (CORREGIDO - TODO EN 1a GEN) --- */

// --- Importaciones de Firebase (TODO v1) ---
const functions = require("firebase-functions"); 
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getMessaging} = require("firebase-admin/messaging");

// --- Importaciones para el Chatbot ---
const { VertexAI } = require("@google-cloud/vertexai");
const cors = require("cors")({ origin: true }); // v1 usa 'cors' así

// --- Inicialización (se llama UNA SOLA VEZ) ---
initializeApp();

// --- Configuración de Vertex AI (Solo constantes) ---
const PROJECT_ID = "gen-lang-client-0895489712"; 
const LOCATION = "us-central1"; 
const MODEL_NAME = "gemini-1.5-pro-001"; 

// --- Variables Globales (SIN INICIALIZAR) ---
let vertex_ai;
let generativeModel;


// ================================================================
// FUNCIÓN 1: Chatbot (EN SINTAXIS v1)
// ================================================================
exports.geminiChat = functions.https.onRequest((request, response) => {
  // v1 maneja CORS de esta forma
  cors(request, response, async () => {
    
    // --- Carga Perezosa de Vertex AI ---
    if (!generativeModel) {
      console.log("Inicializando Vertex AI por primera vez...");
      try {
        vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
        generativeModel = vertex_ai.preview.getGenerativeModel({
          model: MODEL_NAME,
        });
        console.log("Vertex AI inicializado.");
      } catch (initError) {
        console.error("Error FATAL inicializando Vertex AI:", initError);
        return response.status(500).json({ error: "No se pudo inicializar el modelo de IA." });
      }
    }
    // --- Fin Carga Perezosa ---

    // --- 1. Validar la solicitud ---
    if (request.method !== "POST") {
      return response.status(405).json({ error: "Method Not Allowed" });
    }
    if (!request.body.history || !request.body.systemInstruction) {
      return response.status(400).json({ error: "Invalid request: 'history' and 'systemInstruction' are required." });
    }

    try {
      const reqHistory = request.body.history;
      const systemInstruction = request.body.systemInstruction;

      // --- 2. Formatear el historial para Vertex AI ---
      const contents = reqHistory.map(item => {
        const role = (item.role === 'assistant') ? 'model' : item.role;
        return {
          role: role,
          parts: item.parts
        };
      });

      // --- 3. Iniciar el chat con Vertex AI ---
      const chat = generativeModel.startChat({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        history: contents.slice(0, -1) // Historial sin el último mensaje
      });

      // --- 4. Enviar el último mensaje del usuario ---
      const lastUserMessage = contents[contents.length - 1].parts[0].text;
      const result = await chat.sendMessage(lastUserMessage);

      // --- 5. Obtener y devolver la respuesta ---
      const aiResponse = result.response.candidates[0].content.parts[0].text;
      
      return response.status(200).json({ response: aiResponse });

    } catch (error) {
      console.error("Error en la función de Vertex AI:", error);
      return response.status(500).json({ error: "Error interno del servidor al contactar Gemini." });
    }
  }); // Fin del wrapper de CORS
});


// ================================================================
// FUNCIÓN 2: Notificaciones Programadas (REVERTIDA A SINTAXIS v1)
// ================================================================
exports.sendScheduledNotifications = functions.pubsub.schedule("every 5 minutes")
  .onRun(async (context) => { // 'onRun' y 'context' en lugar de 'onSchedule' y 'event'
    
    const db = getFirestore();
    const messaging = getMessaging();
    const now = new Date();
    // Calcular la hora "hasta" dónde buscar (ahora + 5 minutos)
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    console.log(
      `Función ejecutada a las ${now.toISOString()}.
      Buscando alarmas hasta ${fiveMinutesFromNow.toISOString()}`,
    );

    try {
      // 1. Buscar todas las alarmas pendientes
      const querySnapshot = await db.collectionGroup("alarms")
        .where("status", "==", "pending")
        .where("alarmTime", "<=", fiveMinutesFromNow.toISOString())
        .get();

      if (querySnapshot.empty) {
        console.log("No hay alarmas pendientes para enviar.");
        return null;
      }

      console.log(`Se encontraron ${querySnapshot.size} alarmas para procesar.`);

      // 2. Procesar cada alarma
      const tasks = querySnapshot.docs.map(async (doc) => {
        const alarm = doc.data();
        const alarmRef = doc.ref;

        // Obtener token
        let token = "";
        try {
          const tokenQuery = await db.collection(
            `users/${alarm.userId}/fcmTokens`,
          ).limit(1).get();

          if (!tokenQuery.empty) {
            token = tokenQuery.docs[0].id; // El ID del documento es el token
          } else {
            throw new Error("No se encontró token FCM para el usuario.");
          }
        } catch (tokenError) {
          console.error(
            `Error obteniendo token para userId ${alarm.userId}:`,
            tokenError,
          );
          await alarmRef.update({status: "failed_no_token"});
          return; 
        }

        // 3. Preparar el mensaje
        const payload = {
          notification: {
            title: alarm.title || "Recordatorio de MedicalHome",
            body: alarm.body || "Tienes un nuevo recordatorio.",
            icon: "images/icons/icon-192x192.png", 
          },
          token: token,
        };

        // 4. Enviar el mensaje
        try {
          console.log(
            `Enviando notificación a ${token} para alarma ${alarm.alarmId}`,
          );
          await messaging.send(payload);

          // 5. Actualizar la alarma
          await alarmRef.update({status: "sent"});
          console.log(`Alarma ${alarm.alarmId} marcada como enviada.`);
        } catch (sendError) {
          console.error(`Error enviando mensaje a ${token}:`, sendError);
          if (sendError.code === "messaging/registration-token-not-registered") {
            await alarmRef.update({status: "failed_bad_token"});
          } else {
            console.log(
              `Reintentando alarma ${alarm.alarmId} en el próximo ciclo.`,
            );
          }
        }
      });

      await Promise.all(tasks);
      console.log("Ciclo de procesamiento de alarmas completado.");
    } catch (error) {
      console.error(
        "Error general en la Cloud Function:",
        error,
      );
    }
    return null;
  });