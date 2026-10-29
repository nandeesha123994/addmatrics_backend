const express = require("express");

const {
  createPermission,
  getPermissions,
} = require("../controllers/permission.controller");

const createPermissionRoutes = () => {
  const router = express.Router();

  router.post("/", createPermission);
  router.get("/", getPermissions);

  return router;
};

module.exports = {
  createPermissionRoutes,
};
