const prisma = require("../lib/prisma");
const crypto = require("crypto");

const createInvitation = async (data) => {
  const { email, roleId, invitedById, expiresAt } = data;

  if (!email || !roleId || !invitedById) {
    const error = new Error("Email, role ID, and inviter ID are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role || !role.isActive) {
    const error = new Error("Active role not found");
    error.statusCode = 404;
    throw error;
  }

  const inviter = await prisma.user.findUnique({
    where: { id: invitedById },
  });

  if (!inviter) {
    const error = new Error("Inviting user not found");
    error.statusCode = 404;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("This email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const expiry = expiresAt
    ? new Date(expiresAt)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
    const error = new Error("Invitation expiry must be a future date");
    error.statusCode = 400;
    throw error;
  }

  const invitation = await prisma.invitation.create({
    data: {
      email: normalizedEmail,
      roleId,
      invitedById,
      tokenHash,
      expiresAt: expiry,
    },
    select: {
      id: true,
      email: true,
      roleId: true,
      invitedById: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  // Return the raw token only once so it can later be sent by email.
  return {
    invitation,
    token,
  };
};

const getInvitations = async () => {
  return prisma.invitation.findMany({
    select: {
      id: true,
      email: true,
      roleId: true,
      invitedById: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  createInvitation,
  getInvitations,
};
