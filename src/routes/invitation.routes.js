const express = require("express");

const {
  createInvitation,
  getInvitations,
} = require("../controllers/invitation.controller");

const createInvitationRoutes = () => {
  const router = express.Router();

  router.post("/", createInvitation);
  router.get("/", getInvitations);

  return router;
};

module.exports = {
  createInvitationRoutes,
};
