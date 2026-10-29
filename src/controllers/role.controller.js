const roleService = require("../services/role.service");

const createRole = async (req, res, next) => {
  try {
    const result = await roleService.createRole(req.body);

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const result = await roleService.getRoles();

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRole,
  getRoles,
};
