const permissionService = require("../services/permission.service");

const createPermission = async (req, res, next) => {
  try {
    const result = await permissionService.createPermission(req.body);

    return res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPermissions = async (req, res, next) => {
  try {
    const result = await permissionService.getPermissions();

    return res.status(200).json({
      success: true,
      message: "Permissions fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPermission,
  getPermissions,
};
