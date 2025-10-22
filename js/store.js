// --- js/store.js ---
// Este es el "cerebro" que maneja todos los datos de tu app.

// --- Definición de Llaves ---
const PROFILE_KEY = 'medicalHome-profile';
const MEDS_KEY = 'medicalHome-meds';
const CITAS_KEY = 'medicalHome-citas';
const TERAPIAS_KEY = 'medicalHome-terapias';
const AGENDA_KEY = 'medicalHome-agenda';
const NOTIFICACIONES_KEY = 'medicalHome-notificaciones'; // Aunque no lo usemos aún
const BCM_KEY = 'medicalHome-bcm';

// --- Funciones Genéricas ---
function getStorageData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error al leer ${key} de localStorage:`, error);
        return null; // Devuelve null si hay error al parsear
    }
}

function saveStorageData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error al guardar ${key} en localStorage:`, error);
    }
}

// --- API del Store (lo que usarán tus otros archivos) ---

// Objeto 'store' que contiene todas las funciones públicas
export const store = {
    // Perfil
    getProfile: () => getStorageData(PROFILE_KEY),
    saveProfile: (data) => saveStorageData(PROFILE_KEY, data),

    // Medicamentos
    getMeds: () => getStorageData(MEDS_KEY) || [], // Devuelve array vacío si es null
    saveMeds: (data) => saveStorageData(MEDS_KEY, data),

    // Citas
    getCitas: () => getStorageData(CITAS_KEY) || [],
    saveCitas: (data) => saveStorageData(CITAS_KEY, data),

    // Terapias
    getTerapias: () => getStorageData(TERAPIAS_KEY) || [],
    saveTerapias: (data) => saveStorageData(TERAPIAS_KEY, data),

    // Agenda
    getAgenda: () => getStorageData(AGENDA_KEY) || [],
    saveAgenda: (data) => saveStorageData(AGENDA_KEY, data),

    // Notificaciones (aún no implementadas funcionalmente, pero la estructura está)
    getNotificaciones: () => getStorageData(NOTIFICACIONES_KEY) || [],
    saveNotificaciones: (data) => saveStorageData(NOTIFICACIONES_KEY, data),

    // BCM (Renal)
    getBcmData: () => getStorageData(BCM_KEY) || { currentWeight: null, dryWeight: null, liquids: [], dryWeightAppointments: [] },
    saveBcmData: (data) => saveStorageData(BCM_KEY, data),

    // --- Función de Resumen para el Dashboard ---
    getSummaryData: function() { // Usamos 'function' para poder usar 'this'
        const profile = this.getProfile();
        const meds = this.getMeds();
        const citas = this.getCitas();
        // (Añade aquí las llamadas para terapias, etc., cuando las necesites)

        return {
            hasProfile: profile !== null,
            profileName: profile ? profile.fullName : 'Invitado',
            hasMeds: meds.length > 0,
            medsCount: meds.length,
            hasCitas: citas.length > 0,
            citasCount: citas.length
            // ...
        };
    }
};