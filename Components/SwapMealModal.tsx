import React, { useState, useEffect, useMemo } from 'react';
import type { SwappingMealInfo, Meal, UserRecipe, RecipeCategory, MealDetail } from '../types';

interface SwapMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapInfo: SwappingMealInfo;
  dayPlan: Meal;
  availableRecipes: UserRecipe[];
  onConfirmSwap: (newMeal: MealDetail) => void;
}

const allCategories: RecipeCategory[] = [
  'Arroces', 'Carnes', 'Pescados', 'Pastas', 'Legumbres', 'Verduras y Ensaladas', 'Cremas y Sopas', 'Otros'
];

const SwapMealModal: React.FC<SwapMealModalProps> = ({ isOpen, onClose, swapInfo, dayPlan, availableRecipes, onConfirmSwap }) => {
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | ''>('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [balanceWarning, setBalanceWarning] = useState<string>('');

  useEffect(() => {
    // Reset state when modal opens for a new meal
    if (isOpen) {
      setSelectedCategory('');
      setSelectedRecipeId('');
      setBalanceWarning('');
    }
  }, [isOpen, swapInfo]);
  
  const filteredRecipes = useMemo(() => {
    if (!selectedCategory) return [];
    return availableRecipes.filter(r => r.category === selectedCategory);
  }, [selectedCategory, availableRecipes]);

  const handleRecipeSelection = (recipeId: string) => {
    setSelectedRecipeId(recipeId);

    const newRecipe = availableRecipes.find(r => r.id === recipeId);
    if (!newRecipe) return;

    const { mealType } = swapInfo;
    const otherMealType = mealType === 'lunch' ? 'dinner' : 'lunch';
    const otherMeal = dayPlan[otherMealType];

    const heavyCategories: RecipeCategory[] = ['Carnes', 'Pescados', 'Legumbres', 'Pastas', 'Arroces'];

    if (otherMeal && heavyCategories.includes(newRecipe.category as RecipeCategory) && newRecipe.category === otherMeal.category) {
      setBalanceWarning(`💡 Sugerencia: Ya tienes un plato de ${otherMeal.category.toLowerCase()} para la ${otherMealType === 'lunch' ? 'comida' : 'cena'}. Para un menú más variado, podrías considerar otra opción.`);
    } else {
      setBalanceWarning('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipeToSwap = availableRecipes.find(r => r.id === selectedRecipeId);
    if (recipeToSwap) {
      onConfirmSwap({ name: recipeToSwap.name, category: recipeToSwap.category as RecipeCategory });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Cambiar Comida</h2>
                    <p className="text-sm text-gray-500">Cambiando: <span className="font-medium text-gray-700">{swapInfo.currentMeal.name}</span></p>
                </div>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                  1. Elige una categoría
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value as RecipeCategory);
                    setSelectedRecipeId(''); // Reset recipe selection
                    setBalanceWarning('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="" disabled>Selecciona...</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                   <option key="sin-clasificar" value="Sin Clasificar">Sin Clasificar</option>
                </select>
              </div>

              {selectedCategory && (
                <div>
                  <label htmlFor="recipe-select" className="block text-sm font-medium text-gray-700 mb-1">
                    2. Elige una receta
                  </label>
                  <select
                    id="recipe-select"
                    value={selectedRecipeId}
                    onChange={(e) => handleRecipeSelection(e.target.value)}
                    disabled={filteredRecipes.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white disabled:bg-gray-100"
                  >
                    <option value="" disabled>
                      {filteredRecipes.length > 0 ? 'Selecciona una receta...' : 'No hay recetas en esta categoría'}
                    </option>
                    {filteredRecipes.map(recipe => (
                      <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {balanceWarning && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                  <p>{balanceWarning}</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
            <button
                type="submit"
                disabled={!selectedRecipeId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
                Confirmar Cambio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapMealModal;
