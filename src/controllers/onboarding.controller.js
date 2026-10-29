const onboardingService = require("../services/onboarding.service");

const createOnboarding = async (req, res, next) => {
  try {
    const result = await onboardingService.createOnboarding(req.body);

    return res.status(201).json({
      success: true,
      message: "Onboarding created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOnboarding = async (req, res, next) => {
  try {
    const result = await onboardingService.getOnboarding(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Onboarding details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOnboarding,
  getOnboarding,
};
