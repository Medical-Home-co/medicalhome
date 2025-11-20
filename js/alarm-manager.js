/* --- js/alarm-manager.js (SOLUCIÓN: Rutas Absolutas) --- */
import { db, auth } from '/js/firebase-config.js'; // RUTA ABSOLUTA
import { doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/**
 * Guarda o actualiza una alarma en Firestore.
 * Si el ítem tiene notify: false, intenta borrarla.
 * @param {object} item - El objeto de medicamento, cita o terapia.
 * @param {string} type - 'medicamento', 'cita' o 'terapia'.
 */
export async function syncAlarmWithFirestore(item, type) {
    const user = auth.currentUser;
    if (!user) {
        console.log("Usuario no autenticado: Sincronización de alarma omitida.");
        return;
    }
    if (!db) {
        console.error("Error crítico: la conexión a Firestore (db) no está definida en alarm-manager.");
        return;
    }
    const alarmCollection = `users/${user.uid}/alarms`;
    const alarmId = `${type}-${item.id}`;
    const alarmRef = doc(db, alarmCollection, alarmId);

    if (item.notify === false) {
        try {
            await deleteDoc(alarmRef);
            console.log(`Alarma ${alarmId} eliminada de Firestore.`);
        } catch (error) {
            console.error(`Error eliminando alarma ${alarmId}:`, error);
        }
        return; 
    }

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
    if (!auth.currentUser) {
        return; 
    }
    if (!db) {
        console.error("Error crítico: la conexión a Firestore (db) no está definida en alarm-manager.");
        return;
    }

    const user = auth.currentUser;
    const alarmId = `${type}-${itemId}`;
    const alarmRef = doc(db, `users/${user.uid}/alarms`, alarmId);

    try {
        await deleteDoc(alarmRef);
        console.log(`Alarma ${alarmId} eliminada (ítem borrado).`);
    } catch (error) {
        console.warn(`No se pudo eliminar alarma ${alarmId}:`, error);
    }
}