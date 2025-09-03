
import React, { useState } from 'react';
import type { UserRecipe } from '../types';
import TrashIcon from './icons/TrashIcon';

interface RecipesTabProps {
  recipes: UserRecipe[];
  onAddRecipe: (newRecipe: Omit<UserRecipe, 'id'>) => void;
  onDeleteRecipe: (id: string) => void;
  onImportRecipes: (importedRecipes: Omit<UserRecipe, 'id'>[]) => void;
  isDemoMode: boolean;
}

const RecipesTab: React.FC<RecipesTabProps> = ({ recipes, onAddRecipe, onDeleteRecipe, onImportRecipes, isDemoMode }) => {
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim() || !ingredients.trim()) {
        setError('Ambos campos son obligatorios.');
        return;
    }
    setError('');
    onAddRecipe({ name: recipeName, ingredients });
    setRecipeName('');
    setIngredients('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsedRecipes = parseCSV(text);
        onImportRecipes(parsedRecipes);
        e.target.value = ''; // Reset file input
        setFileName('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el archivo.');
      }
    };
    reader.onerror = () => {
        setError('No se pudo leer el archivo.');
    }
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): Omit<UserRecipe, 'id'>[] => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];

    const headerLine = lines.shift()?.toLowerCase();
    if (!headerLine) throw new Error('El CSV está vacío o no tiene cabecera.');
    
    // Basic CSV parsing to find header indices
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
    const nameIndex = headers.indexOf('nombre');
    const ingredientsIndex = headers.indexOf('ingredientes');
    
    if (nameIndex === -1 || ingredientsIndex === -1) {
        throw new Error('El CSV debe tener las columnas "nombre" e "ingredientes".');
    }

    return lines.map(line => {
      const values = line.split(','); 
      const name = values[nameIndex]?.trim().replace(/"/g, '');
      const ingredients = values[ingredientsIndex]?.trim().replace(/"/g, '');

      if (!name || !ingredients) {
        return null;
      }
      return { name, ingredients };
    }).filter((r): r is Omit<UserRecipe, 'id'> => r !== null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-4xl space-y-8">
      {isDemoMode && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          <strong>Modo Demostración:</strong> Las recetas que añadas aquí no se guardarán permanentemente.
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recetas Familiares</h2>
        <form onSubmit={handleAddSubmit} className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Añadir Nueva Receta</h3>
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
           {error && !isDemoMode && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
        <p className="text-xs text-gray-500 mt-2">El CSV debe tener dos columnas: "nombre" e "ingredientes".</p>
        {error && isDemoMode && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recetas Guardadas</h3>
        {recipes.length > 0 ? (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{recipe.name}</p>
                  <p className="text-sm text-gray-600">{recipe.ingredients}</p>
                </div>
                <button 
                    onClick={() => onDeleteRecipe(recipe.id)}
                    className="text-gray-500 hover:text-red-600 transition-colors p-1"
                    aria-label={`Eliminar receta ${recipe.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No hay recetas guardadas.</p>
        )}
      </div>
    </div>
  );
};

export default RecipesTab;
