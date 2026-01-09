import { USE_MOCK } from "../config/env";
import { chatMock } from "../mocks/chat.mock";
import http from "./http";

export const chatService = {
  async getThreadForMatched(internshipId) {
    if (USE_MOCK) {
      return chatMock[internshipId] || [];
    }
    const res = await http.get(`/api/chat/${internshipId}`);
    return res.json();
  },

  async sendMessage(internshipId, text) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: "student",
        senderName: "You",
        text,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      return newMessage;
    }
    const res = await http.post(`/api/chat/${internshipId}/message`, { text });
    return res.json();
  },
};

