const express = require("express");

const {
  createOnboarding,
  getOnboarding,
} = require("../controllers/onboarding.controller");

const createOnboardingRoutes = () => {
  const router = express.Router();

  router.post("/", createOnboarding);
  router.get("/:id", getOnboarding);

  return router;
};

module.exports = {
  createOnboardingRoutes,
};
