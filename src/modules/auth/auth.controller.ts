import { NextFunction, Request, Response } from 'express';
import argon2 from 'argon2';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { AppError } from '@src/utils/appError';
import { LoginInput, RegisterInput } from './auth.schema';
import { findUserByEmail, register } from './auth.service';
import { setJwtCookie, signTokens } from './auth.utils';

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

    setJwtCookie(res, refreshToken);

    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    next(error);
  }
};
