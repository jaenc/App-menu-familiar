import React, { useState } from 'react';
import type { UserRecipe, RecipeCategory } from '../types';
import TrashIcon from './icons/TrashIcon';

interface RecipesTabProps {
  recipes: UserRecipe[];
  onAddRecipe: (newRecipe: Omit<UserRecipe, 'id'>) => void;
  onDeleteRecipe: (id: string) => void;
  onImportRecipes: (importedRecipes: Omit<UserRecipe, 'id'>[]) => void;
  onSelectRecipe: (name: string) => void;
  error: string | null; // For errors from parent (e.g., Firestore)
  clearError: () => void;
}

const recipeCategories: RecipeCategory[] = [
  'Arroces', 'Carnes', 'Pescados', 'Pastas', 'Legumbres', 'Verduras y Ensaladas', 'Cremas y Sopas', 'Otros'
];

const allRecipeCategoriesForFilter: string[] = ['All', ...recipeCategories, 'Sin Clasificar'];

const RecipesTab: React.FC<RecipesTabProps> = ({ recipes, onAddRecipe, onDeleteRecipe, onImportRecipes, onSelectRecipe, error: parentError, clearError }) => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('Otros');
  const [fileName, setFileName] = useState('');
  const [formError, setFormError] = useState(''); // For local form validation
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim() || !ingredients.trim()) {
        setFormError('Todos los campos son obligatorios.');
        return;
    }
    setFormError('');
    onAddRecipe({ name: recipeName, ingredients, category });
    setRecipeName('');
    setIngredients('');
    setCategory('Otros');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFormError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsedRecipes = parseCSV(text);
        onImportRecipes(parsedRecipes);
        e.target.value = ''; // Reset file input
        setFileName('');
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
      }
    };
    reader.onerror = () => {
        setFormError('No se pudo leer el archivo.');
    }
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): Omit<UserRecipe, 'id'>[] => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];

    const headerLine = lines.shift()?.toLowerCase();
    if (!headerLine) throw new Error('El CSV está vacío o no tiene cabecera.');
    
    // Normalize headers: remove quotes, BOM, and trim spaces
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, '').replace(/^\uFEFF/, ''));
    const nameIndex = headers.indexOf('nombre');
    const ingredientsIndex = headers.indexOf('ingredientes');
    const categoryIndex = headers.indexOf('categoría'); // Optional category, with accent
    
    if (nameIndex === -1 || ingredientsIndex === -1) {
        throw new Error('El CSV debe tener como mínimo las columnas "nombre" e "ingredientes".');
    }

    return lines.map(line => {
      // Basic CSV parsing, may need to be more robust for complex cases
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));

      const name = values[nameIndex];
      const ingredients = values[ingredientsIndex];
      const categoryValue = categoryIndex !== -1 ? values[categoryIndex] : undefined;
      
      if (!name || !ingredients) {
        return null;
      }
      
      let finalCategory: UserRecipe['category'] = 'Sin Clasificar';
      if (categoryValue) {
        // Find a category that matches case-insensitively
        const matchedCategory = recipeCategories.find(cat => cat.toLowerCase() === categoryValue.trim().toLowerCase());
        if (matchedCategory) {
          finalCategory = matchedCategory;
        }
      }
      
      const recipe: Omit<UserRecipe, 'id'> = { name, ingredients, category: finalCategory };
      return recipe;

    }).filter((r): r is Omit<UserRecipe, 'id'> => r !== null);
  };

  const recipesToDisplay = recipes
    .filter(recipe =>
        filterCategory === 'All' || (recipe.category || 'Sin Clasificar') === filterCategory
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-4xl space-y-8">
      
      {parentError && (
        <div className="p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex justify-between items-center" role="alert">
          <span>
            <strong>Error:</strong> {parentError}
          </span>
          <button onClick={clearError} className="p-1 rounded-full hover:bg-red-100" aria-label="Cerrar notificación">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recetas Familiares</h2>
        <form onSubmit={handleAddSubmit} className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Añadir Nueva Receta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700">Nombre de la Comida</label>
              <input
                id="recipeName"
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Ej: Lentejas de la abuela"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as RecipeCategory)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {recipeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Ingredientes</label>
            <textarea
              id="ingredients"
              rows={3}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Ej: Lentejas, chorizo, patata, zanahoria..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Añadir Receta</button>
           {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
        </form>
      </div>

      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700">O importar desde CSV</h3>
        <div className="mt-2">
          <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
          <label htmlFor="csv-upload" className="cursor-pointer px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
            Elegir archivo
          </label>
          <span className="ml-3 text-gray-600">{fileName || 'No se ha seleccionado ningún archivo'}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">El CSV debe tener las columnas "nombre", "ingredientes" y opcionalmente "categoría". Las recetas sin una categoría válida se guardarán como "Sin Clasificar".</p>
        {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recetas Guardadas</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-category" className="text-sm font-medium text-gray-700">Filtrar:</label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
            >
              {allRecipeCategoriesForFilter.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Todas' : cat}</option>
              ))}
            </select>
          </div>
        </div>
        {recipes.length > 0 ? (
          <div className="space-y-3">
            {recipesToDisplay.map((recipe) => (
              <div key={recipe.id} className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
                <button onClick={() => onSelectRecipe(recipe.name)} className="text-left flex-grow hover:bg-gray-100 rounded-md p-2 -m-2">
                  <p className="font-semibold text-gray-800">{recipe.name} <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{recipe.category || 'Sin Clasificar'}</span></p>
                  <p className="text-sm text-gray-600">{recipe.ingredients}</p>
                </button>
                <button 
                    onClick={() => onDeleteRecipe(recipe.id)}
                    className="text-gray-500 hover:text-red-600 transition-colors p-1 ml-4 flex-shrink-0"
                    aria-label={`Eliminar receta ${recipe.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
             {recipesToDisplay.length === 0 && (
                <p className="text-center text-gray-500 py-6">No hay recetas en esta categoría.</p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No hay recetas guardadas.</p>
        )}
      </div>
    </div>
  );
};

export default RecipesTab;