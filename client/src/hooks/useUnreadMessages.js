import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosClient from "../services/axios";

// Polls the unread-messages count so the sidebar can show a red badge.
// Refreshes on a light interval and whenever the route changes (e.g. after
// opening the messagerie, where threads get marked as read).
export default function useUnreadMessages(intervalMs = 15000) {
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const fetchCount = async () => {
      try {
        const { data } = await axiosClient.get("/api/messages/unread-count");
        if (active) setUnread(data.unread_count ?? 0);
      } catch {
        /* silent — badge just stays as-is */
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [intervalMs, location.pathname, location.search]);

  return unread;
}
