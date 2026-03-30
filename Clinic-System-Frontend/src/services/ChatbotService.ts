import api from "./Api";

export interface CreateConversationResponse {
    conversationId: string;
}

export interface ChatResponse {
    success: boolean;
    message: string;
}

/**
 * Tạo một cuộc hội thoại mới với chatbot
 */
export const createConversation = async (): Promise<CreateConversationResponse> => {
    try {
        const response = await api.post("/chatbot/new-conversation");
        return response.data;
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
    }
};

/**
 * Gửi tin nhắn đến chatbot
 * @param message Nội dung tin nhắn
 * @param conversationId ID của cuộc hội thoại
 */
export const sendChatMessage = async (
    message: string,
    conversationId: string
): Promise<ChatResponse> => {
    try {
        const response = await api.post("/chatbot/chat", {
            message,
            conversationId,
        });
        return response.data;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw error;
    }
};
