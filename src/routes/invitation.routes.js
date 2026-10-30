const express = require("express");

const {
  createInvitation,
  verifyInvitation,
  resendInvitationOtp,
  getAllInvitations,
  getInvitationById,
} = require("../controllers/invitation.controller");

const authenticate = require("../middlewares/auth.middleware");

const createInvitationRoutes = () => {
  const router = express.Router();

  // Authentication required
  router.use(authenticate);

  // Create invitation
  router.post("/", createInvitation);

  // Verify invitation OTP
  router.post("/verify-otp", verifyInvitation);

  // Resend invitation OTP
  router.post("/:id/resend-otp", resendInvitationOtp);

  // Get all invitations
  router.get("/", getAllInvitations);

  // Get invitation by ID
  router.get("/:id", getInvitationById);

  return router;
};

module.exports = { createInvitationRoutes };
