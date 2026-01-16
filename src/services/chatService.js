import { USE_MOCK } from "../config/env";
import { readJSON, writeJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../config/storageKeys";
import http from "./http";
import { notificationService } from "./notificationService";

// Helper to get all threads
const getAllThreads = () => {
  return readJSON(STORAGE_KEYS.CHAT_THREADS, []);
};

// Helper to save threads
const saveThreads = (threads) => {
  writeJSON(STORAGE_KEYS.CHAT_THREADS, threads);
};

const getThreadMessagesKey = (threadId) => `chatMessages_${threadId}`;

const readThreadMessages = (threadId) => {
  const messages = readJSON(getThreadMessagesKey(threadId), []);
  const safeMessages = Array.isArray(messages) ? messages : [];
  return safeMessages.sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
};

const writeThreadMessages = (threadId, messages) => {
  writeJSON(getThreadMessagesKey(threadId), messages);
};

const getThreadById = (threadId) => {
  const threads = getAllThreads();
  return threads.find((t) => t.id === threadId) || null;
};

const lastNotifiedAt = new Map();

const buildNotifyKey = (role, email, threadId) => `${role}|${email}|${threadId}`;

const shouldNotify = async (role, email, threadId) => {
  const key = buildNotifyKey(role, email, threadId);
  const last = lastNotifiedAt.get(key) || 0;
  const now = Date.now();
  if (now - last > 2000) return true;
  const unreadCount = await notificationService.getUnreadCount(role, email);
  return unreadCount === 0;
};

const noteNotified = (role, email, threadId) => {
  lastNotifiedAt.set(buildNotifyKey(role, email, threadId), Date.now());
};

export const chatService = {
  // Get or create thread (does not force enable)
  async getOrCreateThread({ internshipId, studentEmail, companyEmail, internshipTitle = '' }) {
    if (USE_MOCK) {
      const threads = getAllThreads();
      let thread = threads.find(
        (t) =>
          t.internshipId === internshipId &&
          t.studentEmail === studentEmail &&
          t.companyEmail === companyEmail
      );

      const now = new Date().toISOString();

      if (thread) {
        // Update existing thread metadata
        thread.updatedAt = now;
        if (internshipTitle) {
          thread.internshipTitle = internshipTitle;
        }
        saveThreads(threads);
        return thread;
      } else {
        // Create new thread
        thread = {
          id: `thr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          internshipId,
          internshipTitle: internshipTitle || '',
          studentEmail,
          companyEmail,
          enabled: false,
          createdAt: now,
          updatedAt: now,
        };
        threads.push(thread);
        saveThreads(threads);
        return thread;
      }
    }
    const res = await http.post("/api/chat/threads", {
      internshipId,
      internshipTitle,
      studentEmail,
      companyEmail,
    });
    return res.json();
  },

  // Enable an existing thread
  async enableThread(threadId) {
    if (USE_MOCK) {
      const threads = getAllThreads();
      const thread = threads.find((t) => t.id === threadId);
      if (thread) {
        thread.enabled = true;
        thread.updatedAt = new Date().toISOString();
        saveThreads(threads);
        return thread;
      }
      return null;
    }
    const res = await http.put(`/api/chat/threads/${threadId}/enable`);
    return res.json();
  },

  // Get threads for a student (enabled only, sorted by updatedAt desc)
  async getStudentThreads(studentEmail) {
    if (USE_MOCK) {
      const threads = getAllThreads();
      const studentThreads = threads.filter(
        (t) => t.studentEmail === studentEmail && t.enabled
      );
      return studentThreads.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt);
        const bTime = new Date(b.updatedAt || b.createdAt);
        return bTime - aTime; // Descending
      });
    }
    const res = await http.get(`/api/chat/threads?studentEmail=${studentEmail}`);
    return res.json();
  },

  // Get threads for a company (enabled only, sorted by updatedAt desc)
  async getCompanyThreads(companyEmail) {
    if (USE_MOCK) {
      const threads = getAllThreads();
      const companyThreads = threads.filter(
        (t) => t.companyEmail === companyEmail && t.enabled
      );
      return companyThreads.sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt);
        const bTime = new Date(b.updatedAt || b.createdAt);
        return bTime - aTime; // Descending
      });
    }
    const res = await http.get(`/api/chat/threads?companyEmail=${companyEmail}`);
    return res.json();
  },

  // Get messages for a thread (sorted asc by createdAt)
  async getMessages(threadId) {
    if (USE_MOCK) {
      if (!threadId) return [];
      return readThreadMessages(threadId);
    }
    const res = await http.get(`/api/chat/threads/${threadId}/messages`);
    return res.json();
  },

  // Send message
  async sendMessage(threadId, { senderEmail, senderRole, text, type = 'text' }) {
    if (USE_MOCK) {
      const thread = getThreadById(threadId);
      if (
        !thread ||
        !thread.enabled ||
        (thread.studentEmail !== senderEmail && thread.companyEmail !== senderEmail)
      ) {
        throw new Error("Thread not enabled or not a participant");
      }

      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        threadId,
        senderEmail,
        senderRole,
        text,
        type,
        createdAt: new Date().toISOString(),
      };
      const messages = readThreadMessages(threadId);
      messages.push(newMessage);
      writeThreadMessages(threadId, messages);

      // Update thread updatedAt
      const threads = getAllThreads();
      const targetThread = threads.find((t) => t.id === threadId);
      if (targetThread) {
        targetThread.updatedAt = newMessage.createdAt;
        saveThreads(threads);
      }

      const previewText = (text || "").slice(0, 60);
      if (thread.enabled && senderEmail) {
        if (senderRole === "student" && thread.companyEmail) {
          const ok = await shouldNotify("company", thread.companyEmail, threadId);
          if (ok) {
            await notificationService.pushNotification("company", thread.companyEmail, {
              type: "message",
              title: "New message from student",
              message: `${thread.internshipTitle || "Internship"}: ${previewText}${(text || "").length > 60 ? "…" : ""}`,
              threadId: thread.id,
              internshipId: thread.internshipId,
              actionUrl: `/company/chat?threadId=${thread.id}`,
              createdAt: Date.now(),
              readAt: null,
            });
            noteNotified("company", thread.companyEmail, threadId);
          }
        }
        if (senderRole === "company" && thread.studentEmail) {
          const ok = await shouldNotify("student", thread.studentEmail, threadId);
          if (ok) {
            await notificationService.pushNotification("student", thread.studentEmail, {
              type: "message",
              title: "New message from HR",
              message: `${thread.internshipTitle || "Internship"}: ${previewText}${(text || "").length > 60 ? "…" : ""}`,
              threadId: thread.id,
              internshipId: thread.internshipId,
              actionUrl: `/student/chat?threadId=${thread.id}`,
              createdAt: Date.now(),
              readAt: null,
            });
            noteNotified("student", thread.studentEmail, threadId);
          }
        }
      }
      return newMessage;
    }
    const allowed = await this.isParticipantEnabledThread(threadId, senderEmail);
    if (!allowed) {
      throw new Error("Thread not enabled or not a participant");
    }
    const res = await http.post(`/api/chat/threads/${threadId}/messages`, {
      senderEmail,
      senderRole,
      text,
      type,
    });
    const message = await res.json();
    let thread = null;
    if (await this.isParticipantEnabledThread(threadId, senderEmail)) {
      try {
        const threadRes = await http.get(`/api/chat/threads/${threadId}`);
        thread = await threadRes.json();
      } catch (error) {
        console.error("Failed to load thread for notification:", error);
      }
    }
    if (thread && thread.enabled) {
      const previewText = (text || "").slice(0, 60);
      if (senderRole === "student" && thread.companyEmail) {
        const ok = await shouldNotify("company", thread.companyEmail, threadId);
        if (ok) {
          await notificationService.pushNotification("company", thread.companyEmail, {
            type: "message",
            title: "New message from student",
            message: `${thread.internshipTitle || "Internship"}: ${previewText}${(text || "").length > 60 ? "…" : ""}`,
            threadId: thread.id,
            internshipId: thread.internshipId,
            actionUrl: `/company/chat?threadId=${thread.id}`,
            createdAt: Date.now(),
            readAt: null,
          });
          noteNotified("company", thread.companyEmail, threadId);
        }
      }
      if (senderRole === "company" && thread.studentEmail) {
        const ok = await shouldNotify("student", thread.studentEmail, threadId);
        if (ok) {
          await notificationService.pushNotification("student", thread.studentEmail, {
            type: "message",
            title: "New message from HR",
            message: `${thread.internshipTitle || "Internship"}: ${previewText}${(text || "").length > 60 ? "…" : ""}`,
            threadId: thread.id,
            internshipId: thread.internshipId,
            actionUrl: `/student/chat?threadId=${thread.id}`,
            createdAt: Date.now(),
            readAt: null,
          });
          noteNotified("student", thread.studentEmail, threadId);
        }
      }
    }
    return message;
  },

  async isParticipantEnabledThread(threadId, email) {
    if (!threadId || !email) return false;
    if (USE_MOCK) {
      const threads = getAllThreads();
      const thread = threads.find((t) => t.id === threadId);
      if (!thread || !thread.enabled) return false;
      return thread.studentEmail === email || thread.companyEmail === email;
    }
    try {
      const res = await http.get(`/api/chat/threads/${threadId}`);
      const thread = await res.json();
      if (!thread || !thread.enabled) return false;
      return thread.studentEmail === email || thread.companyEmail === email;
    } catch (error) {
      console.error('Failed to verify thread access:', error);
      return false;
    }
  },

  // Legacy methods for backward compatibility
  async ensureThreadEnabled({ internshipId, internshipTitle, studentEmail, companyEmail }) {
    const thread = await this.getOrCreateThread({
      internshipId,
      studentEmail,
      companyEmail,
      internshipTitle,
    });
    return this.enableThread(thread?.id);
  },

  async getThreadsForStudent(studentEmail) {
    return this.getStudentThreads(studentEmail);
  },

  async getThreadsForCompany(companyEmail) {
    return this.getCompanyThreads(companyEmail);
  },
};
