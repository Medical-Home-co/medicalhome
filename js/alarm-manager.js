/* --- js/alarm-manager.js (Corregido) --- */
import { db, auth } from './firebase-config.js'; // Importa desde tu config
// --- CORRECCIÓN: Usar la misma versión 12.4.0 que firebase-config.js ---
import { doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
// NO importar store.js

/**
 * Guarda o actualiza una alarma en Firestore.
 * Si el ítem tiene notify: false, intenta borrarla.
 * @param {object} item - El objeto de medicamento, cita o terapia.
 * @param {string} type - 'medicamento', 'cita' o 'terapia'.
 */
export async function syncAlarmWithFirestore(item, type) {
    // 1. EL CHEQUEO DE MODO INVITADO SE HACE AFUERA (en citas.js, etc.)
    
    // 2. No hacer nada si el usuario no está autenticado
    const user = auth.currentUser;
    if (!user) {
        console.log("Usuario no autenticado: Sincronización de alarma omitida.");
        return;
    }

    // 3. Definir la referencia del documento en Firestore
    if (!db) {
        console.error("Error crítico: la conexión a Firestore (db) no está definida en alarm-manager.");
        return;
    }

    // -----------------------------------------------------------------
    // --- CORRECCIÓN CRÍTICA ---
    // La ruta debe coincidir con la CollectionGroup de tu Cloud Function
    const alarmCollection = `users/${user.uid}/alarms`;
    // -----------------------------------------------------------------
    
    const alarmId = `${type}-${item.id}`;
    const alarmRef = doc(db, alarmCollection, alarmId);

    // 4. Si el toggle está APAGADO (notify: false), borrar la alarma
    if (item.notify === false) {
        try {
            await deleteDoc(alarmRef);
            console.log(`Alarma ${alarmId} eliminada de Firestore.`);
        } catch (error) {
            console.error(`Error eliminando alarma ${alarmId}:`, error);
        }
        return; // Terminar
    }

    // 5. Si el toggle está ENCENDIDO, crear o actualizar la alarma
    let alarmTimestampISO;
    try {
        if (type === 'medicamento') {
            const today = new Date().toISOString().split('T')[0];
            const time = item.schedules[0] || '08:00'; 
            alarmTimestampISO = new Date(`${today}T${time}`).toISOString();
        } 
        else {
            if (!item.date || !item.time) {
                console.warn(`Alarma para ${alarmId} omitida: falta fecha o hora.`);
                return;
            }
            alarmTimestampISO = new Date(`${item.date}T${item.time}`).toISOString();
        }
    } catch(e) {
        console.error("Fecha/hora inválida para la alarma:", item);
        return;
    }

    // 6. Preparar el "payload"
    const alarmData = {
        userId: user.uid,
        alarmId: alarmId,
        type: type,
        title: `Recordatorio de ${type}`,
        body: `¡Hora de tu ${type}: ${item.name}!`,
        alarmTime: alarmTimestampISO,
        status: "pending",
        createdAt: serverTimestamp(),
        itemId: item.id,
        itemDose: item.dose || null,
        itemLocation: item.location || item.address || null
    };

    // 7. Guardar en Firestore
    try {
        await setDoc(alarmRef, alarmData, { merge: true }); 
        console.log(`Alarma ${alarmId} guardada/actualizada en Firestore.`);
    } catch (error) {
        console.error(`Error guardando alarma ${alarmId}:`, error);
    }
}

/**
 * Elimina una alarma de Firestore por su ID y tipo.
 * @param {string|number} itemId - El ID del ítem (ej: 173...)
 * @param {string} type - 'medicamento', 'cita' o 'terapia'.
 */
export async function deleteAlarmFromFirestore(itemId, type) {
    // EL CHEQUEO DE MODO INVITADO SE HACE AFUERA
    if (!auth.currentUser) {
        return; 
    }
    if (!db) {
        console.error("Error crítico: la conexión a Firestore (db) no está definida en alarm-manager.");
        return;
    }

    const user = auth.currentUser;
    const alarmId = `${type}-${itemId}`;

    // -----------------------------------------------------------------
    // --- CORRECCIÓN CRÍTICA ---
    // La ruta debe coincidir con la CollectionGroup de tu Cloud Function
    const alarmRef = doc(db, `users/${user.uid}/alarms`, alarmId);
    // -----------------------------------------------------------------

    try {
        await deleteDoc(alarmRef);
        console.log(`Alarma ${alarmId} eliminada (ítem borrado).`);
    } catch (error) {
        console.warn(`No se pudo eliminar alarma ${alarmId}:`, error);
    }
}