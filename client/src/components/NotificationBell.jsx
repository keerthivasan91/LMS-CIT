import React, { useEffect, useState, useRef } from "react";
import axios from "../api/axiosConfig";
import "../App.css";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const bellRef = useRef(null);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications");
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.post(`/notifications/read/${id}`);
      loadNotifications();   // refresh
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Close dropdown when user clicks outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-container" ref={bellRef}>
      <div className="notification-bell" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </div>

      {open && (
        <div className="notif-dropdown">
          <h4>Notifications</h4>

          {notifications.length === 0 && (
            <p className="notif-empty">No notifications</p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.read ? "" : "unread"}`}
              onClick={() => markAsRead(n.id)}
            >
              <p>{n.message}</p>
              <span className="notif-time">{n.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
