import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyJwt } from '@src/modules/auth/auth.utils';
import { AppError } from '@src/utils/appError';

export const deserializeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accessToken;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in')
      );
    }

    const decoded = verifyJwt(accessToken) as { email: string };
    console.log(decoded);

    if (!decoded) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in')
      );
    }

    req.user = decoded.email;
    next();
  } catch (error) {
    next(error);
  }
};
