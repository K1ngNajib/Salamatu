const { hasPermission } = require('../services/roleService');

const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role || 'personnel';

  if (!hasPermission(role, permission)) {
    return res.status(403).json({
      message: `Forbidden. ${role} role lacks ${permission} permission.`,
      error: true,
    });
  }

  return next();
};

module.exports = requirePermission;
