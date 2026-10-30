const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const prisma = require("../lib/prisma");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Generate MFA secret and QR code
const startTotpEnroll = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw createError("User not found", 404);

  if (user.mfaStatus === "ENABLED") {
    throw createError("MFA is already enabled", 400);
  }

  const secret = speakeasy.generateSecret({
    name: `Admetrics (${user.email})`,
    issuer: "Admetrics",
    length: 20,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode,
    message: "Scan the QR code using your authenticator app",
  };
};

// Verify and enable MFA
const verifyTotpEnroll = async (userId, token, secret) => {
  if (!secret || !token) {
    throw createError("Secret and OTP are required", 400);
  }

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: String(token),
    window: 1,
  });

  if (!verified) {
    throw createError("Invalid authenticator OTP", 400);
  }

  await prisma.userTotp.upsert({
    where: { userId },
    update: {
      secretEncrypted: secret,
      verifiedAt: new Date(),
    },
    create: {
      userId,
      secretEncrypted: secret,
      verifiedAt: new Date(),
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { mfaStatus: "ENABLED" },
  });

  return { message: "MFA enabled successfully" };
};

// Verify MFA login OTP
const verifyTotp = async (userId, token) => {
  const totpRecord = await prisma.userTotp.findUnique({
    where: { userId },
  });

  if (!totpRecord || !totpRecord.verifiedAt) {
    throw createError("MFA is not configured", 400);
  }

  const verified = speakeasy.totp.verify({
    secret: totpRecord.secretEncrypted,
    encoding: "base32",
    token: String(token),
    window: 1,
  });

  if (!verified) {
    throw createError("Invalid authenticator OTP", 401);
  }

  return { message: "MFA verification successful" };
};

// Disable MFA
const disableMfa = async (userId) => {
  await prisma.$transaction([
    prisma.userTotp.deleteMany({ where: { userId } }),
    prisma.mfaRecoveryCode.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        mfaStatus: "DISABLED",
        mfaDisabledAt: new Date(),
      },
    }),
  ]);

  return { message: "MFA disabled successfully" };
};

module.exports = {
  verifyTotp,
  startTotpEnroll,
  verifyTotpEnroll,
  disableMfa,
};