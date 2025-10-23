/* --- js/store.js --- */
/* Almacén central de datos de la aplicación usando localStorage. */

/* --- Definición de Llaves --- */
const PROFILE_KEY = 'medicalHome-profile';
const MEDS_KEY = 'medicalHome-meds';
const CITAS_KEY = 'medicalHome-citas';
const TERAPIAS_KEY = 'medicalHome-terapias';
const AGENDA_KEY = 'medicalHome-agenda';
const BCM_KEY = 'medicalHome-bcm';        // Renal
const OCULAR_KEY = 'medicalHome-ocular';
const ARTRITIS_KEY = 'medicalHome-artritis';
const DIABETES_KEY = 'medicalHome-diabetes';
const CARDIACO_KEY = 'medicalHome-cardiaco';
const TEA_KEY = 'medicalHome-tea';
const RESPIRATORIO_KEY = 'medicalHome-respiratorio';
const GASTRICO_KEY = 'medicalHome-gastrico';
const GENERAL_KEY = 'medicalHome-general';
const BIENESTAR_KEY = 'medicalHome-bienestar';
const NOTIFICACIONES_KEY = 'medicalHome-notificaciones'; // <-- Llave añadida

/* --- Funciones Genéricas --- */
function getStorageData(key) {
    try {
        const data = localStorage.getItem(key);
        if (data === null || data === 'undefined') {
            return null;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error al leer ${key} de localStorage:`, error);
        return null;
    }
}

function saveStorageData(key, data) {
    try {
        if (data === undefined || data === null) {
             localStorage.removeItem(key);
             return;
        }
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error al guardar ${key} en localStorage:`, error);
    }
}

/* --- Datos de Ejemplo para Invitado (Omitidos por brevedad, pero deben estar aquí) --- */
const guestData = { /* ... (todo el objeto guestData que definimos antes) ... */ };

/* --- API del Store --- */
export const store = {
    /* Perfil (Objeto) */
    getProfile: () => getStorageData(PROFILE_KEY),
    saveProfile: (data) => saveStorageData(PROFILE_KEY, data),

    /* Medicamentos (Array) */
    getMeds: () => getStorageData(MEDS_KEY) || [],
    saveMeds: (data) => saveStorageData(MEDS_KEY, data),

    /* Citas (Array) */
    getCitas: () => getStorageData(CITAS_KEY) || [],
    saveCitas: (data) => saveStorageData(CITAS_KEY, data),

    /* Terapias (Array) */
    getTerapias: () => getStorageData(TERAPIAS_KEY) || [],
    saveTerapias: (data) => saveStorageData(TERAPIAS_KEY, data),

    /* Agenda (Array) */
    getAgenda: () => getStorageData(AGENDA_KEY) || [],
    saveAgenda: (data) => saveStorageData(AGENDA_KEY, data),

    /* BCM (Renal) (Objeto) */
    getBcmData: () => getStorageData(BCM_KEY) || { currentWeight: null, dryWeight: null, liquids: [], dryWeightAppointments: [] },
    saveBcmData: (data) => saveStorageData(BCM_KEY, data),

    /* Ocular (Array de objetos) */
    getOcularData: () => getStorageData(OCULAR_KEY) || [],
    saveOcularData: (data) => saveStorageData(OCULAR_KEY, data),

    /* Artritis (Array de objetos) */
    getArtritisData: () => getStorageData(ARTRITIS_KEY) || [],
    saveArtritisData: (data) => saveStorageData(ARTRITIS_KEY, data),

    /* Diabetes (Array de objetos) */
    getDiabetesData: () => getStorageData(DIABETES_KEY) || [],
    saveDiabetesData: (data) => saveStorageData(DIABETES_KEY, data),
    
    /* Cardiaco (Array de objetos) */
    getCardiacoData: () => getStorageData(CARDIACO_KEY) || [],
    saveCardiacoData: (data) => saveStorageData(CARDIACO_KEY, data),

    /* TEA (Array de objetos) */
    getTeaData: () => getStorageData(TEA_KEY) || [],
    saveTeaData: (data) => saveStorageData(TEA_KEY, data),

    /* Respiratorio (Array de objetos) */
    getRespiratorioData: () => getStorageData(RESPIRATORIO_KEY) || [],
    saveRespiratorioData: (data) => saveStorageData(RESPIRATORIO_KEY, data),

    /* Gastrico (Array de objetos) */
    getGastricoData: () => getStorageData(GASTRICO_KEY) || [],
    saveGastricoData: (data) => saveStorageData(GASTRICO_KEY, data),

    /* General (Array de objetos) */
    getGeneralData: () => getStorageData(GENERAL_KEY) || [],
    saveGeneralData: (data) => saveStorageData(GENERAL_KEY, data),

    /* Bienestar (Array de objetos) */
    getBienestarData: () => getStorageData(BIENESTAR_KEY) || [],
    saveBienestarData: (data) => saveStorageData(BIENESTAR_KEY, data),

    /* Notificaciones (Array de objetos) */
    getNotificaciones: () => getStorageData(NOTIFICACIONES_KEY) || [],
    saveNotificaciones: (data) => saveStorageData(NOTIFICACIONES_KEY, data),


    /* --- Cargar Datos de Invitado --- */
    loadGuestData: function() {
        console.log("Cargando datos de invitado...");
        /* Borrar todas las claves */
        const keys = [PROFILE_KEY, MEDS_KEY, CITAS_KEY, TERAPIAS_KEY, BCM_KEY, OCULAR_KEY, ARTRITIS_KEY, DIABETES_KEY, AGENDA_KEY, CARDIACO_KEY, TEA_KEY, RESPIRATORIO_KEY, GASTRICO_KEY, GENERAL_KEY, BIENESTAR_KEY, NOTIFICACIONES_KEY];
        keys.forEach(key => localStorage.removeItem(key));

        /* Guardar todos los datos de ejemplo */
        Object.keys(guestData).forEach(key => {
            const saveFunctionName = `save${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (typeof this[saveFunctionName] === 'function') {
                this[saveFunctionName](guestData[key]);
            } else { console.warn(`Función ${saveFunctionName} no encontrada en store.`); }
        });
        console.log("Datos de invitado cargados.");
    },

    /* --- Resumen Dashboard --- */
    getSummaryData: function() {
        const profile = this.getProfile(); const meds = this.getMeds(); const citas = this.getCitas();
        return { hasProfile: profile !== null, profileName: profile ? profile.fullName : 'Invitado', hasMeds: meds.length > 0, medsCount: meds.length, hasCitas: citas.length > 0, citasCount: citas.length };
    }
};