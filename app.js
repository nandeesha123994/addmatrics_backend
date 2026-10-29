const express = require("express");
const cors = require("cors");

const { createAuthRoutes } = require("./src/routes/auth.routes");
const { createInvitationRoutes } = require("./src/routes/invitation.routes");
const { createRoleRoutes } = require("./src/routes/role.routes");
const { createPermissionRoutes } = require("./src/routes/permission.routes");
const { createUserRoutes } = require("./src/routes/user.routes");
const { createOnboardingRoutes } = require("./src/routes/onboarding.routes");

const errorMiddleware = require("./src/middlewares/error.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Addmatrics Backend API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// API routes
app.use("/api/auth", createAuthRoutes());
app.use("/api/invitations", createInvitationRoutes());
app.use("/api/roles", createRoleRoutes());
app.use("/api/permissions", createPermissionRoutes());
app.use("/api/users", createUserRoutes());
app.use("/api/onboarding", createOnboardingRoutes());

app.use(errorMiddleware);

// Export app
module.exports = app;
