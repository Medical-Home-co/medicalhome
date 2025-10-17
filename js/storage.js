import { auth, db } from './firebase-config.js';

const USER_PROFILE_KEY = 'medicalHomeUserProfile';

export async function saveUserProfile(profileData) {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileData));
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('users').doc(user.uid).set({ profile: profileData }, { merge: true });
        } catch (error) {
            console.error('Error al guardar perfil en Firestore:', error);
        }
    }
}

export async function getUserProfile() {
    const user = auth.currentUser;
    if (user) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists && doc.data().profile) {
                const cloudProfile = doc.data().profile;
                localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(cloudProfile));
                return cloudProfile;
            }
        } catch (error) {
            console.error('Error al obtener perfil de Firestore, usando local:', error);
        }
    }
    const localProfile = localStorage.getItem(USER_PROFILE_KEY);
    return localProfile ? JSON.parse(localProfile) : null;
}

function getStorageKey(sectionKey) {
    return `medicalHomeData_${sectionKey}`;
}

export async function getSectionData(sectionKey) {
    const localKey = getStorageKey(sectionKey);
    const user = auth.currentUser;
    if (user) {
        try {
            const querySnapshot = await db.collection('users').doc(user.uid).collection(sectionKey).get();
            const cloudItems = querySnapshot.docs.map(doc => doc.data());
            localStorage.setItem(localKey, JSON.stringify(cloudItems));
            return cloudItems;
        } catch (error) {
             console.error(`Error al obtener ${sectionKey} de Firestore, usando local:`, error);
        }
    }
    return JSON.parse(localStorage.getItem(localKey) || '[]');
}

function saveLocalSectionData(sectionKey, items) {
    localStorage.setItem(getStorageKey(sectionKey), JSON.stringify(items));
}

export async function addSectionDataItem(sectionKey, newItem) {
    const items = await getSectionData(sectionKey);
    items.push(newItem);
    saveLocalSectionData(sectionKey, items);
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('users').doc(user.uid).collection(sectionKey).doc(newItem.id).set(newItem);
        } catch(error) {
            console.error(`Error al añadir item a ${sectionKey} en Firestore:`, error);
        }
    }
}

export async function updateSectionDataItem(sectionKey, itemId, updatedData) {
    let items = await getSectionData(sectionKey);
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        items[itemIndex] = { ...items[itemIndex], ...updatedData };
        saveLocalSectionData(sectionKey, items);
        const user = auth.currentUser;
        if (user) {
            try {
                 await db.collection('users').doc(user.uid).collection(sectionKey).doc(itemId).update(updatedData);
            } catch(error) {
                console.error(`Error al actualizar item en ${sectionKey} en Firestore:`, error);
            }
        }
    }
}

export async function deleteSectionDataItem(sectionKey, itemId) {
    let items = await getSectionData(sectionKey);
    items = items.filter(item => item.id !== itemId);
    saveLocalSectionData(sectionKey, items);
    const user = auth.currentUser;
    if (user) {
        try {
             await db.collection('users').doc(user.uid).collection(sectionKey).doc(itemId).delete();
        } catch(error) {
             console.error(`Error al eliminar item en ${sectionKey} en Firestore:`, error);
        }
    }
}