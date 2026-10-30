const invitationService = require("../services/invitation.service");

const createInvitation = async (req, res, next) => {
  try {
    const employee = await require("../lib/prisma").platformEmployee.findUnique(
      {
        where: { userId: req.user.id },
        select: { id: true },
      },
    );

    if (!employee) {
      return res.status(403).json({
        success: false,
        message: "Only registered platform employees can create invitations",
      });
    }

    const result = await invitationService.createInvitation({
      ...req.body,
      invitedById: employee.id,
    });

    return res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY INVITATION OTP
const verifyInvitation = async (req, res, next) => {
  try {
    const { invitationId, otp } = req.body;

    const result = await invitationService.verifyInvitation(invitationId, otp);

    return res.status(200).json({
      success: true,
      message: "Invitation OTP verified successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// RESEND INVITATION OTP
const resendInvitationOtp = async (req, res, next) => {
  try {
    const result = await invitationService.resendInvitationOtp(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Invitation OTP sent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL INVITATIONS
const getAllInvitations = async (req, res, next) => {
  try {
    const result = await invitationService.getAllInvitations(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET INVITATION BY ID
const getInvitationById = async (req, res, next) => {
  try {
    const result = await invitationService.getInvitationById(req.params.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvitation,
  verifyInvitation,
  resendInvitationOtp,
  getAllInvitations,
  getInvitationById,
};
