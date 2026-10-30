const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyTotp } = require("./totp.service");

const MAX_LOGIN_ATTEMPTS = 5;
const MAX_MFA_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 7;
const MFA_CHALLENGE_EXPIRY_MINUTES = 5;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    throw createError("A valid email is required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    throw createError("Please provide a valid email address", 400);
  }

  return normalizedEmail;
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createAccessToken = (user, roles) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw createError("JWT_SECRET must contain at least 32 characters", 500);
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      roles,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: "addmatrics-api",
      audience: "addmatrics-client",
    },
  );
};

const getUserRoles = async (userId) => {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      role: { isActive: true },
    },
    select: {
      role: {
        select: { code: true },
      },
    },
  });

  return userRoles.map((item) => item.role.code);
};

// CREATE SESSION AND TOKENS
const createLoginResponse = async (user, mfaVerified = false) => {
  const roles = await getUserRoles(user.id);

  const accessToken = createAccessToken(user, roles);
  const refreshToken = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.authSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt,
      mfaVerifiedAt: mfaVerified ? new Date() : null,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      roles,
    },
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: 900,
    refreshTokenExpiresAt: expiresAt,
  };
};

// REGISTER
const register = async (data) => {
  const { email, password } = data || {};
  const normalizedEmail = normalizeEmail(email);

  if (typeof password !== "string" || password.length < 8) {
    throw createError("Password must be at least 8 characters long", 400);
  }

  if (password.length > 72) {
    throw createError("Password is too long", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    throw createError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    return await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw createError("Email is already registered", 409);
    }

    throw error;
  }
};

// LOGIN
const login = async (data) => {
  const { email, password } = data || {};
  const normalizedEmail = normalizeEmail(email);

  if (typeof password !== "string" || !password) {
    throw createError("Password is required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const now = new Date();

  if (user.status !== "ACTIVE") {
    throw createError("Your account is not active", 403);
  }

  if (user.lockedUntil && user.lockedUntil > now) {
    throw createError("Account temporarily locked", 423);
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    const attempts = user.failedLoginAttempts + 1;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        ...(attempts >= MAX_LOGIN_ATTEMPTS
          ? {
              lockedUntil: new Date(
                now.getTime() + LOCK_DURATION_MINUTES * 60000,
              ),
            }
          : {}),
      },
    });

    throw createError("Invalid email or password", 401);
  }

  if (user.mfaStatus === "ENABLED") {
    if (user.mfaLockedUntil && user.mfaLockedUntil > now) {
      throw createError("MFA temporarily locked", 423);
    }

    const challengeToken = crypto.randomBytes(32).toString("hex");

    await prisma.mfaChallenge.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(challengeToken),
        purpose: "LOGIN",
        expiresAt: new Date(
          now.getTime() + MFA_CHALLENGE_EXPIRY_MINUTES * 60000,
        ),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return {
      requiresMfa: true,
      challengeToken,
      expiresIn: MFA_CHALLENGE_EXPIRY_MINUTES * 60,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: now,
    },
  });

  return createLoginResponse(user);
};

// VERIFY MFA LOGIN
const verifyMfaLogin = async (data) => {
  const { challengeToken, otp } = data || {};

  if (
    typeof challengeToken !== "string" ||
    typeof otp !== "string" ||
    !/^\d{6}$/.test(otp)
  ) {
    throw createError(
      "Valid challenge token and 6-digit OTP are required",
      400,
    );
  }

  const challenge = await prisma.mfaChallenge.findUnique({
    where: { tokenHash: hashToken(challengeToken) },
    include: { user: true },
  });

  if (!challenge || challenge.purpose !== "LOGIN") {
    throw createError("Invalid MFA challenge", 401);
  }

  const now = new Date();
  const user = challenge.user;

  if (challenge.consumedAt || challenge.expiresAt <= now) {
    throw createError("MFA challenge is invalid or expired", 401);
  }

  if (user.status !== "ACTIVE") {
    throw createError("Your account is not active", 403);
  }

  if (user.mfaLockedUntil && user.mfaLockedUntil > now) {
    throw createError("MFA temporarily locked", 423);
  }

  const verified = await verifyTotp(user.id, otp).then(
    () => true,
    () => false,
  );

  if (!verified) {
    const attempts = user.failedMfaAttempts + 1;

    await prisma.$transaction([
      prisma.mfaChallenge.update({
        where: { id: challenge.id },
        data: { attemptCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          failedMfaAttempts: attempts,
          ...(attempts >= MAX_MFA_ATTEMPTS
            ? {
                mfaLockedUntil: new Date(
                  now.getTime() + LOCK_DURATION_MINUTES * 60000,
                ),
              }
            : {}),
        },
      }),
    ]);

    throw createError("Invalid authenticator code", 401);
  }

  await prisma.mfaChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: now },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedMfaAttempts: 0,
      mfaLockedUntil: null,
      lastLoginAt: now,
    },
  });

  return createLoginResponse(user, true);
};

// REFRESH ACCESS TOKEN
const refreshAccessToken = async (data) => {
  const { refreshToken } = data || {};

  if (typeof refreshToken !== "string" || !refreshToken) {
    throw createError("Refresh token is required", 400);
  }

  const tokenHash = hashToken(refreshToken);
  const now = new Date();

  const session = await prisma.authSession.findUnique({
    where: { refreshTokenHash: tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= now) {
    throw createError("Invalid or expired refresh token", 401);
  }

  if (session.user.status !== "ACTIVE") {
    throw createError("Your account is not active", 403);
  }

  const newRefreshToken = crypto.randomBytes(64).toString("hex");
  const newExpiresAt = new Date(
    now.getTime() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );

  const result = await prisma.$transaction(async (tx) => {
    const revoked = await tx.authSession.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });

    if (revoked.count !== 1) {
      throw createError("Refresh token has already been used", 401);
    }

    await tx.authSession.create({
      data: {
        userId: session.userId,
        refreshTokenHash: hashToken(newRefreshToken),
        expiresAt: newExpiresAt,
        mfaVerifiedAt: session.mfaVerifiedAt,
      },
    });

    const roles = await getUserRoles(session.userId);

    return {
      accessToken: createAccessToken(session.user, roles),
      refreshToken: newRefreshToken,
    };
  });

  return {
    ...result,
    tokenType: "Bearer",
    expiresIn: 900,
    refreshTokenExpiresAt: newExpiresAt,
  };
};

// LOGOUT
const logout = async (data) => {
  const { refreshToken } = data || {};

  if (typeof refreshToken !== "string" || !refreshToken) {
    throw createError("Refresh token is required", 400);
  }

  await prisma.authSession.updateMany({
    where: {
      refreshTokenHash: hashToken(refreshToken),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return {
    message: "Logout successful",
  };
};
// FORGOT PASSWORD
const forgotPassword = async (data) => {
  const email = normalizeEmail(data?.email);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Same response whether the account exists or not.
  if (!user) {
    return {
      message: "If the account exists, a reset link will be sent.",
    };
  }

  if (user.status !== "ACTIVE") {
    return {
      message: "If the account exists, a reset link will be sent.",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(resetToken);
  const now = new Date();

  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      data: { consumedAt: now },
    });

    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });
  });

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    await prisma.passwordResetToken.updateMany({
      where: { tokenHash, consumedAt: null },
      data: { consumedAt: now },
    });

    throw createError("Password reset configuration is missing", 500);
  }

  const resetLink = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${resetToken}`;

  try {
    const { sendEmail } = require("./email.service");

    await sendEmail({
      to: user.email,
      subject: "Admetrics Password Reset",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });
  } catch (error) {
    await prisma.passwordResetToken.updateMany({
      where: { tokenHash, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    throw createError("Unable to send password reset email", 500);
  }

  return {
    message: "If the account exists, a reset link will be sent.",
  };
};

// RESET PASSWORD
const resetPassword = async (data) => {
  const { token, newPassword } = data || {};

  if (typeof token !== "string" || !token) {
    throw createError("Reset token is required", 400);
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw createError("Password must be at least 8 characters", 400);
  }

  if (newPassword.length > 72) {
    throw createError("Password is too long", 400);
  }

  const tokenHash = hashToken(token);
  const now = new Date();

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetRecord || resetRecord.consumedAt || resetRecord.expiresAt <= now) {
    throw createError("Invalid or expired reset link", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({
      where: {
        id: resetRecord.id,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      data: { consumedAt: now },
    });

    if (consumed.count !== 1) {
      throw createError("Reset link has already been used", 400);
    }

    await tx.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Revoke existing sessions after password reset.
    await tx.authSession.updateMany({
      where: {
        userId: resetRecord.userId,
        revokedAt: null,
      },
      data: { revokedAt: now },
    });
  });

  return {
    message: "Password reset successfully. Please log in again.",
  };
};

module.exports = {
  register,
  login,
  verifyMfaLogin,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
};
