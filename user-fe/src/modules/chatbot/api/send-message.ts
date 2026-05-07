import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { API_URL_CHATBOT } from "@/constant/config";
import { apiClient } from "@/lib/api";
import type { ChatbotMessagePayload, ChatbotMessageResponse } from "@/modules/chatbot/types";

const sendChatbotMessage = async (payload: ChatbotMessagePayload): Promise<ChatbotMessageResponse> => {
  const response = await apiClient.post(`${API_URL_CHATBOT}/message`, payload);
  return response.data;
};

export const useSendChatbotMessage = (
  config?: UseMutationOptions<ChatbotMessageResponse, Error, ChatbotMessagePayload>,
) => {
  return useMutation<ChatbotMessageResponse, Error, ChatbotMessagePayload>({
    mutationFn: sendChatbotMessage,
    ...config,
  });
};
