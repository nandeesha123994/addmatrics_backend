const { createAuthService } = require("./services/auth.service");
const { createAuthController } = require("./controllers/auth.controller");
const { createAuthMiddleware } = require("./middlewares/auth.middleware");

function createContainer({ db, config, mailer }) {
  // Create the authentication service
  const authService = createAuthService({
    db,
    config,
    mailer,
  });

  // Create the authentication controller
  const authController = createAuthController({
    authService,
  });

  // Create authentication middleware
  const authMiddleware = createAuthMiddleware({
    config,
    db,
  });

  // Return dependencies for the API routes
  return {
    authController,
    authMiddleware,
  };
}

module.exports = { createContainer };
