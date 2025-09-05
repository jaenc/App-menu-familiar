import React, { useState, useEffect } from 'react';
// Fix: Use modular imports for Firebase auth to address module resolution errors.
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './services/firebase';
import * as firestoreService from './services/firestoreService';
import type { MenuPlan, Profile, UserRecipe, SavedMenu, SwappingMealInfo, MealDetail } from './types';
import { generateMenuPlan } from './services/geminiService';

// Components
import LoginScreen from './Components/LoginScreen';
import ConfigPanel from './Components/ConfigPanel';
import MenuDisplay from './Components/MenuDisplay';
import RecipeModal from './Components/RecipeModal';
import ShoppingListModal from './Components/ShoppingListModal';
import ProfilesTab from './Components/ProfilesTab';
import RecipesTab from './Components/RecipesTab';
import SavedMenusTab from './Components/SavedMenusTab';
import SpinnerIcon from './Components/icons/SpinnerIcon';
import ConfigErrorScreen from './Components/ConfigErrorScreen';
import SwapMealModal from './Components/SwapMealModal';

// Fix: Use process.env.API_KEY for Gemini configuration check to resolve errors with import.meta.env.
// Check for the API_KEY from .env
const isGeminiConfigured = !!process.env.API_KEY;

const App: React.FC = () => {
    type Tab = 'generator' | 'profiles' | 'savedMenus' | 'recipes';
    const [activeTab, setActiveTab] = useState<Tab>('generator');
    
    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    
    // App state
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
    const [savedMenus, setSavedMenus] = useState<SavedMenu[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);
    const [isGeneratingMenu, setIsGeneratingMenu] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [isShoppingListOpen, setShoppingListOpen] = useState(false);
    const [swappingMealInfo, setSwappingMealInfo] = useState<SwappingMealInfo | null>(null);
    
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
                    const [fetchedProfiles, fetchedRecipes, fetchedMenus] = await Promise.all([
                        firestoreService.getProfiles(currentUser.uid),
                        firestoreService.getUserRecipes(currentUser.uid),
                        firestoreService.getSavedMenus(currentUser.uid)
                    ]);
                    setProfiles(fetchedProfiles);
                    setUserRecipes(fetchedRecipes);
                    setSavedMenus(fetchedMenus);
                } catch (e) {
                    console.error("Error fetching user data:", e);
                    setError("No se pudieron cargar tus datos.");
                } finally {
                    setDataLoading(false);
                }
            } else {
                setProfiles([]);
                setUserRecipes([]);
                setSavedMenus([]);
                setDataLoading(false);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    // Clear error on tab change
    useEffect(() => {
        setError(null);
    }, [activeTab]);

    const clearError = () => setError(null);

    const handleLogin = async () => {
        if (!auth || !googleProvider) return;
        setLoginLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Authentication error:", error);
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
        try {
            setError(null);
            const addedProfile = await firestoreService.addProfile(user.uid, newProfile);
            setProfiles(prev => [...prev, addedProfile]);
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudo añadir el perfil.";
            console.error("Error adding profile:", e);
            setError(message);
        }
    };

    const handleUpdateProfile = async (updatedProfile: Profile) => {
        if (!user) return;
        try {
            setError(null);
            await firestoreService.updateProfile(user.uid, updatedProfile);
            setProfiles(prev => prev.map(p => (p.id === updatedProfile.id ? updatedProfile : p)));
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudo actualizar el perfil.";
            console.error("Error updating profile:", e);
            setError(message);
        }
    };

    const handleDeleteProfile = async (id: string) => {
        if (!user) return;
        try {
            setError(null);
            await firestoreService.deleteProfile(user.uid, id);
            setProfiles(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudo eliminar el perfil.";
            console.error("Error deleting profile:", e);
            setError(message);
        }
    };

    const handleAddRecipe = async (newRecipe: Omit<UserRecipe, 'id'>) => {
        if (!user) return;
        try {
            setError(null);
            const addedRecipe = await firestoreService.addUserRecipe(user.uid, newRecipe);
            setUserRecipes(prev => [...prev, addedRecipe].sort((a, b) => a.name.localeCompare(b.name)));
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudo añadir la receta.";
            console.error("Error adding recipe:", e);
            setError(message);
        }
    };

    const handleDeleteRecipe = async (id: string) => {
        if (!user) return;
        try {
            setError(null);
            await firestoreService.deleteUserRecipe(user.uid, id);
            setUserRecipes(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudo eliminar la receta.";
            console.error("Error deleting recipe:", e);
            setError(message);
        }
    };
    
    const handleImportRecipes = async (importedRecipes: Omit<UserRecipe, 'id'>[]) => {
        if (!user) return;
        try {
            setError(null);
            const newRecipesWithIds = await firestoreService.importUserRecipes(user.uid, importedRecipes);
            setUserRecipes(prev => [...prev, ...newRecipesWithIds].sort((a, b) => a.name.localeCompare(b.name)));
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudieron importar las recetas.";
            console.error("Error importing recipes:", e);
            setError(message);
        }
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

    const handleSaveMenu = async (menuPlan: MenuPlan, startDate: string, endDate: string) => {
      if (!user) return;
      try {
        setError(null);
        const savedMenu = await firestoreService.addSavedMenu(user.uid, { startDate, endDate, menuPlan });
        setSavedMenus(prev => [savedMenu, ...prev]); // Add to the top of the list
      } catch (e) {
        const message = e instanceof Error ? e.message : "No se pudo guardar el menú.";
        console.error("Error saving menu:", e);
        setError(message);
        throw e; // Re-throw to let the child component know about the failure
      }
    };

    const handleDeleteSavedMenu = async (id: string) => {
      if (!user) return;
      try {
        setError(null);
        await firestoreService.deleteSavedMenu(user.uid, id);
        setSavedMenus(prev => prev.filter(m => m.id !== id));
      } catch (e) {
        const message = e instanceof Error ? e.message : "No se pudo eliminar el menú.";
        console.error("Error deleting saved menu:", e);
        setError(message);
      }
    };

    const handleConfirmSwap = (newMeal: MealDetail) => {
        if (!swappingMealInfo || !menuPlan) return;

        const { date, mealType } = swappingMealInfo;
        
        const updatedMenuPlan = { ...menuPlan };
        updatedMenuPlan[date] = { ...updatedMenuPlan[date], [mealType]: newMeal };

        setMenuPlan(updatedMenuPlan);
        setSwappingMealInfo(null);
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
                            onSaveMenu={handleSaveMenu}
                            onInitiateSwap={(info) => setSwappingMealInfo(info)}
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
                        error={error}
                        clearError={clearError}
                    />
                );
            case 'savedMenus':
                return (
                    <SavedMenusTab
                        savedMenus={savedMenus}
                        onDeleteMenu={handleDeleteSavedMenu}
                        error={error}
                        clearError={clearError}
                    />
                );
            case 'recipes':
                return (
                    <RecipesTab
                        recipes={userRecipes}
                        onAddRecipe={handleAddRecipe}
                        onDeleteRecipe={handleDeleteRecipe}
                        onImportRecipes={handleImportRecipes}
                        error={error}
                        clearError={clearError}
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
                        <TabButton tabName="savedMenus" label="Menús Guardados" />
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

            {swappingMealInfo && menuPlan && (
                <SwapMealModal
                    isOpen={!!swappingMealInfo}
                    onClose={() => setSwappingMealInfo(null)}
                    swapInfo={swappingMealInfo}
                    dayPlan={menuPlan[swappingMealInfo.date]}
                    availableRecipes={userRecipes}
                    onConfirmSwap={handleConfirmSwap}
                />
            )}

        </div>
    );
};

export default App;