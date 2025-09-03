import React, { useEffect, useState } from 'react';
import type { Recipe, Profile } from '../types';
import { getRecipeDetails } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';

interface RecipeModalProps {
  mealName: string | null;
  profiles: Profile[];
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ mealName, profiles, onClose }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mealName) return;

    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);
      setRecipe(null);
      try {
        const details = await getRecipeDetails(mealName, profiles);
        setRecipe(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la receta.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [mealName, profiles]);

  if (!mealName) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">{recipe?.name || mealName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <SpinnerIcon className="w-8 h-8 text-indigo-600" />
            </div>
          )}
          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-center">
              <p>{error}</p>
            </div>
          )}
          {recipe && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">Ingredientes</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">Instrucciones</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  {recipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
               <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">Información Nutricional</h3>
                <div className="text-gray-600 space-y-1">
                    <p>Calorías estimadas: <span className="font-medium">{recipe.calories} kcal</span></p>
                    <p>Proteínas: <span className="font-medium">{recipe.nutritionalInfo.protein}</span></p>
                    <p>Carbohidratos: <span className="font-medium">{recipe.nutritionalInfo.carbohydrates}</span></p>
                    <p>Grasas: <span className="font-medium">{recipe.nutritionalInfo.fats}</span></p>
                </div>
              </div>
              <div>
                 <p className="mt-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-sm">
                    "{recipe.motivationalComment}"
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
