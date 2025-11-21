const dayjs = require("dayjs");

module.exports = {
  formatDate(date) {
    if (!date) return null;
    return dayjs(date).format("YYYY-MM-DD");
  },

  formatDateTime(date) {
    if (!date) return null;
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
  },

  formatName(name = "") {
    return name.trim().replace(/\s+/g, " ");
  },

  formatSession(session) {
    if (!session) return null;
    const s = session.toLowerCase();
    if (s.startsWith("f")) return "Forenoon";
    if (s.startsWith("a")) return "Afternoon";
    return session;
  }
};
