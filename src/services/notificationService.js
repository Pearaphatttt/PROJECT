import { USE_MOCK } from "../config/env";
import { notificationsMock } from "../mocks/notifications.mock";
import http from "./http";

export const notificationService = {
  async getAll() {
    if (USE_MOCK) {
      return notificationsMock;
    }
    const res = await http.get("/api/notifications");
    return res.json();
  },

  async markAllRead() {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post("/api/notifications/read-all");
    return res.json();
  },
};

