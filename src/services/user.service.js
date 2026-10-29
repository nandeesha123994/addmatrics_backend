const prisma = require("../lib/prisma");

const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      status: true,
      emailVerifiedAt: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getUserById = async (id) => {
  if (!id) {
    const error = new Error("User ID is required");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      status: true,
      emailVerifiedAt: true,
      mfaStatus: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  getUsers,
  getUserById,
};
