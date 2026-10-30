const express = require("express");

const {
  register,
  login,
  verifyMfaLogin,
  startMfaEnrollment,
  verifyMfaEnrollment,
  disableMfa,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const createAuthRoutes = () => {
  const router = express.Router();

  router.post("/register", register);
  router.post("/login", login);
  router.post("/mfa/verify", verifyMfaLogin);

  // Protected MFA management routes
  router.post("/mfa/enroll", authMiddleware, startMfaEnrollment);
  router.post("/mfa/enroll/verify", authMiddleware, verifyMfaEnrollment);
  router.post("/mfa/disable", authMiddleware, disableMfa);

  router.post("/refresh", refresh);
  router.post("/logout", logout);
  router.post("/forgot-password", forgotPassword);
  router.post("/reset-password", resetPassword);

  return router;
};

module.exports = { createAuthRoutes };
