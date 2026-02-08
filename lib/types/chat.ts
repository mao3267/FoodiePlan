export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface AiPlanMeal {
  name: string;
  day: string;
  time: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  servings: number;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  seasonings: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

export interface AiMessageResponse {
  type: "message";
  content: string;
}

export interface AiPlanResponse {
  type: "plan";
  content: string;
  weekStart: string;
  meals: AiPlanMeal[];
}

export type AiChatResponse = AiMessageResponse | AiPlanResponse;

export interface ChatApiMessageResponse {
  type: "message";
  content: string;
}

export interface ChatApiPlanResponse {
  type: "plan";
  content: string;
  weekStart: string;
  mealsAdded: number;
  mealNames: string[];
}

export type ChatApiResponse = ChatApiMessageResponse | ChatApiPlanResponse;
