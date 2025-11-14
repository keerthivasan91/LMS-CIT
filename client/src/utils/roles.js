export const ROLES = {
  STAFF: "staff",
  FACULTY: "faculty",
  HOD: "hod",
  ADMIN: "admin"
};

// Check if user is HOD
export const isHOD = (user) => user?.role === ROLES.HOD;

// Check if user is admin/principal
export const isAdmin = (user) => user?.role === ROLES.ADMIN;

// Faculty (non-staff, non-admin)
export const isFaculty = (user) =>
  user?.role !== ROLES.STAFF && user?.role !== ROLES.ADMIN;

// Basic permission mapping
export const PERMISSIONS = {
  APPLY_LEAVE: ["staff", "faculty", "hod"],
  APPROVE_SUBSTITUTE: ["faculty", "hod"],
  APPROVE_HOD: ["hod"],
  APPROVE_PRINCIPAL: ["admin"]
};

// Check if user is allowed to do something
export const can = (user, action) => {
  return PERMISSIONS[action]?.includes(user?.role);
};
