import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../state/authStore";
import { notificationService } from "../services/notificationService";

const shouldRefresh = (detail, role, email) =>
  detail?.role === role && detail?.email === email;

export const useNotificationBadge = (role) => {
  const { email } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!role || !email) {
      setUnreadCount(0);
      return;
    }
    const count = await notificationService.getUnreadCount(role, email);
    setUnreadCount(count);
    if (role === "company") {
      console.log("[notif badge refresh]", { role: "company", email, unreadCount: count });
    }
  }, [role, email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!role || !email) return;
    const key = notificationService.notifKey(role, email);

    const handleStorage = (event) => {
      if (event.key === key) {
        refresh();
      }
    };

    const handleCustom = (event) => {
      if (shouldRefresh(event.detail, role, email)) {
        refresh();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("notifications:changed", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("notifications:changed", handleCustom);
    };
  }, [role, email, refresh]);

  return { unreadCount, refresh };
};
