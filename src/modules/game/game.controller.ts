import { NextFunction, Request, Response } from 'express';
import {
  createGame,
  deleteGame,
  getGameById,
  getAllGames,
} from './game.service';
import { StatusCodes } from 'http-status-codes';
import { CreateGameInput, DeleteGameParams } from './game.schema';
import { AppError } from '@src/utils/appError';

export const getAllGamesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const games = await getAllGames({
      include: { author: { select: { email: true } } },
    });
    res.status(StatusCodes.OK).json(games);
  } catch (error) {
    next(error);
  }
};

export const createGameHandler = async (
  req: Request<object, object, CreateGameInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { description, title } = req.body;

    const game = await createGame({
      description,
      title,
      author: { connect: { email: req.user.email } },
    });

    res.status(StatusCodes.CREATED).json(game);
  } catch (error) {
    next(error);
  }
};

export const deleteGameHandler = async (
  req: Request<DeleteGameParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gameId } = req.params;

    const foundGame = await getGameById(gameId);

    if (!foundGame) {
      return next(
        new AppError(
          StatusCodes.NOT_FOUND,
          `Game with id=${gameId} was not found`
        )
      );
    }

    if (foundGame.author.email !== req.user.email) {
      return next(
        new AppError(
          StatusCodes.FORBIDDEN,
          'You cannot delete the game that you did not create'
        )
      );
    }

    await deleteGame(gameId);

    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};
