import React, { useEffect } from "react";
import axios from "../api/axiosConfig";

const NotificationBell = ({ onCounters }) => {

  const loadCounters = async () => {
    try {
      const res = await axios.get("/api/notifications", {
        withCredentials: true
      });

      onCounters({
        pendingSubs: res.data.pending_subs || 0,
        pendingHod: res.data.pending_hod || 0,
        pendingPrincipal: res.data.pending_principal || 0
      });

    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadCounters();
  }, []);

  return null; // No UI — sidebar shows numbers
};

export default NotificationBell;
