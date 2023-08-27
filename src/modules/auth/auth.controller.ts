import { NextFunction, Request, Response } from 'express';
import argon2 from 'argon2';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { env } from '@src/config/env';
import { StatusCodes } from 'http-status-codes';
import { Prisma, RefreshToken } from '@prisma/client';
import { AppError } from '@src/utils/appError';
import { LoginInput, RegisterInput } from './auth.schema';
import {
  createRefreshToken,
  deleteRefreshToken,
  findRefreshToken,
  findUserByEmail,
  findUserByRefreshToken,
  invalidateUserRefreshTokens,
  register,
  setRefreshTokenArray,
} from './auth.service';
import { setJwtRefreshCookie, signTokens, verifyJwt } from './auth.utils';

const { REFRESH_TOKEN_SECRET } = env;

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
    const refreshToken = req.cookies.jwt_refresh;
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user || !(await argon2.verify(user.password, password))) {
      return next(new AppError(StatusCodes.BAD_REQUEST, 'Invalid credentials'));
    }

    const { accessToken, refreshToken: newRefreshToken } = signTokens({
      email: user.email,
    });

    // Check refresh token reuse
    if (refreshToken) {
      const foundToken = await findRefreshToken(refreshToken);

      if (!foundToken) {
        await invalidateUserRefreshTokens(user.email);
      }

      await deleteRefreshToken(refreshToken);
      res.clearCookie('jwt_refresh', { httpOnly: true });
    }

    await createRefreshToken(newRefreshToken, user.id);

    setJwtRefreshCookie(res, newRefreshToken);

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
    res.clearCookie('jwt_refresh', { httpOnly: true });

    const decoded = verifyJwt({ token: refreshToken, refresh: true }) as {
      email: string;
    };

    if (!decoded) {
      return next(new AppError(StatusCodes.FORBIDDEN, errorMessage));
    }

    const foundUser = await findUserByRefreshToken(refreshToken);

    // Detected refresh token reuse
    if (!foundUser) {
      const hackedUser = await findUserByEmail(decoded.email);

      if (!hackedUser) {
        return next(new AppError(StatusCodes.FORBIDDEN, errorMessage));
      }

      await invalidateUserRefreshTokens(hackedUser.email);
    }

    const newRefreshTokenArr = foundUser?.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    ) as RefreshToken[];

    jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      async (err: VerifyErrors | null, decoded: unknown) => {
        if (err) {
          await setRefreshTokenArray(
            foundUser?.email ?? '',
            newRefreshTokenArr
          );
        }
        if (err || foundUser?.email !== (decoded as { email: string }).email) {
          return next(new AppError(StatusCodes.FORBIDDEN, errorMessage));
        }

        const { accessToken, refreshToken: newRefreshToken } = signTokens({
          email: (decoded as { email: string }).email,
        });

        await createRefreshToken(newRefreshToken, foundUser?.id ?? '');

        setJwtRefreshCookie(res, newRefreshToken);

        res.status(StatusCodes.OK).json({ accessToken });
      }
    );
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

    const dbRefreshToken = await findRefreshToken(refreshToken);

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
