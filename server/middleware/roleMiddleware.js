// Role-based authorization middleware (ES module)
// Provides granular role checks for route protection

export const ROLES = {
  ADMIN: 1,
  SELLER: 2
};

// Friendly role name constants for newer clients
export const ROLE_NAMES = {
  ADMIN: 'admin',
  SELLER: 'seller'
};

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || req.user.role === undefined) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Accept multiple shapes for user role (roles array, role string, role_id)
    const resolved = (() => {
      if (!req.user) return null;
      // roles array may contain strings or numeric ids
      if (Array.isArray(req.user.roles) && req.user.roles.length) return req.user.roles[0];
      if (req.user.role !== undefined) return req.user.role;
      if (req.user.role_id !== undefined) return req.user.role_id;
      return null;
    })();

    const normalizedAllowed = allowedRoles.map((r) => (typeof r === 'string' ? r : Number(r)));

    const isAllowed = normalizedAllowed.some((allowed) => {
      if (resolved === null || resolved === undefined) return false;
      // string match
      if (typeof allowed === 'string' && typeof resolved === 'string') return allowed === resolved;
      // numeric compare
      if (typeof allowed === 'number' && !isNaN(Number(resolved))) return Number(resolved) === allowed;
      // allow 'admin' string to match numeric admin id
      if (allowed === 'admin' && (resolved === 'admin' || Number(resolved) === ROLES.ADMIN || Number(resolved) === ROLES.SUPER_ADMIN)) return true;
      return false;
    });

    if (!isAllowed) {
      return res.status(403).json({
        error: 'Insufficient permissions for this action',
        userRole: resolved,
        requiredRoles: normalizedAllowed,
      });
    }

    return next();
  };
}

export function requireAdmin(req, res, next) {
  return requireRole('admin', ROLES.ADMIN, ROLES.SUPER_ADMIN)(req, res, next);
}

export function requireSuperAdmin(req, res, next) {
  return requireRole(ROLES.SUPER_ADMIN)(req, res, next);
}

export function requireSecretary(req, res, next) {
  return requireRole(ROLES.SECRETARY)(req, res, next);
}

export function requireDriver(req, res, next) {
  return requireRole(ROLES.DRIVER)(req, res, next);
}

export function requireSupervisor(req, res, next) {
  return requireRole(ROLES.SUPERVISOR)(req, res, next);
}

export function requireCustomer(req, res, next) {
  return requireRole(ROLES.CUSTOMER, 'buyer')(req, res, next);
}

// Allow seller or buyer (non-admin) access
export function requireSellerOrBuyer(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const resolved = Array.isArray(req.user.roles) && req.user.roles.length ? req.user.roles[0] : (req.user.role ?? req.user.role_id);
  const isAdmin = (Array.isArray(req.user.roles) && (req.user.roles.includes('admin') || req.user.roles.includes(ROLES.ADMIN))) ||
    (typeof req.user.role === 'string' && req.user.role.toLowerCase() === 'admin') ||
    (req.user.role_id !== undefined && Number(req.user.role_id) === ROLES.ADMIN);

  if (isAdmin) {
    return res.status(403).json({ error: 'Admins not allowed for this route' });
  }

  // If resolved exists and is not admin, allow (covers seller/buyer)
  if (resolved !== undefined && resolved !== null) return next();

  return res.status(403).json({ error: 'Insufficient role' });
}

export function requireOwnerOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const targetUserId = Number(req.params.id);
  const currentUserId = Number(req.user.id || req.user.userId || req.user.user_id);
  const userRole = Number(req.user.role || req.user.role_id || 0);

  const isOwner = currentUserId && targetUserId && currentUserId === targetUserId;
  const isAdmin = [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole);

  if (!isOwner && !isAdmin) {
    console.warn(
      `Access denied: User ${currentUserId} attempted to access data of user ${targetUserId} without authorization`
    );
    return res.status(403).json({
      error: 'You can only access your own data',
      attemptedUserId: targetUserId,
      currentUserId,
    });
  }

  return next();
}

export default {
  ROLES,
  requireRole,
  requireAdmin,
  
};
