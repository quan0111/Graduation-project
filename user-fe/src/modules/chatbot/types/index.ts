export interface ChatbotProduct {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  shopName?: string | null;
  categoryName?: string | null;
  reason?: string | null;
  relationType?: string | null;
}

export interface ChatbotSource {
  sourceId: string;
  title: string;
  type: string;
  score: number;
  productId?: number | null;
  route?: string | null;
}

export interface ChatbotHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatbotMessagePayload {
  message: string;
  productId?: number;
  history?: ChatbotHistoryMessage[];
}

export interface ChatbotMessageResponse {
  answer: string;
  intent: string;
  suggestions: string[];
  products: ChatbotProduct[];
  sources: ChatbotSource[];
}
