import { USE_MOCK } from "../config/env";
import { readJSON, writeJSON } from "../utils/storage";
import http from "./http";

const buildKey = (role, email) => `notifications_${role}_${email}`;

const normalizeTimestamp = (value) => {
  if (typeof value === "number") return value;
  if (value) {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  return Date.now();
};

const safeReadList = (role, email) => {
  if (!role || !email) return [];
  const key = buildKey(role, email);
  const parsed = readJSON(key, []);
  if (!Array.isArray(parsed)) return [];
  return parsed;
};

const sortByCreatedAt = (list) =>
  [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const dispatchChange = (role, email) => {
  window.dispatchEvent(
    new CustomEvent("notifications:changed", { detail: { role, email } })
  );
};

export const notificationService = {
  notifKey(role, email) {
    return buildKey(role, email);
  },

  async getNotifications(role, email) {
    if (USE_MOCK) {
      const list = safeReadList(role, email).map((item) => ({
        ...item,
        createdAt: normalizeTimestamp(item.createdAt),
        readAt: item.readAt ? normalizeTimestamp(item.readAt) : null,
      }));
      return sortByCreatedAt(list);
    }
    const res = await http.get(`/api/notifications?role=${role}&email=${email}`);
    return res.json();
  },

  async getUnreadCount(role, email) {
    const list = await this.getNotifications(role, email);
    return list.filter((n) => !n.readAt).length;
  },

  async pushNotification(role, email, payload) {
    if (USE_MOCK) {
      if (!role || !email) {
        return { success: false, error: "Missing role or email" };
      }

      const existing = safeReadList(role, email);
      console.log("[notif push]", {
        role,
        email,
        key: buildKey(role, email),
        type: payload?.type,
      });
      const createdAt = normalizeTimestamp(payload?.createdAt);
      const readAt = payload?.readAt ? normalizeTimestamp(payload.readAt) : null;

      const notification = {
        id: payload?.id || `noti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: payload?.type || "system",
        title: payload?.title || "",
        message: payload?.message || "",
        actionUrl: payload?.actionUrl,
        threadId: payload?.threadId,
        internshipId: payload?.internshipId,
        createdAt,
        readAt,
      };

      const next = sortByCreatedAt([notification, ...existing]);
      writeJSON(buildKey(role, email), next);
      dispatchChange(role, email);
      return { success: true, notification };
    }
    const res = await http.post("/api/notifications", { role, email, payload });
    return res.json();
  },

  async markRead(role, email, id) {
    if (USE_MOCK) {
      if (!role || !email) return { success: false };
      const list = safeReadList(role, email);
      const now = Date.now();
      const next = list.map((n) =>
        n.id === id ? { ...n, readAt: n.readAt || now } : n
      );
      writeJSON(buildKey(role, email), next);
      dispatchChange(role, email);
      return { success: true };
    }
    const res = await http.post(`/api/notifications/${id}/read`, { role, email });
    return res.json();
  },

  async markAllRead(role, email) {
    if (USE_MOCK) {
      if (!role || !email) return { success: false };
      const now = Date.now();
      const list = safeReadList(role, email);
      const next = list.map((n) => ({ ...n, readAt: n.readAt || now }));
      writeJSON(buildKey(role, email), next);
      dispatchChange(role, email);
      return { success: true };
    }
    const res = await http.post(`/api/notifications/read-all`, { role, email });
    return res.json();
  },
};

