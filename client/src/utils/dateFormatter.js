// Format: 2025-02-15 → Feb 15, 2025
export const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

// Format date + session → "Feb 15, 2025 (Forenoon)"
export const formatDateWithSession = (dateStr, session) => {
  return `${formatDate(dateStr)}${session ? ` (${session})` : ""}`;
};

// Format timestamp → "2h ago" / "1 day ago"
export const timeAgo = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const past = new Date(timestamp);
  const diff = (now - past) / 1000;

  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";

  return formatDate(timestamp);
};
