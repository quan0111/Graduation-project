export interface ChatbotProduct {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  shopName?: string | null;
  categoryName?: string | null;
}

export interface ChatbotMessagePayload {
  message: string;
  productId?: number;
}

export interface ChatbotMessageResponse {
  answer: string;
  intent: string;
  suggestions: string[];
  products: ChatbotProduct[];
}
