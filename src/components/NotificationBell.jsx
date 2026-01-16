import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotificationBadge } from "../hooks/useNotificationBadge";

const NotificationBell = ({ role }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotificationBadge(role);

  const handleClick = () => {
    if (role === "company") {
      navigate("/company/notifications");
      return;
    }
    navigate("/student/notifications");
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:opacity-70 transition-opacity"
      style={{ color: "#3F6FA6" }}
      title="Notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "#EF4444" }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
