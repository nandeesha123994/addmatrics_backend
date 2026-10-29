const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    const permissions = req.user?.permissions || [];

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = permissionMiddleware;
