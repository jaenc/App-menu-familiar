
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './services/firebase';
import * as firestoreService from './services/firestoreService';
import type { MenuPlan, Profile, UserRecipe } from './types';
import { generateMenuPlan } from './services/geminiService';

// Components
import LoginScreen from './Components/LoginScreen';
import ConfigPanel from './Components/ConfigPanel';
import MenuDisplay from './Components/MenuDisplay';
import RecipeModal from './Components/RecipeModal';
import ShoppingListModal from './Components/ShoppingListModal';
import ProfilesTab from './Components/ProfilesTab';
import RecipesTab from './Components/RecipesTab';
import SpinnerIcon from './Components/icons/SpinnerIcon';
import ConfigErrorScreen from './Components/ConfigErrorScreen';

// Check for the VITE_API_KEY from .env.local
const isGeminiConfigured = !!import.meta.env.VITE_API_KEY;

const App: React.FC = () => {
    type Tab = 'generator' | 'profiles' | 'recipes';
    const [activeTab, setActiveTab] = useState<Tab>('generator');
    
    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    
    // App state
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);
    const [isGeneratingMenu, setIsGeneratingMenu] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [isShoppingListOpen, setShoppingListOpen] = useState(false);
    
    // Auth effect
    useEffect(() => {
        if (!auth) {
            setAuthLoading(false);
            return;
        };

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setDataLoading(true);
                try {
                    const [fetchedProfiles, fetchedRecipes] = await Promise.all([
                        firestoreService.getProfiles(currentUser.uid),
                        firestoreService.getUserRecipes(currentUser.uid)
                    ]);
                    setProfiles(fetchedProfiles);
                    setUserRecipes(fetchedRecipes);
                } catch (e) {
                    console.error("Error fetching user data:", e);
                    setError("No se pudieron cargar tus datos.");
                } finally {
                    setDataLoading(false);
                }
            } else {
                setProfiles([]);
                setUserRecipes([]);
                setDataLoading(false);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        if (!auth || !googleProvider) return;
        setLoginLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Authentication error:", error);
            setError("No se pudo iniciar sesión. Por favor, inténtalo de nuevo.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
    };

    // CRUD handlers
    const handleAddProfile = async (newProfile: Omit<Profile, 'id'>) => {
        if (!user) return;
        const addedProfile = await firestoreService.addProfile(user.uid, newProfile);
        setProfiles(prev => [...prev, addedProfile]);
    };

    const handleUpdateProfile = async (updatedProfile: Profile) => {
        if (!user) return;
        await firestoreService.updateProfile(user.uid, updatedProfile);
        setProfiles(prev => prev.map(p => (p.id === updatedProfile.id ? updatedProfile : p)));
    };

    const handleDeleteProfile = async (id: string) => {
        if (!user) return;
        await firestoreService.deleteProfile(user.uid, id);
        setProfiles(prev => prev.filter(p => p.id !== id));
    };

    const handleAddRecipe = async (newRecipe: Omit<UserRecipe, 'id'>) => {
        if (!user) return;
        const addedRecipe = await firestoreService.addUserRecipe(user.uid, newRecipe);
        setUserRecipes(prev => [...prev, addedRecipe]);
    };

    const handleDeleteRecipe = async (id: string) => {
        if (!user) return;
        await firestoreService.deleteUserRecipe(user.uid, id);
        setUserRecipes(prev => prev.filter(r => r.id !== id));
    };
    
    const handleImportRecipes = async (importedRecipes: Omit<UserRecipe, 'id'>[]) => {
        if (!user) return;
        const newRecipesWithIds = await firestoreService.importUserRecipes(user.uid, importedRecipes);
        setUserRecipes(prev => [...prev, ...newRecipesWithIds]);
    };

    const handleGenerateMenu = async (startDate: string, duration: number, preferences: string, includeBreakfasts: boolean) => {
        setIsGeneratingMenu(true);
        setError(null);
        setMenuPlan(null);
        try {
            const plan = await generateMenuPlan(startDate, duration, preferences, profiles, userRecipes, includeBreakfasts);
            setMenuPlan(plan);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al generar el menú.');
            console.error(err);
        } finally {
            setIsGeneratingMenu(false);
        }
    };

    const renderContent = () => {
        if (dataLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <SpinnerIcon className="w-12 h-12 text-indigo-600" />
                </div>
            );
        }
        switch (activeTab) {
            case 'generator':
                return (
                    <div className="flex flex-col lg:flex-row gap-8 w-full">
                        <ConfigPanel onGenerate={handleGenerateMenu} isLoading={isGeneratingMenu} />
                        <MenuDisplay 
                            menuPlan={menuPlan}
                            isLoading={isGeneratingMenu}
                            error={error}
                            onSelectMeal={(mealName) => setSelectedMeal(mealName)}
                            onGenerateShoppingList={() => setShoppingListOpen(true)}
                        />
                    </div>
                );
            case 'profiles':
                return (
                    <ProfilesTab
                        profiles={profiles}
                        onAddProfile={handleAddProfile}
                        onUpdateProfile={handleUpdateProfile}
                        onDeleteProfile={handleDeleteProfile}
                    />
                );
            case 'recipes':
                return (
                    <RecipesTab
                        recipes={userRecipes}
                        onAddRecipe={handleAddRecipe}
                        onDeleteRecipe={handleDeleteRecipe}
                        onImportRecipes={handleImportRecipes}
                    />
                );
            default:
                return null;
        }
    }
    
    const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-200'
            }`}
            aria-current={activeTab === tabName ? 'page' : undefined}
        >
            {label}
        </button>
    );

    if (!isFirebaseConfigured || !isGeminiConfigured) {
        return <ConfigErrorScreen />;
    }

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <SpinnerIcon className="w-16 h-16 text-indigo-600" />
            </div>
        );
    }
    
    if (!user) {
        return <LoginScreen onLogin={handleLogin} isLoading={loginLoading} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                     <h1 className="text-xl font-bold text-gray-900">
                        Comida<span className="text-indigo-600">A</span>Casa
                    </h1>
                    <div className="flex items-center gap-4">
                       <>
                            <span className="text-sm text-gray-600">
                                Hola, <span className="font-medium">{user?.displayName || 'Usuario'}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                       Tu Planificador de Menús
                    </h2>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                        Genera, guarda y personaliza tus planes de comida semanales.
                    </p>
                </div>
                
                <nav className="flex justify-center mb-8 bg-white p-2 rounded-lg shadow-sm border border-gray-200 w-max mx-auto">
                    <div className="flex space-x-2">
                        <TabButton tabName="generator" label="Generador Menú" />
                        <TabButton tabName="profiles" label="Perfiles" />
                        <TabButton tabName="recipes" label="Recetas" />
                    </div>
                </nav>

                <div className="flex justify-center">
                    {renderContent()}
                </div>
            </main>

            {selectedMeal && (
                <RecipeModal 
                    mealName={selectedMeal}
                    profiles={profiles}
                    onClose={() => setSelectedMeal(null)}
                />
            )}

            {isShoppingListOpen && (
                 <ShoppingListModal
                    isOpen={isShoppingListOpen}
                    onClose={() => setShoppingListOpen(false)}
                    menuPlan={menuPlan}
                    profiles={profiles}
                />
            )}

        </div>
    );
};

export default App;
