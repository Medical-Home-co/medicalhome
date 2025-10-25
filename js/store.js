/* --- js/store.js --- */

const PROFILE_KEY = 'medicalHome-profile';
const MEDS_KEY = 'medicalHome-meds';
const CITAS_KEY = 'medicalHome-citas';
const TERAPIAS_KEY = 'medicalHome-terapias';
const AGENDA_KEY = 'medicalHome-agenda';
const BCM_KEY = 'medicalHome-bcm';        // Renal (Ahora Array)
const OCULAR_KEY = 'medicalHome-ocular';
const ARTRITIS_KEY = 'medicalHome-artritis';
const DIABETES_KEY = 'medicalHome-diabetes';
const CARDIACO_KEY = 'medicalHome-cardiaco';
const TEA_KEY = 'medicalHome-tea';
const RESPIRATORIO_KEY = 'medicalHome-respiratorio';
const GASTRICO_KEY = 'medicalHome-gastrico';
const GENERAL_KEY = 'medicalHome-general';
const BIENESTAR_KEY = 'medicalHome-bienestar'; // No se usa activamente para guardar, ¿quizás quitar?
const NOTIFICACIONES_KEY = 'medicalHome-notificaciones'; // No se usa activamente para guardar, ¿quizás quitar?


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

const guestData = {}; // Definir si se usa

export const store = {
    getProfile: () => getStorageData(PROFILE_KEY),
    saveProfile: (data) => saveStorageData(PROFILE_KEY, data),

    getMeds: () => getStorageData(MEDS_KEY) || [],
    saveMeds: (data) => saveStorageData(MEDS_KEY, data),

    getCitas: () => getStorageData(CITAS_KEY) || [],
    saveCitas: (data) => saveStorageData(CITAS_KEY, data),

    getTerapias: () => getStorageData(TERAPIAS_KEY) || [],
    saveTerapias: (data) => saveStorageData(TERAPIAS_KEY, data),

    getAgenda: () => getStorageData(AGENDA_KEY) || [],
    saveAgenda: (data) => saveStorageData(AGENDA_KEY, data),

    // SOLUCIÓN: BCM ahora es un Array de registros
    getBcmData: () => getStorageData(BCM_KEY) || [],
    saveBcmData: (data) => saveStorageData(BCM_KEY, data),
    // FIN SOLUCIÓN

    getOcularData: () => getStorageData(OCULAR_KEY) || [],
    saveOcularData: (data) => saveStorageData(OCULAR_KEY, data),

    getArtritisData: () => getStorageData(ARTRITIS_KEY) || [],
    saveArtritisData: (data) => saveStorageData(ARTRITIS_KEY, data),

    getDiabetesData: () => getStorageData(DIABETES_KEY) || [],
    saveDiabetesData: (data) => saveStorageData(DIABETES_KEY, data),

    getCardiacoData: () => getStorageData(CARDIACO_KEY) || [],
    saveCardiacoData: (data) => saveStorageData(CARDIACO_KEY, data),

    getTeaData: () => getStorageData(TEA_KEY) || [],
    saveTeaData: (data) => saveStorageData(TEA_KEY, data),

    getRespiratorioData: () => getStorageData(RESPIRATORIO_KEY) || [],
    saveRespiratorioData: (data) => saveStorageData(RESPIRATORIO_KEY, data),

    getGastricoData: () => getStorageData(GASTRICO_KEY) || [],
    saveGastricoData: (data) => saveStorageData(GASTRICO_KEY, data),

    getGeneralData: () => getStorageData(GENERAL_KEY) || [],
    saveGeneralData: (data) => saveStorageData(GENERAL_KEY, data),

    // Bienestar y Notificaciones no parecen guardar datos específicos,
    // se podrían quitar los save/get si no se usan.
    // getBienestarData: () => getStorageData(BIENESTAR_KEY) || [],
    // saveBienestarData: (data) => saveStorageData(BIENESTAR_KEY, data),
    // getNotificaciones: () => getStorageData(NOTIFICACIONES_KEY) || [],
    // saveNotificaciones: (data) => saveStorageData(NOTIFICACIONES_KEY, data),


    loadGuestData: function() {
        console.log("Cargando datos de invitado...");
        const keys = [PROFILE_KEY, MEDS_KEY, CITAS_KEY, TERAPIAS_KEY, BCM_KEY, OCULAR_KEY, ARTRITIS_KEY, DIABETES_KEY, AGENDA_KEY, CARDIACO_KEY, TEA_KEY, RESPIRATORIO_KEY, GASTRICO_KEY, GENERAL_KEY]; // Quitar Bienestar/Notificaciones si no guardan
        keys.forEach(key => localStorage.removeItem(key));

        Object.keys(guestData).forEach(key => {
            const saveFunctionName = `save${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (typeof this[saveFunctionName] === 'function') {
                this[saveFunctionName](guestData[key]);
            } else { console.warn(`Función ${saveFunctionName} no encontrada en store.`); }
        });
        console.log("Datos de invitado cargados.");
    },

    getSummaryData: function() {
        const profile = this.getProfile(); const meds = this.getMeds(); const citas = this.getCitas();
        return { hasProfile: !!profile, profileName: profile ? profile.fullName : 'Invitado', hasMeds: meds.length > 0, medsCount: meds.length, hasCitas: citas.length > 0, citasCount: citas.length };
    }
};