function getEffectiveRoleForLeave(role, designation) {
  const d = (designation || "").toLowerCase();

  // Principal always stays principal
  if (role === "principal") return "principal";

  // Treat these like HODs (direct to principal)
  if (
    d.includes("dean") ||
    d.includes("director")
  ) {
    return "hod";
  }

  // Default behavior
  return role;
}

module.exports = { getEffectiveRoleForLeave };
