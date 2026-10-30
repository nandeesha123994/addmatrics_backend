const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { sendEmail } = require("./email.service");

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCK_MINUTES = 15;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// Send invitation OTP
const sendInvitationOtp = async (invitationId) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw createError("Invitation not found", 404);
  }

  const now = new Date();

  if (invitation.status !== "INVITED") {
    throw createError("Invitation is not available for OTP verification", 400);
  }

  if (invitation.otpLockedUntil && invitation.otpLockedUntil > now) {
    throw createError("OTP verification temporarily locked", 423);
  }

  if (invitation.lastOtpSentAt) {
    const secondsSinceLastOtp =
      (now.getTime() - invitation.lastOtpSentAt.getTime()) / 1000;

    if (secondsSinceLastOtp < OTP_RESEND_SECONDS) {
      throw createError("Please wait before requesting another OTP", 429);
    }
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpCodeHash = hashOtp(otp);

  const otpExpiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      otpCodeHash,
      otpExpiresAt,
      otpAttemptCount: 0,
      lastOtpSentAt: now,
      otpLockedUntil: null,
    },
  });

  try {
    await sendEmail({
      to: invitation.email,
      subject: "Admetrics Invitation OTP",
      html: `
        <h2>Welcome to Admetrics</h2>
        <p>Your invitation verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p>Please do not share this OTP with anyone.</p>
      `,
    });
  } catch (error) {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        otpCodeHash: null,
        otpExpiresAt: null,
      },
    });

    throw createError("Unable to send OTP email", 500);
  }

  return {
    message: "Invitation OTP sent successfully",
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  };
};

// Verify invitation OTP
const verifyInvitationOtp = async (invitationId, enteredOtp) => {
  if (!/^\d{6}$/.test(String(enteredOtp || ""))) {
    throw createError("Please enter a valid 6-digit OTP", 400);
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw createError("Invitation not found", 404);
  }

  const now = new Date();

  if (invitation.status !== "INVITED") {
    throw createError("Invitation is not available for verification", 400);
  }

  if (invitation.otpLockedUntil && invitation.otpLockedUntil > now) {
    throw createError("OTP verification temporarily locked", 423);
  }

  if (!invitation.otpCodeHash || !invitation.otpExpiresAt) {
    throw createError("Please request an OTP first", 400);
  }

  // OTP expiry does not expire the invitation.
  if (invitation.otpExpiresAt < now) {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        otpCodeHash: null,
        otpExpiresAt: null,
        otpAttemptCount: 0,
      },
    });

    throw createError("OTP has expired. Please request a new OTP.", 400);
  }

  const enteredOtpHash = hashOtp(String(enteredOtp));

  const isValid = crypto.timingSafeEqual(
    Buffer.from(enteredOtpHash, "hex"),
    Buffer.from(invitation.otpCodeHash, "hex"),
  );

  if (!isValid) {
    const attempts = invitation.otpAttemptCount + 1;

    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        otpAttemptCount: attempts,
        ...(attempts >= MAX_OTP_ATTEMPTS
          ? {
              otpLockedUntil: new Date(
                now.getTime() + OTP_LOCK_MINUTES * 60 * 1000,
              ),
            }
          : {}),
      },
    });

    throw createError("Invalid OTP", 400);
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: "OTP_VERIFIED",
      otpCodeHash: null,
      otpExpiresAt: null,
      otpAttemptCount: 0,
      otpLockedUntil: null,
    },
  });

  return {
    message: "Invitation OTP verified successfully",
  };
};

module.exports = {
  sendInvitationOtp,
  verifyInvitationOtp,
};
