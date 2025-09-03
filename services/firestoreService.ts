import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Profile, UserRecipe } from '../types';

// Profiles
export const getProfiles = async (userId: string): Promise<Profile[]> => {
    const profilesCol = collection(db, 'users', userId, 'profiles');
    const profileSnapshot = await getDocs(profilesCol);
    return profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
};

export const addProfile = async (userId: string, profile: Omit<Profile, 'id'>): Promise<Profile> => {
    const profilesCol = collection(db, 'users', userId, 'profiles');
    const docRef = await addDoc(profilesCol, profile);
    return { id: docRef.id, ...profile };
};

export const updateProfile = async (userId: string, profile: Profile): Promise<void> => {
    const profileDoc = doc(db, 'users', userId, 'profiles', profile.id);
    const { id, ...data } = profile;
    await updateDoc(profileDoc, data);
};

export const deleteProfile = async (userId: string, profileId: string): Promise<void> => {
    const profileDoc = doc(db, 'users', userId, 'profiles', profileId);
    await deleteDoc(profileDoc);
};

// Recipes
export const getUserRecipes = async (userId: string): Promise<UserRecipe[]> => {
    const recipesCol = collection(db, 'users', userId, 'recipes');
    const recipeSnapshot = await getDocs(recipesCol);
    return recipeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserRecipe));
};

export const addUserRecipe = async (userId: string, recipe: Omit<UserRecipe, 'id'>): Promise<UserRecipe> => {
    const recipesCol = collection(db, 'users', userId, 'recipes');
    const docRef = await addDoc(recipesCol, recipe);
    return { id: docRef.id, ...recipe };
};

export const importUserRecipes = async (userId: string, recipes: Omit<UserRecipe, 'id'>[]): Promise<UserRecipe[]> => {
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
}

export const deleteUserRecipe = async (userId: string, recipeId: string): Promise<void> => {
    const recipeDoc = doc(db, 'users', userId, 'recipes', recipeId);
    await deleteDoc(recipeDoc);
};
