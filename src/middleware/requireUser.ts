import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/appError';

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req;

    if (!user) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in')
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
