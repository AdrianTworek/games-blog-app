import { NextFunction, Request, Response } from 'express';
import argon2 from 'argon2';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { AppError } from '@src/utils/appError';
import { LoginInput, RegisterInput } from './auth.schema';
import {
  createRefreshToken,
  deleteRefreshToken,
  findRefreshTokenByUserEmail,
  findRefreshTokenByUserId,
  findUserByEmail,
  register,
} from './auth.service';
import { setJwtRefreshCookie, signTokens, verifyJwt } from './auth.utils';

export const registerHandler = async (
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await argon2.hash(password);

    const user = await register({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(StatusCodes.CREATED).json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        next(
          new AppError(
            StatusCodes.CONFLICT,
            'User already exists, please use another email address'
          )
        );
      }
    }
    next(error);
  }
};

export const loginHandler = async (
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user || !(await argon2.verify(user.password, password))) {
      return next(new AppError(StatusCodes.BAD_REQUEST, 'Invalid credentials'));
    }

    const { accessToken, refreshToken } = signTokens(user.email);

    await createRefreshToken(refreshToken, user.id);

    setJwtRefreshCookie(res, refreshToken);

    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.jwt_refresh;
    const errorMessage = 'Could not refresh an access token';

    if (!refreshToken) {
      return next(new AppError(StatusCodes.UNAUTHORIZED, errorMessage));
    }

    const decoded = verifyJwt({ token: refreshToken, refresh: true }) as {
      email: string;
    };

    if (!decoded) {
      return next(new AppError(StatusCodes.UNAUTHORIZED, errorMessage));
    }

    const user = await findUserByEmail(decoded.email);

    if (!user) {
      return next(new AppError(StatusCodes.UNAUTHORIZED, errorMessage));
    }

    const dbRefreshToken = await findRefreshTokenByUserId(user.id);

    if (!dbRefreshToken) {
      return next(new AppError(StatusCodes.UNAUTHORIZED, errorMessage));
    }

    const { accessToken } = signTokens(user.email);

    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.jwt_refresh;
    if (!refreshToken) {
      return res.sendStatus(StatusCodes.NO_CONTENT);
    }

    const { user } = req;

    const dbRefreshToken = await findRefreshTokenByUserEmail(user.email);

    if (!dbRefreshToken) {
      res.clearCookie('jwt_refresh', { httpOnly: true });
      return res.sendStatus(StatusCodes.NO_CONTENT);
    }

    await deleteRefreshToken(dbRefreshToken.token);

    res.clearCookie('jwt_refresh', { httpOnly: true });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    next(error);
  }
};
