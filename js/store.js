/* --- js/store.js --- */

// --- CLAVES DE ALMACENAMIENTO ---
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
// --- INICIO: MODIFICACIÓN MODO INVITADO ---
const USER_MODE_KEY = 'medicalHome-userMode';
// --- FIN: MODIFICACIÓN MODO INVITADO ---

// --- FUNCIONES BASE (get) ---
function getStorageData(key) {
    try {
        const data = localStorage.getItem(key);
        // Evitar parsear 'null', 'undefined' o cadenas vacías
        if (data === null || data === 'undefined' || data === '') {
            return null;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error al leer ${key} de localStorage:`, error);
        return null; // Devolver null si hay error de parseo
    }
}

// --- INICIO: MODIFICACIÓN MODO INVITADO (BLOQUEO) ---
// Esta función ahora bloquea el guardado si el usuario es "invitado"
function saveStorageData(key, data) {
    
    // 1. Comprobar si estamos en modo invitado
    const mode = getStorageData(USER_MODE_KEY);
    
    // 2. Si es 'guest', bloquear el guardado
    if (mode === 'guest') {
        console.warn(`MODO INVITADO: Guardado bloqueado para ${key}`);
        // 3. Llamar al modal de advertencia (definido en main.js)
        if (window.showGuestWarningModal) {
            window.showGuestWarningModal();
        } else {
            // Fallback por si la función no carga
            alert("Para guardar cambios, debes crear un perfil de usuario.");
        }
        return false; // Indicar que el guardado falló
    }

    // 4. Si no es 'guest' (o es 'guest-loading'), proceder con el guardado normal
    try {
        // Guardar null o undefined como string 'null' podría ser problemático al leer después.
        // Mejor eliminar la clave si los datos son null/undefined.
        if (data === undefined || data === null) {
             localStorage.removeItem(key);
        } else {
             localStorage.setItem(key, JSON.stringify(data));
        }
        return true; // Indicar que el guardado fue exitoso
    } catch (error) {
        console.error(`Error al guardar ${key} en localStorage:`, error);
        // Considerar el tamaño del localStorage (quota exceeded)
        if (error.name === 'QuotaExceededError') {
             alert('Error: No hay suficiente espacio para guardar los datos. Intenta liberar espacio.');
        }
        return false; // Indicar que el guardado falló
    }
}
// --- FIN: MODIFICACIÓN MODO INVITADO (BLOQUEO) ---


// --- INICIO: DATOS DE DEMOSTRACIÓN PARA INVITADO (RENOVADOS) ---
const guestData = {
    // Perfil del invitado (Ajustado)
    profile: {
        fullName: "Usuario Invitado",
        age: "42",
        bloodType: "A+",
        weight: "82", // kg
        height: "175", // cm
        email: "invitado@medicalhome.app",
        password: "123", // Solo ejemplo, no seguro
        confirmPassword: "123",
        // Condiciones activadas para que aparezcan en el menú
        conditions: ["renal", "diabetes", "tea", "ocular", "respiratorio", "gastrico", "general", "artritis", "cardiaco"],
        // Datos renales de ejemplo
        renalAccess: "fistula",
        fistulaLocation: "antebrazo-izq",
        hemodialysisDays: ["M-J-S"], // Array como en perfil.html
        hemodialysisTime: "07:30",
        clinicName: "Unidad Renal Demo",
        alergias: ["Aspirina", "Mariscos"], // Array como en perfil.html
        eps: "SaludTotal EPS",
        epsPhone: "3101234567",
        emergencyContactName: "Ana Familiar",
        emergencyContactPhone: "3107654321",
        avatar: "images/avatar.png" // Ruta por defecto
    },

    // 4 Medicamentos de ejemplo (Realistas)
    meds: [
        { id: "med-g-1", name: "Enalapril", dose: "10 mg", frequency: "1", schedules: ["08:00"], notes: "Para la presión. Tomar después del desayuno.", notify: true },
        { id: "med-g-2", name: "Metformina XR", dose: "1000 mg", frequency: "1", schedules: ["20:00"], notes: "Para diabetes. Tomar con la cena.", notify: true },
        { id: "med-g-3", name: "Omeprazol", dose: "20 mg", frequency: "1", schedules: ["07:00"], notes: "Para gastritis. Tomar 30 min antes del desayuno.", notify: true },
        { id: "med-g-4", name: "Loratadina", dose: "10 mg", frequency: "custom", custom_number: "1", custom_unit: "dias", schedules: ["09:00"], notes: "Para alergias, tomar solo si hay síntomas.", notify: false }
    ],

    // 4 Citas de ejemplo (Realistas)
    citas: [
        { id: "cita-g-1", name: "Control Nefrología", date: "2025-11-12", time: "09:30", location: "Unidad Renal Demo, Cons 3", doctor: "Dr. Renal", companion: "", isDryWeightAppointment: true, attended: null, notify: true }, // Próxima, Peso Seco
        { id: "cita-g-2", name: "Cardiología Anual", date: "2025-11-20", time: "14:00", location: "Clínica Corazón, Cons 205", doctor: "Dra. Corazón", companion: "Ana Familiar", isDryWeightAppointment: false, attended: null, notify: true }, // Próxima, con acompañante
        { id: "cita-g-3", name: "Oftalmología", date: "2025-10-15", time: "11:00", location: "Centro Visual", doctor: "Dr. Ojo", companion: "", isDryWeightAppointment: false, attended: true, notify: false }, // Pasada, asistió
        { id: "cita-g-4", name: "Endocrinología", date: "2025-09-25", time: "16:00", location: "Consultorio Dr. Azúcar", doctor: "Dr. Azúcar", companion: "", isDryWeightAppointment: false, attended: false, notify: false } // Pasada, no asistió
    ],

    // 4 Terapias de ejemplo (Realistas)
    terapias: [
        { id: "ter-g-1", name: "Fisioterapia (Rodilla)", date: "2025-11-06", time: "15:00", professional: "Lic. Fisio", type: "domiciliario", attended: null, notify: true }, // Próxima, Domicilio
        { id: "ter-g-2", name: "Terapia de Lenguaje (TEA)", date: "2025-11-08", time: "10:00", professional: "Lic. Habla", type: "ambulatorio", entity: "Centro Crecer", address: "Cra 5 # 10-15", phone: "3111112222", attended: null, notify: true }, // Próxima, Ambulatorio
        { id: "ter-g-3", name: "Terapia Ocupacional", date: "2025-10-29", time: "14:00", professional: "Lic. Ocupa", type: "domiciliario", attended: true, notify: false }, // Pasada, asistió
        { id: "ter-g-4", name: "Psicología", date: "2025-10-20", time: "16:30", professional: "Dra. Mente", type: "ambulatorio", entity: "Consultorio Mente Sana", address: "Av Sur # 30-30", phone: "3222223333", attended: false, notify: false } // Pasada, no asistió
    ],

    // 4 Registros Renales (BCM) de ejemplo (Realistas)
    bcmData: [
        { id: 1729900001000, date: "2025-10-28", currentWeight: "84.5", dryWeight: "81.0", liquids: [{ amount: 250, time: "08:15" }, { amount: 500, time: "13:00" }, { amount: 200, time: "17:30" }] }, // Ganancia 3.5kg -> Límite 3500ml, Consumo 950ml
        { id: 1729813602000, date: "2025-10-27", currentWeight: "83.8", dryWeight: "81.0", liquids: [{ amount: 300, time: "07:00" }, { amount: 600, time: "12:30" }, { amount: 250, time: "16:00" }, { amount: 150, time: "19:00" }] }, // Ganancia 2.8kg -> Límite 2800ml, Consumo 1300ml
        { id: 1729727203000, date: "2025-10-26", currentWeight: "85.2", dryWeight: "81.0", liquids: [{ amount: 500, time: "09:00" }, { amount: 700, time: "14:00" }, { amount: 300, time: "18:00" }, { amount: 400, time: "21:00" }] }, // Ganancia 4.2kg -> Límite 4200ml, Consumo 1900ml
        { id: 1729640804000, date: "2025-10-25", currentWeight: "84.0", dryWeight: "81.0", liquids: [{ amount: 600, time: "10:00" }, { amount: 800, time: "15:00" }, { amount: 500, time: "19:30" }, { amount: 500, time: "22:00" }] }  // Ganancia 3.0kg -> Límite 3000ml, Consumo 2400ml
    ],

    // 4 Registros Cardíacos de ejemplo (Realistas)
    cardiacoData: [
        { id: 1729900005000, date: "2025-10-28", time: "07:30", measurementTime: "al_despertar", systolic: 135, diastolic: 85, heartRate: 72, symptoms: [], notes: "Medición matutina." },
        { id: 1729813606000, date: "2025-10-27", time: "15:00", measurementTime: "tarde", systolic: 142, diastolic: 91, heartRate: 78, symptoms: ["Dolor de cabeza"], notes: "Después de reunión estresante." },
        { id: 1729727207000, date: "2025-10-26", time: "21:00", measurementTime: "antes_de_dormir", systolic: 128, diastolic: 80, heartRate: 65, symptoms: [], notes: "Día tranquilo." },
        { id: 1729640808000, date: "2025-10-25", time: "10:00", measurementTime: "media_manana", systolic: 115, diastolic: 75, heartRate: 85, symptoms: ["Mareo leve"], notes: "Después de caminar rápido." }
    ],

    // 4 Registros de Diabetes de ejemplo (Realistas)
    diabetesData: [
        { id: 1729900009000, date: "2025-10-28", time: "07:00", glucose: 125, measurementTime: "ayunas", hba1c: null, insulin: null, notes: "Glucosa en ayunas." },
        { id: 1729813610000, date: "2025-10-27", time: "14:30", glucose: 190, measurementTime: "despues_almuerzo", hba1c: null, insulin: 8, notes: "Almuerzo con pasta. Se aplicó insulina rápida." },
        { id: 1729727211000, date: "2025-10-26", time: "21:30", glucose: 110, measurementTime: "antes_dormir", hba1c: 7.5, insulin: null, notes: "Control antes de dormir. Se registró último HbA1c." },
        { id: 1729640812000, date: "2025-10-25", time: "12:00", glucose: 85, measurementTime: "antes_almuerzo", hba1c: null, insulin: null, notes: "Se sintió un poco débil antes de comer." }
    ],

    // 4 Registros de Artritis de ejemplo (Realistas)
    artritisData: [
        { id: 1729900013000, date: "2025-10-28", time: "08:00", painLevel: 7, mobility: "Moderada", symptoms: ["Rigidez", "Hinchazón"], joints: ["Rodilla Derecha", "Muñeca Izquierda"], meds: ["Ibuprofeno 600mg"], notes: "Mañana difícil, rigidez matutina." },
        { id: 1729813614000, date: "2025-10-27", time: "16:00", painLevel: 4, mobility: "Leve", symptoms: ["Dolor leve"], joints: ["Dedos Manos"], meds: [], notes: "Dolor mejoró después de terapia." },
        { id: 1729727215000, date: "2025-10-26", time: "10:00", painLevel: 8, mobility: "Severa", symptoms: ["Dolor agudo", "Fatiga"], joints: ["Cadera Izquierda"], meds: ["Naproxeno 500mg"], notes: "Mucho dolor al caminar." },
        { id: 1729640816000, date: "2025-10-25", time: "20:00", painLevel: 3, mobility: "Leve", symptoms: [], joints: [], meds: [], notes: "Día relativamente bueno, poco dolor." }
    ],

    // 4 Registros de TEA de ejemplo (Coinciden con tea.js)
    teaData: [
        { id: 1729900017000, date: "2025-10-28", time: "10:30", mood: "Feliz", anxietyLevel: "2", emotionNotes: "Muy contento jugando.", social: ["Positivas"], socialNotes: "Compartió juguete con hermano.", sensoryOverload: "No", sensory: [], routineChange: "No", changeHandling: "No aplica", sleepQuality: "Buena", appetite: "Bueno", positiveMoment: "Armó torre de 10 bloques solo." },
        { id: 1729813618000, date: "2025-10-27", time: "16:00", mood: "Ansioso", anxietyLevel: "7", emotionNotes: "Inquieto antes de salir.", social: ["Con Dificultad"], socialNotes: "No quiso entrar a la tienda.", sensoryOverload: "Sí", sensory: ["Multitudes"], routineChange: "No", changeHandling: "No aplica", sleepQuality: "Regular", appetite: "Regular", positiveMoment: "Se calmó al escuchar música en el carro." },
        { id: 1729727219000, date: "2025-10-26", time: "11:00", mood: "Tranquilo", anxietyLevel: "3", emotionNotes: "Concentrado en terapia.", social: ["Neutrales"], socialNotes: "Siguió instrucciones de la terapeuta.", sensoryOverload: "No", sensory: [], routineChange: "No", changeHandling: "No aplica", sleepQuality: "Buena", appetite: "Bueno", positiveMoment: "Usó 3 palabras nuevas en sesión." },
        { id: 1729640820000, date: "2025-10-25", time: "19:00", mood: "Enojado", anxietyLevel: "8", emotionNotes: "Frustrado por no poder armar algo.", social: ["Neutrales"], socialNotes: "Estuvo solo en su cuarto.", sensoryOverload: "No", sensory: [], routineChange: "Sí", changeHandling: "Generó estrés", sleepQuality: "Mala", appetite: "Bajo", positiveMoment: "Se relajó mucho durante el baño." }
    ],

    // 4 Registros Respiratorios de ejemplo (Realistas)
    respiratorioData: [
        { id: 1729900021000, date: "2025-10-28", time: "09:00", severity: "Leve", symptoms: ["Tos seca"], peakflow: "480", usedInhaler: "no", inhalerDose: null, usedOxygen: "no", oxygenDetails: null, notes: "Tos ocasional." },
        { id: 1729813622000, date: "2025-10-27", time: "22:30", severity: "Moderado", symptoms: ["Tos", "Sibilancias"], peakflow: "410", usedInhaler: "yes", inhalerDose: "Salbutamol 2 puffs", usedOxygen: "no", oxygenDetails: null, notes: "Despertó con dificultad para respirar." },
        { id: 1729727223000, date: "2025-10-26", time: "14:00", severity: "Leve", symptoms: [], peakflow: "500", usedInhaler: "no", inhalerDose: null, usedOxygen: "no", oxygenDetails: null, notes: "Día sin síntomas." },
        { id: 1729640824000, date: "2025-10-25", time: "07:00", severity: "Severo", symptoms: ["Falta de aire", "Opresión en el pecho", "Tos"], peakflow: "350", usedInhaler: "yes", inhalerDose: "Salbutamol 4 puffs + Budesonida 2 puffs", usedOxygen: "yes", oxygenDetails: "Nebulización en casa", notes: "Crisis asmática por polvo." }
    ],

    // 4 Registros Gástricos de ejemplo (Realistas)
    gastricoData: [
        { id: 1729900025000, date: "2025-10-28", time: "15:30", symptoms: [{ name: "Acidez / Reflujo", severity: "Moderado" }], food: "Café y galletas", meds: "Omeprazol 20mg (mañana)" },
        { id: 1729813626000, date: "2025-10-27", time: "20:00", symptoms: [{ name: "Hinchazón / Gases", severity: "Leve" }], food: "Lentejas", meds: "" },
        { id: 1729727227000, date: "2025-10-26", time: "13:00", symptoms: [{ name: "Dolor Abdominal", severity: "Severo" }, { name: "Náuseas", severity: "Moderado" }], food: "Comida frita", meds: "Buscapina" },
        { id: 1729640828000, date: "2025-10-25", time: "09:00", symptoms: [{ name: "Otro", severity: "Leve" }], food: "Arepa con queso", meds: "" } // Asumiendo "Otro" puede ser un síntoma válido
    ],

    // 4 Registros Oculares de ejemplo (Realistas)
    ocularData: [
        { id: 1729900029000, ojo_derecho: "6/9 (20/30)", ojo_izquierdo: "6/12 (20/40)", binocular: "6/9 (20/30)", clasificacion: "leve", anio_inicio: "2018", correccion: ["gafas"], ultimo_examen: ["2025-01-20"], sintomas: ["vision_borrosa"], observaciones: "Miopía leve y astigmatismo." },
        { id: 1729813630000, ojo_derecho: "6/60 (20/200)", ojo_izquierdo: "Cuenta Dedos (CD)", binocular: "6/60 (20/200)", clasificacion: "grave", anio_inicio: "2010", correccion: ["lentes_contacto", "gafas"], ultimo_examen: ["2024-06-15", "2023-05-10"], sintomas: ["ojo_seco", "destellos"], observaciones: "Retinopatía diabética avanzada." },
        { id: 1729727231000, ojo_derecho: "Movimiento Manos (MM)", ojo_izquierdo: "No Percepción Luz (NPL)", binocular: "Movimiento Manos (MM)", clasificacion: "ceguera", anio_inicio: "2005", correccion: ["ninguna"], ultimo_examen: ["2022-11-01"], sintomas: ["dolor_ocular"], observaciones: "Glaucoma terminal bilateral." },
        { id: 1729640832000, ojo_derecho: "Otro", ojo_derecho_otro1: "20", ojo_derecho_otro2: "80", ojo_izquierdo: "Otro", ojo_izquierdo_otro1: "20", ojo_izquierdo_otro2:"100", binocular: "Otro", binocular_otro1: "20", binocular_otro2: "80", clasificacion: "moderada", anio_inicio: "2015", correccion: ["gafas"], ultimo_examen: ["2024-09-05"], sintomas: ["lagrimeo"], observaciones: "Usa escala en pies (20/X)." } // Ejemplo con "Otro"
    ],

    // 4 Registros Generales de ejemplo (Realistas)
    generalData: [
        { id: 1729900033000, date: "2025-10-28", time: "11:00", symptom: "Migraña", severity: "Severo", meds: "Sumatriptán 50mg", notes: "Aura visual antes del dolor." },
        { id: 1729813634000, date: "2025-10-27", time: "19:00", symptom: "Dolor muscular (espalda)", severity: "Moderado", meds: "Ibuprofeno 400mg", notes: "Después de levantar peso." },
        { id: 1729727235000, date: "2025-10-26", time: "Todo el día", symptom: "Congestión nasal", severity: "Leve", meds: "Loratadina", notes: "Posible alergia estacional." },
        { id: 1729640836000, date: "2025-10-25", time: "15:00", symptom: "Picadura de insecto", severity: "Leve", meds: "", notes: "Enrojecimiento e hinchazón local en brazo." }
    ],

    // 4 Contactos de Agenda de ejemplo (Realistas)
   // 4 Contactos de Agenda de ejemplo (Formato Original - Single Phone)
    agenda: [
        {
            id: 1729900037000, // Usando timestamp como ID simple
            name: "Dr. Renal (Nefrólogo)",
            relation: "Médico Especialista",
            phone: "3121112233", // Celular -> WhatsApp OK
            isEmergency: false
        },
        {
            id: 1729813638000,
            name: "Dra. Corazón (Cardióloga)",
            relation: "Médico Especialista",
            phone: "3134445566", // Celular -> WhatsApp OK
            isEmergency: false
        },
        {
            id: 1729727239000,
            name: "Unidad Renal Demo",
            relation: "Clínica / IPS",
            phone: "6063334455", // Fijo -> WhatsApp NO
            isEmergency: false
        },
        {
            id: 1729640840000,
            name: "Ana Familiar (Hija)",
            relation: "Familiar",
            phone: "3107654321", // Celular -> WhatsApp OK
            isEmergency: true // Contacto de Emergencia
        }
    ],
};
// --- FIN: DATOS DE DEMOSTRACIÓN PARA INVITADO (RENOVADOS) ---


// --- Objeto Store (Exportado) ---
export const store = {
    // --- INICIO: MODIFICACIÓN MODO INVITADO ---
    isGuestMode: () => getStorageData(USER_MODE_KEY) === 'guest',
    // --- FIN: MODIFICACIÓN MODO INVITADO ---

    getProfile: () => getStorageData(PROFILE_KEY),
    saveProfile: (data) => saveStorageData(PROFILE_KEY, data),

    getMeds: () => getStorageData(MEDS_KEY) || [], // Devolver array vacío si es null
    saveMeds: (data) => saveStorageData(MEDS_KEY, data),

    getCitas: () => getStorageData(CITAS_KEY) || [],
    saveCitas: (data) => saveStorageData(CITAS_KEY, data),

    getTerapias: () => getStorageData(TERAPIAS_KEY) || [],
    saveTerapias: (data) => saveStorageData(TERAPIAS_KEY, data),

    getAgenda: () => getStorageData(AGENDA_KEY) || [],
    saveAgenda: (data) => saveStorageData(AGENDA_KEY, data),

    getBcmData: () => getStorageData(BCM_KEY) || [], // BCM es Array
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


    // --- INICIO: MODIFICACIÓN MODO INVITADO ---
    // Esta función ahora carga los datos de demo y recarga la página
    loadGuestData: function() {
        console.log("Cargando datos de invitado...");
        // Incluye TODAS las claves, incluyendo PROFILE y USER_MODE
        const keysToClear = [PROFILE_KEY, MEDS_KEY, CITAS_KEY, TERAPIAS_KEY, BCM_KEY, OCULAR_KEY, ARTRITIS_KEY, DIABETES_KEY, AGENDA_KEY, CARDIACO_KEY, TEA_KEY, RESPIRATORIO_KEY, GASTRICO_KEY, GENERAL_KEY, USER_MODE_KEY];
        
        // 1. Limpiar todos los datos existentes
        keysToClear.forEach(key => localStorage.removeItem(key));
        console.log("LocalStorage limpiado.");

        // 2. Establecer un modo de "carga" temporal para evitar el bloqueo de guardado
        localStorage.setItem(USER_MODE_KEY, JSON.stringify('guest-loading'));
        console.log("Modo establecido a 'guest-loading'.");

        // 3. Usar las funciones 'save' para cargar cada set de datos
        // (Esto funciona porque el modo 'guest-loading' lo permite)
        try {
            let successCount = 0;
            Object.keys(guestData).forEach(key => {
                // Construye el nombre de la función (ej: "profile" -> "saveProfile")
                const saveFunctionName = `save${key.charAt(0).toUpperCase() + key.slice(1)}`;
                
                // Mapeo especial para claves con nombres diferentes
                // (Ej: si la clave es 'meds' pero la función es 'saveMedicamentos')
                // if (key === 'meds') saveFunctionName = 'saveMedicamentos'; // Descomentar y ajustar si es necesario
                
                if (typeof this[saveFunctionName] === 'function') {
                    console.log(`Intentando guardar ${key} con ${saveFunctionName}...`);
                    const result = this[saveFunctionName](guestData[key]);
                    if(result){ // Verifica si saveStorageData devolvió true
                       successCount++;
                       console.log(` -> ${key} guardado exitosamente.`);
                    } else {
                       console.error(` -> FALLÓ el guardado de ${key}.`);
                    }
                } else {
                    console.warn(`Función ${saveFunctionName} no encontrada en store para la clave '${key}'.`);
                }
            });

             // Verificar si todos los datos se intentaron guardar
             if (successCount === Object.keys(guestData).length) {
                console.log("Todos los datos de invitado guardados en modo 'guest-loading'.");
                // 4. Cambiar al modo "guest" final (bloqueado)
                localStorage.setItem(USER_MODE_KEY, JSON.stringify('guest'));
                console.log("Modo cambiado a 'guest'. Recargando app...");
                // 5. Recargar la página para que la app lea los nuevos datos
                window.location.reload();
             } else {
                 throw new Error(`No todos los datos se guardaron (${successCount}/${Object.keys(guestData).length}). Abortando carga de invitado.`);
             }

        } catch (e) {
            console.error("Error masivo cargando datos de invitado:", e);
            // Si falla, limpiar el modo invitado y no recargar
            localStorage.removeItem(USER_MODE_KEY);
            alert("Ocurrió un error al cargar los datos de demostración. La aplicación podría no funcionar correctamente.");
        }
    },
    // --- FIN: MODIFICACIÓN MODO INVITADO ---

    // Función de resumen (ejemplo, puede no estar en tu código original)
    getSummaryData: function() {
        const profile = this.getProfile();
        const meds = this.getMeds();
        const citas = this.getCitas();
        return {
            hasProfile: !!profile,
            profileName: profile ? (profile.fullName ? profile.fullName.split(' ')[0] : 'Usuario') : 'Invitado', // Nombre o 'Usuario'/'Invitado'
            hasMeds: meds.length > 0,
            medsCount: meds.length,
            hasCitas: citas.length > 0,
            citasCount: citas.length
        };
    }
};