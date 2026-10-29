const invitationService = require("../services/invitation.service");

const createInvitation = async (req, res, next) => {
  try {
    const result = await invitationService.createInvitation(req.body);

    return res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInvitations = async (req, res, next) => {
  try {
    const result = await invitationService.getInvitations();

    return res.status(200).json({
      success: true,
      message: "Invitations fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvitation,
  getInvitations,
};
