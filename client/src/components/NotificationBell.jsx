import React, { useEffect } from "react";
import axios from "../api/axiosConfig";
import { useQuery } from "@tanstack/react-query";

const NotificationBell = ({ onCounters }) => {

  // Fetch with caching
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () =>
      axios
        .get("/notifications", { withCredentials: true })
        .then(res => res.data),
    staleTime: 60000,      // cache data for 1 minute
    refetchOnWindowFocus: false
  });

  // Update counters only when data changes
  useEffect(() => {
    if (!data) return;

    onCounters({
      pendingSubs: data.pending_subs || 0,
      pendingHod: data.pending_hod || 0,
      pendingPrincipal: data.pending_principal || 0
    });

  }, [data, onCounters]);

  return null; // no UI
};

export default React.memo(NotificationBell);
