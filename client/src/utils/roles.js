// Role definitions - use consistent case
export const ROLES = {
  STAFF: "STAFF",
  FACULTY: "FACULTY",
  HOD: "HOD",
  ADMIN: "ADMIN",
  PRINCIPAL: "PRINCIPAL"  // Changed to uppercase to match your data
};

// Check if user is Principal (with case handling)
export const isPrincipal = (user) => {
  const role = user?.role?.toUpperCase();
  return role === ROLES.PRINCIPAL;
};

// Check if user is HOD
export const isHOD = (user) => {
  const role = user?.role?.toUpperCase();
  return role === ROLES.HOD;
};

// Check if user is admin/principal
export const isAdmin = (user) => {
  const role = user?.role?.toUpperCase();
  return role === ROLES.ADMIN;
};

// Faculty (non-staff, non-admin)
export const isFaculty = (user) => {
  const role = user?.role?.toUpperCase();
  return role === ROLES.FACULTY;
};

// Staff 
export const isStaff = (user) => {
  const role = user?.role?.toUpperCase();
  return role === ROLES.STAFF;
};

// Basic permission mapping (update to uppercase)
export const PERMISSIONS = {
  APPLY_LEAVE: ["STAFF", "FACULTY", "HOD", "ADMIN"],
  APPROVE_SUBSTITUTE: ["FACULTY", "HOD", "STAFF", "ADMIN"],
  APPROVE_HOD: ["HOD"],
  APPROVE_PRINCIPAL: ["PRINCIPAL"]
};

// Check if user is allowed to do something
export const can = (user, action) => {
  const userRole = user?.role?.toUpperCase();
  return PERMISSIONS[action]?.includes(userRole);
};