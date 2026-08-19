// Enforce tenant isolation for franchise operations
const requireTenant = (req, res, next) => {
  // Super Admins can operate across all tenants (or specify tenant via query/body)
  if (req.user && req.user.role === 'superadmin') {
    if (req.query.tenantId) {
      req.targetTenantId = req.query.tenantId;
    }
    return next();
  }

  // Franchise users must have an associated tenant
  if (!req.tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: No franchise tenant associated with this user.'
    });
  }

  req.targetTenantId = req.tenantId;
  next();
};

module.exports = { requireTenant };
