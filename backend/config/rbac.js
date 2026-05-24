export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  PLACEMENT_OFFICER: 'placement_officer',
  DEPARTMENT_COORDINATOR: 'department_coordinator',
  FACULTY_MENTOR: 'faculty_mentor',
  READONLY_VIEWER: 'readonly_viewer',
  ADMIN: 'admin',
  STUDENT: 'student',
});

export const STAFF_ROLES = Object.freeze([
  ROLES.SUPER_ADMIN,
  ROLES.PLACEMENT_OFFICER,
  ROLES.DEPARTMENT_COORDINATOR,
  ROLES.FACULTY_MENTOR,
  ROLES.READONLY_VIEWER,
  ROLES.ADMIN,
]);

export const PERMISSIONS = Object.freeze({
  VIEW_DASHBOARD: 'dashboard:view',
  MANAGE_STUDENTS: 'students:manage',
  VIEW_STUDENTS: 'students:view',
  MANAGE_DRIVES: 'drives:manage',
  VIEW_DRIVES: 'drives:view',
  MANAGE_APPLICATIONS: 'applications:manage',
  VIEW_APPLICATIONS: 'applications:view',
  MANAGE_OFFERS: 'offers:manage',
  VIEW_OFFERS: 'offers:view',
  VIEW_ANALYTICS: 'analytics:view',
  VIEW_REPORTS: 'reports:view',
  VIEW_AUDIT_LOGS: 'audit:view',
  SEND_NOTIFICATIONS: 'notifications:send',
});

const allStaffPermissions = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: allStaffPermissions,
  [ROLES.ADMIN]: allStaffPermissions,
  [ROLES.PLACEMENT_OFFICER]: allStaffPermissions.filter((permission) => permission !== PERMISSIONS.VIEW_AUDIT_LOGS),
  [ROLES.DEPARTMENT_COORDINATOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VIEW_DRIVES,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.VIEW_OFFERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.FACULTY_MENTOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_DRIVES,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.VIEW_OFFERS,
  ],
  [ROLES.READONLY_VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_DRIVES,
    PERMISSIONS.VIEW_APPLICATIONS,
    PERMISSIONS.VIEW_OFFERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.STUDENT]: [],
});

export const hasPermission = (role, permission) =>
  Boolean(ROLE_PERMISSIONS[role]?.includes(permission));

export const isStaffRole = (role) => STAFF_ROLES.includes(role);
