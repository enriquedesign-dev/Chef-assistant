import { GoogleGenAI, Type } from '@google/genai';

// Recipe schema for AI generation
const RecipeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "Recipe title",
      },
      description: {
        type: Type.STRING,
        description: "Brief description of the recipe",
      },
      difficulty: {
        type: Type.STRING,
        enum: ["Easy", "Medium", "Hard"],
        description: "Difficulty level of the recipe",
      },
      type: {
        type: Type.STRING,
        description: "Type of cuisine or meal category",
      },
      time: {
        type: Type.STRING,
        description: "Total cooking time (e.g., '30 minutes', '1 hour')",
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "Ingredient name",
            },
            quantity: {
              type: Type.STRING,
              description: "Quantity with unit (e.g., '2 cups', '1 tbsp')",
            },
          },
          propertyOrdering: ["name", "quantity"],
        },
        description: "List of ingredients with quantities",
      },
      instructions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: "Step-by-step cooking instructions",
      },
      servings: {
        type: Type.NUMBER,
        description: "Number of servings",
      },
    },
    propertyOrdering: ["title", "description", "difficulty", "type", "time", "ingredients", "instructions", "servings"],
  },
};

export interface GeneratedRecipe {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: string;
  time: string;
  ingredients: {
    name: string;
    quantity: string;
  }[];
  instructions: string[];
  servings: number;
}

export class AIService {
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
    console.log('🤖 AI Service: Initializing with API key:', apiKey ? '✅ Present' : '❌ Missing');
    
    if (!apiKey) {
      console.error('❌ AI Service: Google AI API key is required. Please add EXPO_PUBLIC_GOOGLE_AI_API_KEY to your .env file.');
      throw new Error('Google AI API key is required. Please add EXPO_PUBLIC_GOOGLE_AI_API_KEY to your .env file.');
    }
    this.genAI = new GoogleGenAI({ apiKey });
    console.log('✅ AI Service: Successfully initialized');
  }

  async generateRecipes(
    ingredients: string[],
    utensils: string[],
    preferences: {
      diet?: string;
      tastes?: string[];
      preferred_difficulty?: "Easy" | "Medium" | "Hard";
      preferred_time_minutes?: number;
      preferred_portions?: number;
    }
  ): Promise<GeneratedRecipe[]> {
    console.log('🤖 AI Service: Starting recipe generation...');
    console.log('📝 Ingredients:', ingredients);
    console.log('🔧 Utensils:', utensils);
    console.log('⚙️ Preferences:', preferences);

    try {
      const preferencesText = preferences.diet
        ? `Dietary preference: ${preferences.diet}. `
        : '';
      const tastesText = preferences.tastes && preferences.tastes.length > 0
        ? `Preferred cuisines: ${preferences.tastes.join(', ')}. `
        : '';
      const difficultyText = preferences.preferred_difficulty
        ? `Preferred difficulty: ${preferences.preferred_difficulty}. `
        : '';
      const timeText = preferences.preferred_time_minutes
        ? `Preferred cooking time: ${preferences.preferred_time_minutes} minutes. `
        : '';
      const portionsText = preferences.preferred_portions
        ? `Preferred portions: ${preferences.preferred_portions}. `
        : '';

      const prompt = `Generate exactly 2 different recipes using ONLY these ingredients: ${ingredients.join(', ')}. 
        Available utensils: ${utensils.join(', ')}.
        ${preferencesText}${tastesText}${difficultyText}${timeText}${portionsText}
        Important: Only use ingredients from the provided list. Do not add any ingredients not listed.
        Make sure the recipes are different from each other in terms of style and preparation.
        Return the recipes in the specified JSON format.`;

      console.log('📤 AI Service: Sending prompt to Gemini API...');
      console.log('📄 Prompt length:', prompt.length, 'characters');

      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RecipeSchema,
        },
      });

      console.log('📥 AI Service: Received response from Gemini API');
      console.log('📊 Response text length:', response.text?.length || 0, 'characters');

      if (!response.text) {
        console.error('❌ AI Service: No response text received');
        throw new Error('No response received from AI service.');
      }

      console.log('🔄 AI Service: Parsing JSON response...');
      const recipes = JSON.parse(response.text) as GeneratedRecipe[];
      
      console.log('✅ AI Service: Successfully generated', recipes.length, 'recipes');
      recipes.forEach((recipe, index) => {
        console.log(`🍳 Recipe ${index + 1}:`, recipe.title);
        console.log(`   - Difficulty: ${recipe.difficulty}`);
        console.log(`   - Type: ${recipe.type}`);
        console.log(`   - Time: ${recipe.time}`);
        console.log(`   - Servings: ${recipe.servings}`);
        console.log(`   - Ingredients: ${recipe.ingredients.length} items`);
        console.log(`   - Instructions: ${recipe.instructions.length} steps`);
      });

      return recipes;
    } catch (error) {
      console.error('❌ AI Service: Error generating recipes:', error);
      
      if (error instanceof Error) {
        console.error('❌ AI Service: Error message:', error.message);
        console.error('❌ AI Service: Error stack:', error.stack);
      }
      
      throw new Error('Failed to generate recipes. Please try again.');
    }
  }
}

export const aiService = new AIService();
