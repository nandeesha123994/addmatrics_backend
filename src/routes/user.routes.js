const express = require("express");

const { getUsers, getUserById } = require("../controllers/user.controller");

const createUserRoutes = () => {
  const router = express.Router();

  router.get("/", getUsers);
  router.get("/:id", getUserById);

  return router;
};

module.exports = {
  createUserRoutes,
};
