import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Profile, UserRecipe, SavedMenu, MenuPlan } from '../types';

// Helper to ensure DB is initialized
const checkDb = () => {
    if (!db) {
        console.error("Firestore DB instance is not available. Check Firebase configuration.");
        throw new Error("La base de datos no está inicializada. Por favor, revisa la configuración de Firebase.");
    }
};

// Profiles
export const getProfiles = async (userId: string): Promise<Profile[]> => {
    checkDb();
    const profilesCol = collection(db, 'users', userId, 'profiles');
    const profileSnapshot = await getDocs(profilesCol);
    return profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
};

export const addProfile = async (userId: string, profile: Omit<Profile, 'id'>): Promise<Profile> => {
    checkDb();
    try {
        const profilesCol = collection(db, 'users', userId, 'profiles');
        const docRef = await addDoc(profilesCol, profile);
        return { id: docRef.id, ...profile };
    } catch (error) {
        console.error("Error adding profile in Firestore: ", error);
        throw new Error("No se pudo añadir el perfil a la base de datos.");
    }
};

export const updateProfile = async (userId: string, profile: Profile): Promise<void> => {
    checkDb();
    try {
        const profileDoc = doc(db, 'users', userId, 'profiles', profile.id);
        const { id, ...data } = profile;
        await updateDoc(profileDoc, data);
    } catch (error) {
        console.error("Error updating profile in Firestore: ", error);
        throw new Error("No se pudo actualizar el perfil en la base de datos.");
    }
};

export const deleteProfile = async (userId: string, profileId: string): Promise<void> => {
    checkDb();
    try {
        const profileDoc = doc(db, 'users', userId, 'profiles', profileId);
        await deleteDoc(profileDoc);
    } catch (error) {
        console.error("Error deleting profile in Firestore: ", error);
        throw new Error("No se pudo eliminar el perfil de la base de datos.");
    }
};

// Recipes
export const getUserRecipes = async (userId: string): Promise<UserRecipe[]> => {
    checkDb();
    const recipesCol = collection(db, 'users', userId, 'recipes');
    const recipeSnapshot = await getDocs(recipesCol);
    return recipeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRecipe));
};

export const addUserRecipe = async (userId: string, recipe: Omit<UserRecipe, 'id'>): Promise<UserRecipe> => {
    checkDb();
    try {
        const recipesCol = collection(db, 'users', userId, 'recipes');
        const docRef = await addDoc(recipesCol, recipe);
        return { id: docRef.id, ...recipe };
    } catch (error) {
        console.error("Error adding recipe in Firestore: ", error);
        throw new Error("No se pudo añadir la receta a la base de datos.");
    }
};

export const importUserRecipes = async (userId: string, recipes: Omit<UserRecipe, 'id'>[]): Promise<UserRecipe[]> => {
    checkDb();
    try {
        const recipesCol = collection(db, 'users', userId, 'recipes');
        const batch = writeBatch(db);
        const newRecipes: UserRecipe[] = [];
        recipes.forEach(recipe => {
            const docRef = doc(recipesCol);
            batch.set(docRef, recipe);
            newRecipes.push({ id: docRef.id, ...recipe });
        });
        await batch.commit();
        return newRecipes;
    } catch (error) {
        console.error("Error importing recipes in Firestore: ", error);
        throw new Error("No se pudieron importar las recetas a la base de datos.");
    }
}

export const deleteUserRecipe = async (userId: string, recipeId: string): Promise<void> => {
    checkDb();
    try {
        const recipeDoc = doc(db, 'users', userId, 'recipes', recipeId);
        await deleteDoc(recipeDoc);
    } catch (error) {
        console.error("Error deleting recipe in Firestore: ", error);
        throw new Error("No se pudo eliminar la receta de la base de datos.");
    }
};

// Saved Menus
export const getSavedMenus = async (userId: string): Promise<SavedMenu[]> => {
    checkDb();
    const menusCol = collection(db, 'users', userId, 'savedMenus');
    const menuSnapshot = await getDocs(menusCol);
    // Sort by start date, newest first
    const menus = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedMenu));
    return menus.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};

export const addSavedMenu = async (userId: string, menu: Omit<SavedMenu, 'id'>): Promise<SavedMenu> => {
    checkDb();
    try {
        const menusCol = collection(db, 'users', userId, 'savedMenus');
        const docRef = await addDoc(menusCol, menu);
        return { id: docRef.id, ...menu };
    } catch (error) {
        console.error("Error adding saved menu in Firestore: ", error);
        throw new Error("No se pudo guardar el menú en la base de datos.");
    }
};

export const deleteSavedMenu = async (userId: string, menuId: string): Promise<void> => {
    checkDb();
    try {
        const menuDoc = doc(db, 'users', userId, 'savedMenus', menuId);
        await deleteDoc(menuDoc);
    } catch (error) {
        console.error("Error deleting saved menu in Firestore: ", error);
        throw new Error("No se pudo eliminar el menú guardado de la base de datos.");
    }
};