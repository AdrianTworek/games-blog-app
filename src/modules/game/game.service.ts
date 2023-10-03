import { Prisma } from '@prisma/client';
import { prisma } from '@src/db/prisma';

export const getAllGames = async (data?: Prisma.GameFindManyArgs) => {
  return await prisma.game.findMany(data);
};

export const getGameById = async (id: string) => {
  return await prisma.game.findUnique({
    where: { id },
    include: { author: { select: { email: true } } },
  });
};

export const createGame = async (data: Prisma.GameCreateInput) => {
  return await prisma.game.create({ data });
};

export const deleteGame = async (id: string) => {
  return await prisma.game.delete({ where: { id } });
};
