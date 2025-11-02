// js/storage.js

// Usaremos localStorage para simular una base de datos local
const dbName = 'MedicalHomeDB';

// DATOS DE MUESTRA (MOCK)
const mockProfile = {
    name: "Usuario de Prueba",
    email: "prueba@medicalhome.com",
    emergencyContactName: "Ana Prueba",
    emergencyContactPhone: "3001234567",
    conditions: ["diabetes", "cardiaco", "artritis"] // Secciones dinámicas
};

const mockData = {
    medicamentos: [
        { id: 1, nombre: "Lisinopril 10mg" },
        { id: 2, nombre: "Metformina 850mg" }
    ],
    citas: [
        { id: 1, especialidad: "Cardiología" }
    ],
    terapias: [],
    agenda: [
        { id: 1, nombre: "Dr. Ruiz" },
        { id: 2, nombre: "Fisioterapeuta" }
    ],
    diabetes: [ { id: 1, valor: 140 }, { id: 2, valor: 130 } ],
    cardiaco: [ { id: 1, sys: 130, dia: 80 } ],
    artritis: [ { id: 1, dolor: 5 } ]
};

// --- FUNCIONES REALES ---

// Inicializa la base de datos si no existe
function initDB() {
    if (!localStorage.getItem(dbName)) {
        console.log('Inicializando DB de muestra...');
        const initialDB = {
            profile: mockProfile,
            data: mockData
        };
        localStorage.setItem(dbName, JSON.stringify(initialDB));
    }
}

// Llama a esto una vez al inicio
initDB();

// Función para obtener toda la base de datos
function getDB() {
    return JSON.parse(localStorage.getItem(dbName));
}

// --- API de Storage ---

// Obtiene el perfil del usuario
export async function getUserProfile() {
    const db = getDB();
    return db.profile;
}

// Obtiene los datos de una sección específica (ej. "medicamentos")
export async function getSectionData(sectionKey) {
    const db = getDB();
    return db.data[sectionKey] || [];
}

// Guarda (sobrescribe) el perfil del usuario
export async function saveUserProfile(profileData) {
    const db = getDB();
    db.profile = profileData;
    localStorage.setItem(dbName, JSON.stringify(db));
    return true;
}

// Guarda (sobrescribe) los datos de una sección
export async function saveSectionData(sectionKey, data) {
    const db = getDB();
    db.data[sectionKey] = data;
    localStorage.setItem(dbName, JSON.stringify(db));
    return true;
}