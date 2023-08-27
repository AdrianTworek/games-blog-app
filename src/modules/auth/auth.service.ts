import { Prisma, RefreshToken } from '@prisma/client';
import { prisma } from '@src/db/prisma';

export const register = async (data: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data,
    select: { id: true, email: true, createdAt: true, updatedAt: true },
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    include: { refreshTokens: true },
  });
};

export const findUserByRefreshToken = async (token: string) => {
  return await prisma.user.findFirst({
    where: {
      refreshTokens: {
        some: {
          token,
        },
      },
    },
    select: {
      id: true,
      email: true,
      refreshTokens: true,
    },
  });
};

export const invalidateUserRefreshTokens = async (email: string) => {
  return await prisma.user.update({
    where: { email },
    data: {
      refreshTokens: {
        deleteMany: {},
      },
    },
  });
};

export const setRefreshTokenArray = async (
  email: string,
  newRefreshTokens: RefreshToken[]
) => {
  return await prisma.user.update({
    where: { email },
    data: {
      refreshTokens: {
        set: newRefreshTokens,
      },
    },
  });
};

export const createRefreshToken = async (token: string, userId: string) => {
  return await prisma.refreshToken.create({
    data: { token, user: { connect: { id: userId } } },
  });
};

export const findRefreshTokenByUserId = async (userId: string) => {
  return await prisma.refreshToken.findFirst({ where: { userId } });
};

export const findRefreshToken = async (token: string) => {
  return await prisma.refreshToken.findUnique({ where: { token } });
};

export const deleteRefreshToken = async (token: string) => {
  return await prisma.refreshToken.delete({ where: { token } });
};
