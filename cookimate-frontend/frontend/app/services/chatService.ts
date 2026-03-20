import {
  GlobalChatRequest,
  RecipeChatRequest,
  RecipeGenerationRequest,
} from '../types/chat';

// Replace with your actual backend URL
const API_BASE_URL = 'http://localhost:5000/api';

export const chatService = {
  async globalChat(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/global-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages } as GlobalChatRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Global chat error:', error);
      throw error;
    }
  },

  async recipeChat(recipeId: string, message: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/chat-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId, message } as RecipeChatRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Recipe chat error:', error);
      throw error;
    }
  },

  async generateRecipe(ingredients: string[], cuisine?: string, mealType?: string, prompt?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          cuisine,
          mealType,
          prompt,
        } as RecipeGenerationRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      return {
        recipe: data.recipe,
        image: data.image,
        title: data.title,
      };
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw error;
    }
  },
};