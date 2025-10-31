/* --- functions/index.js --- */

// Importar los módulos de Firebase
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {getFirestore} = require("firebase-admin/firestore");
const {getMessaging} = require("firebase-admin/messaging");
const {initializeApp} = require("firebase-admin/app");

// Inicializar Firebase Admin
initializeApp();

// Definir la Cloud Function para que se ejecute cada 5 minutos
exports.sendScheduledNotifications = onSchedule(
  "every 5 minutes", async (event) => {
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

      // Usar un array de promesas para manejar todas las alarmas
      const tasks = querySnapshot.docs.map(async (doc) => {
        const alarm = doc.data();
        const alarmRef = doc.ref;

        // 2. Obtener el token de notificación del usuario
        let token = "";
        try {
          // Asumimos que el token está en /users/{userId}/fcmTokens/{tokenId}
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
          // Marcar como fallida para no reintentar
          await alarmRef.update({status: "failed_no_token"});
          return; // Saltar esta alarma
        }

        // 3. Preparar el mensaje de notificación
        const payload = {
          notification: {
            title: alarm.title || "Recordatorio de MedicalHome",
            body: alarm.body || "Tienes un nuevo recordatorio.",
            icon: "/images/icono.png",
          },
          token: token,
        };

        // 4. Enviar el mensaje
        try {
          console.log(
            `Enviando notificación a ${token} para alarma ${alarm.alarmId}`,
          );
          await messaging.send(payload);

          // 5. Actualizar la alarma a "sent"
          await alarmRef.update({status: "sent"});
          console.log(`Alarma ${alarm.alarmId} marcada como enviada.`);
        } catch (sendError) {
          console.error(`Error enviando mensaje a ${token}:`, sendError);
          // Si el token es inválido, marcar como fallido
          if (sendError.code === "messaging/registration-token-not-registered") {
            await alarmRef.update({status: "failed_bad_token"});
          } else {
            console.log(
              `Reintentando alarma ${alarm.alarmId} en el próximo ciclo.`,
            );
          }
        }
      });

      // Esperar a que todas las tareas (envíos) terminen
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