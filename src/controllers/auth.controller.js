const authService = require("../services/auth.service");
const totpService = require("../services/totp.service");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: result.requiresMfa
        ? "MFA verification required"
        : "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyMfaLogin = async (req, res, next) => {
  try {
    const result = await authService.verifyMfaLogin(req.body);

    return res.status(200).json({
      success: true,
      message: "MFA verification successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Start MFA enrollment
const startMfaEnrollment = async (req, res, next) => {
  try {
    const result = await totpService.startTotpEnroll(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "MFA enrollment started",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP and enable MFA
const verifyMfaEnrollment = async (req, res, next) => {
  try {
    const { token, secret } = req.body;

    const result = await totpService.verifyTotpEnroll(
      req.user.userId,
      token,
      secret,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Disable MFA
const disableMfa = async (req, res, next) => {
  try {
    const result = await totpService.disableMfa(req.user.userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
