const prisma = require("../lib/prisma");
const { sendInvitationOtp, verifyInvitationOtp } = require("./otp.service");

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const VALID_TARGET_TYPES = ["CLINIC", "ADVERTISER", "EMPLOYEE"];
const VALID_STATUSES = ["INVITED", "OTP_VERIFIED", "SIGNED_UP", "EXPIRED"];

// CREATE INVITATION
const createInvitation = async (data) => {
  const {
    targetType,
    contactName,
    organisationName,
    email,
    mobileNumber,
    invitedById,
    employeeId,
    firstName,
    lastName,
    roleCode,
  } = data;

  if (
    !targetType ||
    !contactName?.trim() ||
    !organisationName?.trim() ||
    !email?.trim()
  ) {
    throw createError(
      "Target type, contact name, organisation name and email are required",
    );
  }

  if (!VALID_TARGET_TYPES.includes(targetType)) {
    throw createError("Invalid invitation target type");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw createError("Please enter a valid email address");
  }

  // Verify inviting employee
  if (!invitedById) {
    throw createError("Inviting employee is required", 403);
  }

  const inviter = await prisma.platformEmployee.findUnique({
    where: { id: invitedById },
    select: { id: true },
  });

  if (!inviter) {
    throw createError("Inviting employee not found", 404);
  }

  // Check existing active invitation
  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      email: normalizedEmail,
      targetType,
      status: {
        in: ["INVITED", "OTP_VERIFIED"],
      },
    },
  });

  if (existingInvitation) {
    throw createError("An active invitation already exists", 409);
  }

  const invitation = await prisma.invitation.create({
    data: {
      targetType,
      contactName: contactName.trim(),
      organisationName: organisationName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber?.trim() || null,
      invitedById,
      employeeId: employeeId || null,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      roleCode: roleCode?.trim() || null,
      status: "INVITED",
    },
  });

  try {
    // Automatically send OTP
    await sendInvitationOtp(invitation.id);
  } catch (error) {
    // Remove invitation if OTP email could not be sent
    await prisma.invitation.delete({
      where: { id: invitation.id },
    });

    throw error;
  }

  return {
    invitation: {
      id: invitation.id,
      targetType: invitation.targetType,
      contactName: invitation.contactName,
      organisationName: invitation.organisationName,
      email: invitation.email,
      status: invitation.status,
      invitedAt: invitation.invitedAt,
    },
    message: "Invitation created and OTP sent successfully",
  };
};

// VERIFY INVITATION OTP
const verifyInvitation = async (invitationId, otp) => {
  if (!invitationId || !otp) {
    throw createError("Invitation ID and OTP are required");
  }

  return verifyInvitationOtp(invitationId, otp);
};

// RESEND INVITATION OTP
const resendInvitationOtp = async (invitationId) => {
  if (!invitationId) {
    throw createError("Invitation ID is required");
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw createError("Invitation not found", 404);
  }

  if (invitation.status !== "INVITED") {
    throw createError("OTP can only be resent for pending invitations");
  }

  return sendInvitationOtp(invitationId);
};

// GET ALL INVITATIONS
const getAllInvitations = async (filters = {}) => {
  const { status, targetType, page = 1, limit = 10 } = filters;

  if (status && !VALID_STATUSES.includes(status)) {
    throw createError("Invalid invitation status");
  }

  if (targetType && !VALID_TARGET_TYPES.includes(targetType)) {
    throw createError("Invalid invitation target type");
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

  const where = {};

  if (status) where.status = status;
  if (targetType) where.targetType = targetType;

  const [invitations, total] = await prisma.$transaction([
    prisma.invitation.findMany({
      where,
      orderBy: {
        invitedAt: "desc",
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        targetType: true,
        contactName: true,
        organisationName: true,
        email: true,
        mobileNumber: true,
        status: true,
        invitedAt: true,
        signedUpAt: true,
        invitedById: true,
      },
    }),

    prisma.invitation.count({ where }),
  ]);

  return {
    invitations,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// GET INVITATION BY ID
const getInvitationById = async (invitationId) => {
  if (!invitationId) {
    throw createError("Invitation ID is required");
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: {
      id: true,
      targetType: true,
      contactName: true,
      organisationName: true,
      email: true,
      mobileNumber: true,
      status: true,
      invitedAt: true,
      signedUpAt: true,
      invitedById: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      roleCode: true,
    },
  });

  if (!invitation) {
    throw createError("Invitation not found", 404);
  }

  return invitation;
};

module.exports = {
  createInvitation,
  verifyInvitation,
  resendInvitationOtp,
  getAllInvitations,
  getInvitationById,
};
