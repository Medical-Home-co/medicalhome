/* --- js/store.js (Versión Final: Data Completa + Bloqueo con Modal) --- */

// --- CLAVES DE ALMACENAMIENTO ---
const PROFILE_KEY = 'medicalHome-profile';
const MEDS_KEY = 'medicalHome-meds';
const CITAS_KEY = 'medicalHome-citas';
const TERAPIAS_KEY = 'medicalHome-terapias';
const AGENDA_KEY = 'medicalHome-agenda';
const BCM_KEY = 'medicalHome-bcm';        // Renal (Array)
const OCULAR_KEY = 'medicalHome-ocular';
const ARTRITIS_KEY = 'medicalHome-artritis';
const DIABETES_KEY = 'medicalHome-diabetes';
const CARDIACO_KEY = 'medicalHome-cardiaco';
const TEA_KEY = 'medicalHome-tea';
const RESPIRATORIO_KEY = 'medicalHome-respiratorio';
const GASTRICO_KEY = 'medicalHome-gastrico';
const GENERAL_KEY = 'medicalHome-general';
const USER_MODE_KEY = 'medicalHome-userMode'; // 'guest' | 'user'

// --- FUNCIONES BASE (Lectura) ---
function getStorageData(key) {
    try {
        const data = localStorage.getItem(key);
        if (data === null || data === 'undefined' || data === '') {
            return null;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error al leer ${key} de localStorage:`, error);
        return null;
    }
}

// --- FUNCIÓN DE GUARDADO (CON BLOQUEO PARA INVITADOS) ---
function saveStorageData(key, data) {
    
    // 1. Comprobar el modo actual
    const mode = getStorageData(USER_MODE_KEY);
    
    // 2. Si es 'guest' (y no estamos en carga inicial), BLOQUEAR
    // Nota: 'guest-loading' es un estado temporal que permite escribir los datos demo
    if (mode === 'guest') {
        console.warn(`MODO INVITADO: Guardado bloqueado para ${key}`);
        
        // 3. Llamar al modal de advertencia (función global expuesta en main.js)
        if (typeof window.showGuestWarningModal === 'function') {
            window.showGuestWarningModal();
        } else {
            // Fallback por si main.js no ha cargado
            alert("Esta función es solo para usuarios registrados.");
        }
        return false; // Detener el guardado
    }

    // 4. Si es usuario real o el sistema cargando datos, PROCEDER
    try {
        if (data === undefined || data === null) {
             localStorage.removeItem(key);
        } else {
             localStorage.setItem(key, JSON.stringify(data));
        }
        return true;
    } catch (error) {
        console.error(`Error al guardar ${key}:`, error);
        if (error.name === 'QuotaExceededError') {
             alert('Error: Memoria llena. Intenta liberar espacio en tu navegador.');
        }
        return false;
    }
}

// --- DATOS DE DEMOSTRACIÓN PARA INVITADO (DATA COMPLETA - 4 ITEMS POR CATEGORÍA) ---
const guestData = {
    profile: {
        fullName: "Usuario Invitado",
        age: "42",
        bloodType: "A+",
        weight: "82",
        height: "175",
        email: "invitado@medicalhome.app",
        password: "123", 
        confirmPassword: "123",
        // Activamos todas las condiciones para la demo
        conditions: ["renal", "diabetes", "tea", "ocular", "respiratorio", "gastrico", "general", "artritis", "cardiaco"],
        renalAccess: "fistula",
        fistulaLocation: "antebrazo-izq",
        hemodialysisDays: ["M-J-S"],
        hemodialysisTime: "07:30",
        clinicName: "Unidad Renal Demo",
        alergias: ["Aspirina", "Mariscos"],
        eps: "SaludTotal EPS",
        epsPhone: "3101234567",
        emergencyContactName: "Ana Familiar",
        emergencyContactPhone: "3107654321",
        avatar: "images/avatar.png"
    },
    meds: [
        { id: "med-g-1", name: "Enalapril", dose: "10 mg", frequency: "1", schedules: ["08:00"], notes: "Para la presión. Tomar después del desayuno.", notify: true },
        { id: "med-g-2", name: "Metformina XR", dose: "1000 mg", frequency: "1", schedules: ["20:00"], notes: "Para diabetes. Tomar con la cena.", notify: true },
        { id: "med-g-3", name: "Omeprazol", dose: "20 mg", frequency: "1", schedules: ["07:00"], notes: "Para gastritis. Ayunas.", notify: true },
        { id: "med-g-4", name: "Loratadina", dose: "10 mg", frequency: "custom", custom_number: "1", custom_unit: "dias", schedules: ["09:00"], notes: "Si hay síntomas.", notify: false }
    ],
    citas: [
        { id: "cita-g-1", name: "Control Nefrología", date: "2025-11-12", time: "09:30", location: "Unidad Renal Demo", doctor: "Dr. Renal", companion: "", isDryWeightAppointment: true, attended: null, notify: true },
        { id: "cita-g-2", name: "Cardiología", date: "2025-11-20", time: "14:00", location: "Clínica Corazón", doctor: "Dra. Corazón", companion: "Ana Familiar", isDryWeightAppointment: false, attended: null, notify: true },
        { id: "cita-g-3", name: "Oftalmología", date: "2025-10-15", time: "11:00", location: "Centro Visual", doctor: "Dr. Ojo", companion: "", isDryWeightAppointment: false, attended: true, notify: false },
        { id: "cita-g-4", name: "Endocrinología", date: "2025-09-25", time: "16:00", location: "Consultorio Dr. Azúcar", doctor: "Dr. Azúcar", companion: "", isDryWeightAppointment: false, attended: false, notify: false }
    ],
    terapias: [
        { id: "ter-g-1", name: "Fisioterapia", date: "2025-11-06", time: "15:00", professional: "Lic. Fisio", type: "domiciliario", attended: null, notify: true },
        { id: "ter-g-2", name: "Terapia Lenguaje", date: "2025-11-08", time: "10:00", professional: "Lic. Habla", type: "ambulatorio", entity: "Centro Crecer", address: "Cra 5 # 10", phone: "3111112222", attended: null, notify: true },
        { id: "ter-g-3", name: "Terapia Ocupacional", date: "2025-10-29", time: "14:00", professional: "Lic. Ocupa", type: "domiciliario", attended: true, notify: false },
        { id: "ter-g-4", name: "Psicología", date: "2025-10-20", time: "16:30", professional: "Dra. Mente", type: "ambulatorio", entity: "Consultorio Mente", address: "Av Sur # 30", phone: "3222223333", attended: false, notify: false }
    ],
    bcmData: [
        { id: 1729900001000, date: "2025-10-28", currentWeight: "84.5", dryWeight: "81.0", liquids: [{ amount: 250, time: "08:15" }, { amount: 500, time: "13:00" }, { amount: 200, time: "17:30" }] },
        { id: 1729813602000, date: "2025-10-27", currentWeight: "83.8", dryWeight: "81.0", liquids: [{ amount: 300, time: "07:00" }, { amount: 600, time: "12:30" }, { amount: 250, time: "16:00" }, { amount: 150, time: "19:00" }] },
        { id: 1729727203000, date: "2025-10-26", currentWeight: "85.2", dryWeight: "81.0", liquids: [{ amount: 500, time: "09:00" }, { amount: 700, time: "14:00" }, { amount: 300, time: "18:00" }, { amount: 400, time: "21:00" }] },
        { id: 1729640804000, date: "2025-10-25", currentWeight: "84.0", dryWeight: "81.0", liquids: [{ amount: 600, time: "10:00" }, { amount: 800, time: "15:00" }, { amount: 500, time: "19:30" }, { amount: 500, time: "22:00" }] }
    ],
    cardiacoData: [
        { id: 1729900005000, date: "2025-10-28", time: "07:30", measurementTime: "al_despertar", systolic: 135, diastolic: 85, heartRate: 72, symptoms: [], notes: "Medición matutina." },
        { id: 1729813606000, date: "2025-10-27", time: "15:00", measurementTime: "tarde", systolic: 142, diastolic: 91, heartRate: 78, symptoms: ["Dolor de cabeza"], notes: "Estrés." },
        { id: 1729727207000, date: "2025-10-26", time: "21:00", measurementTime: "antes_de_dormir", systolic: 128, diastolic: 80, heartRate: 65, symptoms: [], notes: "Día tranquilo." },
        { id: 1729640808000, date: "2025-10-25", time: "10:00", measurementTime: "media_manana", systolic: 115, diastolic: 75, heartRate: 85, symptoms: ["Mareo leve"], notes: "Caminata rápida." }
    ],
    diabetesData: [
        { id: 1729900009000, date: "2025-10-28", time: "07:00", glucose: 125, measurementTime: "ayunas", hba1c: null, insulin: null, notes: "Ayunas" },
        { id: 1729813610000, date: "2025-10-27", time: "14:30", glucose: 190, measurementTime: "despues_almuerzo", hba1c: null, insulin: 8, notes: "Post-almuerzo" },
        { id: 1729727211000, date: "2025-10-26", time: "21:30", glucose: 110, measurementTime: "antes_dormir", hba1c: 7.5, insulin: null, notes: "Control noche" },
        { id: 1729640812000, date: "2025-10-25", time: "12:00", glucose: 85, measurementTime: "antes_almuerzo", hba1c: null, insulin: null, notes: "Sensación debilidad" }
    ],
    artritisData: [
        { id: 1729900013000, date: "2025-10-28", time: "08:00", painLevel: 7, mobility: "Moderada", symptoms: ["Rigidez"], joints: ["Rodilla Derecha"], meds: ["Ibuprofeno"], notes: "Rigidez matutina" },
        { id: 1729813614000, date: "2025-10-27", time: "16:00", painLevel: 4, mobility: "Leve", symptoms: ["Dolor leve"], joints: ["Dedos Manos"], meds: [], notes: "Mejoró tarde" },
        { id: 1729727215000, date: "2025-10-26", time: "10:00", painLevel: 8, mobility: "Severa", symptoms: ["Dolor agudo"], joints: ["Cadera Izquierda"], meds: ["Naproxeno"], notes: "Dolor al caminar" },
        { id: 1729640816000, date: "2025-10-25", time: "20:00", painLevel: 3, mobility: "Leve", symptoms: [], joints: [], meds: [], notes: "Día bueno" }
    ],
    teaData: [
        { id: 1729900017000, date: "2025-10-28", time: "10:30", mood: "Feliz", anxietyLevel: "2", emotionNotes: "Jugando", social: ["Positivas"], socialNotes: "", sensoryOverload: "No", sensory: [], routineChange: "No", changeHandling: "", sleepQuality: "Buena", appetite: "Bueno", positiveMoment: "Armó bloques" },
        { id: 1729813618000, date: "2025-10-27", time: "16:00", mood: "Ansioso", anxietyLevel: "7", emotionNotes: "Inquieto", social: ["Con Dificultad"], socialNotes: "No quiso salir", sensoryOverload: "Sí", sensory: ["Multitudes"], routineChange: "No", changeHandling: "", sleepQuality: "Regular", appetite: "Regular", positiveMoment: "Música calmó" },
        { id: 1729727219000, date: "2025-10-26", time: "11:00", mood: "Tranquilo", anxietyLevel: "3", emotionNotes: "Terapia", social: ["Neutrales"], socialNotes: "Instrucciones OK", sensoryOverload: "No", sensory: [], routineChange: "No", changeHandling: "", sleepQuality: "Buena", appetite: "Bueno", positiveMoment: "Nuevas palabras" },
        { id: 1729640820000, date: "2025-10-25", time: "19:00", mood: "Enojado", anxietyLevel: "8", emotionNotes: "Frustrado", social: ["Neutrales"], socialNotes: "Solo en cuarto", sensoryOverload: "No", sensory: [], routineChange: "Sí", changeHandling: "Generó estrés", sleepQuality: "Mala", appetite: "Bajo", positiveMoment: "Baño relajante" }
    ],
    respiratorioData: [
        { id: 1729900021000, date: "2025-10-28", time: "09:00", severity: "Leve", symptoms: ["Tos seca"], peakflow: "480", usedInhaler: "no", inhalerDose: null, usedOxygen: "no", oxygenDetails: null, notes: "Tos ocasional." },
        { id: 1729813622000, date: "2025-10-27", time: "22:30", severity: "Moderado", symptoms: ["Tos", "Sibilancias"], peakflow: "410", usedInhaler: "yes", inhalerDose: "Salbutamol", usedOxygen: "no", oxygenDetails: null, notes: "Dificultad nocturna." },
        { id: 1729727223000, date: "2025-10-26", time: "14:00", severity: "Leve", symptoms: [], peakflow: "500", usedInhaler: "no", inhalerDose: null, usedOxygen: "no", oxygenDetails: null, notes: "Sin síntomas." },
        { id: 1729640824000, date: "2025-10-25", time: "07:00", severity: "Severo", symptoms: ["Falta de aire"], peakflow: "350", usedInhaler: "yes", inhalerDose: "Salbutamol+Bude", usedOxygen: "yes", oxygenDetails: "Nebulización", notes: "Crisis polvo." }
    ],
    gastricoData: [
        { id: 1729900025000, date: "2025-10-28", time: "15:30", symptoms: [{ name: "Acidez / Reflujo", severity: "Moderado" }], food: "Café", meds: "Omeprazol" },
        { id: 1729813626000, date: "2025-10-27", time: "20:00", symptoms: [{ name: "Hinchazón / Gases", severity: "Leve" }], food: "Lentejas", meds: "" },
        { id: 1729727227000, date: "2025-10-26", time: "13:00", symptoms: [{ name: "Dolor Abdominal", severity: "Severo" }], food: "Fritos", meds: "Buscapina" },
        { id: 1729640828000, date: "2025-10-25", time: "09:00", symptoms: [{ name: "Otro", severity: "Leve" }], food: "Arepa", meds: "" }
    ],
    ocularData: [
        { id: 1729900029000, ojo_derecho: "6/9 (20/30)", ojo_izquierdo: "6/12 (20/40)", binocular: "6/9 (20/30)", clasificacion: "leve", anio_inicio: "2018", correccion: ["gafas"], ultimo_examen: ["2025-01-20"], sintomas: ["vision_borrosa"], observaciones: "Miopía" },
        { id: 1729813630000, ojo_derecho: "6/60 (20/200)", ojo_izquierdo: "Cuenta Dedos (CD)", binocular: "6/60 (20/200)", clasificacion: "grave", anio_inicio: "2010", correccion: ["lentes_contacto"], ultimo_examen: ["2024-06-15"], sintomas: ["ojo_seco"], observaciones: "Retinopatía" },
        { id: 1729727231000, ojo_derecho: "Movimiento Manos (MM)", ojo_izquierdo: "NPL", binocular: "MM", clasificacion: "ceguera", anio_inicio: "2005", correccion: ["ninguna"], ultimo_examen: ["2022-11-01"], sintomas: ["dolor_ocular"], observaciones: "Glaucoma" },
        { id: 1729640832000, ojo_derecho: "20/80", ojo_izquierdo: "20/100", binocular: "20/80", clasificacion: "moderada", anio_inicio: "2015", correccion: ["gafas"], ultimo_examen: ["2024-09-05"], sintomas: ["lagrimeo"], observaciones: "Escala Pies" }
    ],
    generalData: [
        { id: 1729900033000, date: "2025-10-28", time: "11:00", symptom: "Migraña", severity: "Severo", meds: "Sumatriptán", notes: "Aura visual." },
        { id: 1729813634000, date: "2025-10-27", time: "19:00", symptom: "Dolor espalda", severity: "Moderado", meds: "Ibuprofeno", notes: "Esfuerzo físico." },
        { id: 1729727235000, date: "2025-10-26", time: "Todo el día", symptom: "Congestión", severity: "Leve", meds: "Loratadina", notes: "Alergia." },
        { id: 1729640836000, date: "2025-10-25", time: "15:00", symptom: "Picadura", severity: "Leve", meds: "", notes: "Brazo inflamado." }
    ],
    agenda: [
        { id: 1729900037000, name: "Dr. Renal", relation: "Médico", phone: "3121112233", isEmergency: false },
        { id: 1729813638000, name: "Dra. Corazón", relation: "Médico", phone: "3134445566", isEmergency: false },
        { id: 1729727239000, name: "Unidad Renal Demo", relation: "Clínica", phone: "6063334455", isEmergency: false },
        { id: 1729640840000, name: "Ana Familiar", relation: "Hija", phone: "3107654321", isEmergency: true }
    ]
};

// --- OBJETO STORE (API PÚBLICA) ---
export const store = {
    isGuestMode: () => getStorageData(USER_MODE_KEY) === 'guest',

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

    getBcmData: () => getStorageData(BCM_KEY) || [],
    saveBcmData: (data) => saveStorageData(BCM_KEY, data),

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

    // --- CARGA DE DATOS DE INVITADO (SIN ALERTAS) ---
    loadGuestData: function() {
        console.log("Cargando datos de invitado...");
        
        const keysToClear = [
            PROFILE_KEY, MEDS_KEY, CITAS_KEY, TERAPIAS_KEY, BCM_KEY, 
            OCULAR_KEY, ARTRITIS_KEY, DIABETES_KEY, CARDIACO_KEY, TEA_KEY, 
            RESPIRATORIO_KEY, GASTRICO_KEY, GENERAL_KEY, AGENDA_KEY, USER_MODE_KEY
        ];
        keysToClear.forEach(k => localStorage.removeItem(k));

        // Estado temporal para saltarse el bloqueo
        localStorage.setItem(USER_MODE_KEY, JSON.stringify('guest-loading'));

        try {
            let success = true;
            Object.keys(guestData).forEach(key => {
                const saveFunctionName = `save${key.charAt(0).toUpperCase() + key.slice(1)}`;
                if (typeof this[saveFunctionName] === 'function') {
                    if (!this[saveFunctionName](guestData[key])) success = false;
                }
            });

            if (success) {
                // Modo final 'guest'
                localStorage.setItem(USER_MODE_KEY, JSON.stringify('guest'));
                console.log("Datos cargados. Redirigiendo...");
                window.location.reload();
            } else {
                throw new Error("Fallo parcial al guardar datos.");
            }
        } catch (e) {
            console.error("Error carga invitado:", e);
            localStorage.removeItem(USER_MODE_KEY);
            alert("Error al cargar datos de invitado.");
        }
    }
};