
import { GoogleGenAI, Type } from "@google/genai";
import type { MenuPlan, Recipe, ShoppingListItem, Profile, UserRecipe } from '../types';

// Fix: Use process.env.API_KEY for the Gemini API key as per guidelines. This also resolves errors with import.meta.env.
// Initialize with the API_KEY from .env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const recipeGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        calories: { type: Type.NUMBER },
        nutritionalInfo: {
            type: Type.OBJECT,
            properties: {
                protein: { type: Type.STRING, description: "Approximate protein content, e.g., '25g'" },
                carbohydrates: { type: Type.STRING, description: "Approximate carbohydrate content, e.g., '50g'" },
                fats: { type: Type.STRING, description: "Approximate fat content, e.g., '15g'" },
            },
            required: ['protein', 'carbohydrates', 'fats'],
            propertyOrdering: ['protein', 'carbohydrates', 'fats'],
        },
        motivationalComment: { type: Type.STRING, description: "A motivational comment about the recipe's benefits." }
    },
    required: ['name', 'ingredients', 'instructions', 'calories', 'nutritionalInfo', 'motivationalComment'],
    propertyOrdering: ['name', 'ingredients', 'instructions', 'instructions', 'calories', 'nutritionalInfo', 'motivationalComment'],
};

const shoppingListSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            ingredient: { type: Type.STRING },
            quantity: { type: Type.STRING },
            unit: { type: Type.STRING },
            category: { type: Type.STRING, description: "Supermarket section, e.g., 'Frutas y Verduras', 'Carnicería', 'Despensa'" }
        },
        required: ['ingredient', 'quantity', 'unit', 'category'],
        propertyOrdering: ['ingredient', 'quantity', 'unit', 'category'],
    }
};

const mealDetailSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Concise name of the dish" },
        category: {
            type: Type.STRING,
            description: "The primary category of the dish.",
            enum: ['Arroces', 'Carnes', 'Pescados', 'Pastas', 'Legumbres', 'Verduras y Ensaladas', 'Cremas y Sopas', 'Otros', 'Desayuno']
        }
    },
    required: ['name', 'category']
};

export async function generateMenuPlan(
    startDate: string, 
    duration: number, 
    preferences: string, 
    profiles: Profile[],
    userRecipes: UserRecipe[],
    includeBreakfasts: boolean
): Promise<MenuPlan> {
    const dates: string[] = [];
    const d = new Date(startDate);
    for (let i = 0; i < duration; i++) {
        dates.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
    }

    const mealProperties = {
        lunch: mealDetailSchema,
        dinner: mealDetailSchema,
    };
    const mealRequired = ['lunch', 'dinner'];
    
    if (includeBreakfasts) {
        mealProperties['breakfast'] = mealDetailSchema;
        mealRequired.unshift('breakfast');
    }
    
    const dynamicMenuSchema = {
        type: Type.OBJECT,
        properties: dates.reduce((acc, date) => {
            acc[date] = {
                type: Type.OBJECT,
                properties: mealProperties,
                required: mealRequired
            };
            return acc;
        }, {} as any),
        required: dates,
    };
    
    const profileSummary = profiles.length > 0 
        ? profiles.map(p => `${p.name} (${p.age} años, ${p.gender}, Nivel de actividad: ${p.activityLevel}, Notas: ${p.notes || 'ninguna'})`).join('; ')
        : 'Default: a standard adult.';

    const userRecipeSummary = userRecipes.length > 0
        ? userRecipes.map(r => `${r.name} (Ingredientes: ${r.ingredients})`).join('; ')
        : 'Ninguna.';

    const prompt = `You are a professional chef and nutritionist specializing in Spanish cuisine. Your responses must be exclusively in Spanish from Spain.
Generate a meal plan for ${duration} days, starting from ${startDate}.
The family consists of: ${profileSummary}. It is crucial that the menu is specifically adapted to the individual needs described in each profile (e.g., high protein for athletes, calcium-rich foods for menopause concerns mentioned in the notes, etc.).
${includeBreakfasts ? 'Include breakfast, lunch, and dinner.' : 'Include lunch and dinner only.'}
Base your suggestions on Mediterranean diet principles, prioritizing seasonal and local Spanish products.
User preferences: "${preferences || 'No specific preferences'}".
Also consider incorporating these user-provided favorite recipes if possible: ${userRecipeSummary}.
For each meal, provide an object with the concise name of the dish and its category from the provided enum.
For breakfasts, always use the category 'Desayuno'. For other meals, classify them accurately (e.g., 'Lentejas con chorizo' is 'Legumbres', 'Paella de marisco' is 'Arroces').
Do NOT add any extra descriptions. Provide the output as a valid JSON object matching the requested schema. Only output the JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: dynamicMenuSchema,
        }
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as MenuPlan;
    } catch (e) {
        console.error("Failed to parse menu plan JSON:", response.text);
        throw new Error("Received invalid JSON format for the menu plan.");
    }
}

export async function getRecipeDetails(dishName: string, profiles: Profile[]): Promise<Recipe> {
    const profileSummary = profiles.length > 0 
        ? profiles.map(p => `${p.name} (${p.age} años, ${p.gender}, Nivel de actividad: ${p.activityLevel})`).join('; ')
        : '1 standard adult.';
    
    const prompt = `You are a professional chef and nutritionist specializing in Spanish cuisine. Your responses must be exclusively in Spanish from Spain.
Provide a detailed recipe for "${dishName}".
The recipe should be portioned for the following family: ${profileSummary}.
Include:
1. A list of ingredients with precise quantities.
2. Step-by-step instructions.
3. Estimated total calories for the whole dish.
4. A brief nutritional breakdown (protein, carbohydrates, fats) as strings (e.g., "Aproximadamente X g").
5. A motivational and scientific comment about the dish's benefits, like "Este plato es excelente para la recuperación muscular por su alto contenido en proteínas."
Provide the output as a valid JSON object matching the schema. Only output the JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: recipeGenerationSchema,
        }
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as Recipe;
    } catch (e) {
        console.error("Failed to parse recipe JSON:", response.text);
        throw new Error("Received invalid JSON format for the recipe.");
    }
}

export async function generateShoppingList(menuPlan: MenuPlan, profiles: Profile[]): Promise<ShoppingListItem[]> {
    const mealList = Object.values(menuPlan).flatMap(day => [day.breakfast?.name, day.lunch.name, day.dinner.name].filter(Boolean)).join(', ');
    const profileCount = profiles.length || 1;
    
    const prompt = `You are an expert grocery shopper. Your responses must be exclusively in Spanish from Spain. 
Based on the following meals for a week for ${profileCount} person(s), create a consolidated shopping list.
Combine quantities of the same ingredient.
Crucially, categorize each item into a logical supermarket section (e.g., 'Frutas y Verduras', 'Carnicería', 'Pescadería', 'Lácteos y Huevos', 'Panadería', 'Congelados', 'Bebidas', 'Despensa', 'Especias y Condimentos').
Meals: ${mealList}.
Provide the output as a valid JSON array of objects, where each object has "ingredient", "quantity" (as a string to handle ranges like "1-2"), "unit", and "category". Only output the JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: shoppingListSchema,
        }
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as ShoppingListItem[];
    } catch (e) {
        console.error("Failed to parse shopping list JSON:", response.text);
        throw new Error("Received invalid JSON format for the shopping list.");
    }
}