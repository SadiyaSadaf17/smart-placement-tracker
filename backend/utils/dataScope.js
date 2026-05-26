import { ROLES } from '../config/rbac.js';

const unrestrictedStaffRoles = new Set([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.PLACEMENT_OFFICER,
]);

export const hasUnrestrictedDataAccess = (req) =>
  unrestrictedStaffRoles.has(req.user?.role);

export const getScopedDepartment = (req) =>
  req.admin?.department && req.admin.department !== 'Training & Placement'
    ? req.admin.department
    : null;

export const applyStudentScope = (query, req) => {
  if (hasUnrestrictedDataAccess(req)) return query;

  if (req.user?.role === ROLES.DEPARTMENT_COORDINATOR) {
    const department = getScopedDepartment(req);
    return department ? { ...query, department } : { ...query, _id: null };
  }

  if (req.user?.role === ROLES.FACULTY_MENTOR) {
    const assignedStudents = req.admin?.assignedStudents || [];
    return assignedStudents.length ? { ...query, _id: { $in: assignedStudents } } : { ...query, _id: null };
  }

  return query;
};

export const applyDriveScope = (query, req) => {
  if (hasUnrestrictedDataAccess(req)) return query;

  if (req.user?.role === ROLES.DEPARTMENT_COORDINATOR) {
    const department = getScopedDepartment(req);
    if (!department) return { ...query, _id: null };
    return {
      ...query,
      $and: [
        ...(query.$and || []),
        {
          $or: [
            { 'eligibility.allowedDepartments': { $size: 0 } },
            { 'eligibility.allowedDepartments': department },
          ],
        },
      ],
    };
  }

  return query;
};

export const canAccessStudent = (student, req) => {
  if (hasUnrestrictedDataAccess(req)) return true;
  if (req.user?.role === ROLES.DEPARTMENT_COORDINATOR) {
    return Boolean(getScopedDepartment(req) && student.department === getScopedDepartment(req));
  }
  if (req.user?.role === ROLES.FACULTY_MENTOR) {
    return (req.admin?.assignedStudents || []).some((id) => String(id) === String(student._id));
  }
  return false;
};
