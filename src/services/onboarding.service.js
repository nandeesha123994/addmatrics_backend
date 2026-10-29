const prisma = require("../lib/prisma");

const createOnboarding = async (data) => {
  const {
    userId,
    clinicName,
    contactPersonName,
    medicalRegistrationNumber,
    clinicLicenseNumber,
    mobileNumber,
    email,
    address,
    city,
    state,
    country,
    pincode,
  } = data;

  if (
    !clinicName ||
    !contactPersonName ||
    !medicalRegistrationNumber ||
    !clinicLicenseNumber ||
    !mobileNumber ||
    !email ||
    !address ||
    !city ||
    !state ||
    !country ||
    !pincode
  ) {
    const error = new Error("All required clinic details must be provided");
    error.statusCode = 400;
    throw error;
  }

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingClinic = await prisma.clinic.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingClinic) {
    const error = new Error("A clinic with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.clinic.create({
    data: {
      userId: userId || null,
      clinicName,
      contactPersonName,
      medicalRegistrationNumber,
      clinicLicenseNumber,
      mobileNumber,
      email: normalizedEmail,
      address,
      city,
      state,
      country,
      pincode,
    },
  });
};

const getOnboarding = async (id) => {
  if (!id) {
    const error = new Error("Clinic ID is required");
    error.statusCode = 400;
    throw error;
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      specialities: true,
      workingDays: true,
      sessions: true,
      photos: true,
    },
  });

  if (!clinic) {
    const error = new Error("Clinic onboarding record not found");
    error.statusCode = 404;
    throw error;
  }

  return clinic;
};

module.exports = {
  createOnboarding,
  getOnboarding,
};
