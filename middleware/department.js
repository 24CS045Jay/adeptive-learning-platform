/**
 * Build the MongoDB filter for the authenticated user's department.
 * Department-scoped users, including HOD/admin accounts, are never allowed
 * to omit or override this predicate. Only super_admin is unrestricted.
 */
export function isSuperAdmin(user) {
  return String(user?.role || "").toLowerCase() === "super_admin";
}

export function getDepartmentId(user) {
  return user?.departmentId ?? user?.department ?? null;
}

export function departmentFilter(user, extra = {}) {
  if (isSuperAdmin(user)) return { ...extra };
  const departmentId = getDepartmentId(user);
  if (!departmentId) return null;
  return { ...extra, departmentId };
}

export function assertSameDepartment(user, targetDepartmentId) {
  if (isSuperAdmin(user)) return true;
  const ownDepartmentId = getDepartmentId(user);
  return Boolean(
    ownDepartmentId && targetDepartmentId && String(ownDepartmentId) === String(targetDepartmentId),
  );
}

export function requireDepartmentScope(req, res, next) {
  if (isSuperAdmin(req.user) || getDepartmentId(req.user)) return next();
  return res
    .status(403)
    .json({ error: "A department-scoped account requires a department assignment." });
}

export function scopedResourceFilter(req, res, extra = {}) {
  const filter = departmentFilter(req.user, extra);
  if (!filter) {
    res
      .status(403)
      .json({ error: "A department-scoped account requires a department assignment." });
    return null;
  }
  return filter;
}
