import { Prisma } from '@prisma/client';
import { prisma } from '@src/db/prisma';

export const register = async (data: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data,
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};
