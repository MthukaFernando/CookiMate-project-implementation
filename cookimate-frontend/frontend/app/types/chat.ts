export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface GlobalChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export interface RecipeChatRequest {
  recipeId: string;
  message: string;
}

export interface RecipeGenerationRequest {
  ingredients: string[];
  cuisine?: string;
  mealType?: string;
  prompt?: string;
}