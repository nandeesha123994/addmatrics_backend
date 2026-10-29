const prisma = require("../lib/prisma");

const createRole = async (data) => {
  const { code, name, description } = data;

  if (!code || !name) {
    const error = new Error("Role code and name are required");
    error.statusCode = 400;
    throw error;
  }

  const existingRole = await prisma.role.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (existingRole) {
    const error = new Error("Role already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.role.create({
    data: {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description || null,
    },
  });
};

const getRoles = async () => {
  return prisma.role.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  createRole,
  getRoles,
};
