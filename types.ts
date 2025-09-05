export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'Hombre' | 'Mujer' | 'Otro';
  activityLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  notes: string;
}

export type RecipeCategory = 
  | 'Arroces' 
  | 'Carnes' 
  | 'Pescados' 
  | 'Pastas' 
  | 'Legumbres' 
  | 'Verduras y Ensaladas' 
  | 'Cremas y Sopas' 
  | 'Otros';

export interface UserRecipe {
  id: string;
  name: string;
  ingredients: string;
  category: RecipeCategory | 'Sin Clasificar';
}

export interface MealDetail {
    name: string;
    category: RecipeCategory | 'Plato principal' | 'Desayuno';
}

export interface Meal {
  breakfast?: MealDetail;
  lunch: MealDetail;
  dinner: MealDetail;
}

export type MenuPlan = Record<string, Meal>;

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  nutritionalInfo: {
    protein: string;
    carbohydrates: string;
    fats: string;
  };
  motivationalComment: string;
}

export interface ShoppingListItem {
  ingredient: string;
  quantity: number | string;
  unit: string;
  category: string;
  checked?: boolean;
}

export interface SavedMenu {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  menuPlan: MenuPlan;
}

export interface SwappingMealInfo {
    date: string;
    mealType: 'lunch' | 'dinner' | 'breakfast';
    currentMeal: MealDetail;
}
