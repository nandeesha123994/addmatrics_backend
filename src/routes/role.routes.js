const express = require("express");

const { createRole, getRoles } = require("../controllers/role.controller");

const createRoleRoutes = () => {
  const router = express.Router();

  router.post("/", createRole);
  router.get("/", getRoles);

  return router;
};

module.exports = {
  createRoleRoutes,
};
