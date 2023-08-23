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

export const createRefreshToken = async (token: string, userId: string) => {
  return await prisma.refreshToken.create({
    data: { token, user: { connect: { id: userId } } },
  });
};

export const findRefreshTokenByUserId = async (userId: string) => {
  return await prisma.refreshToken.findFirst({ where: { userId } });
};

export const findRefreshTokenByUserEmail = async (email: string) => {
  return await prisma.refreshToken.findFirst({ where: { user: { email } } });
};

export const deleteRefreshToken = async (token: string) => {
  return await prisma.refreshToken.delete({ where: { token } });
};
