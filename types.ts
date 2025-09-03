export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'Hombre' | 'Mujer' | 'Otro';
  activityLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  notes: string;
}

export interface UserRecipe {
  id: string;
  name: string;
  ingredients: string;
}

export interface Meal {
  breakfast?: string;
  lunch: string;
  dinner: string;
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