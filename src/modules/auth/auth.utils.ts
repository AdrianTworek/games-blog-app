import { env } from '@src/config/env';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = env;

export const signTokens = (email: string) => {
  const accessToken = jwt.sign({ email }, ACCESS_TOKEN_SECRET, {
    expiresIn: '5m',
  });
  const refreshToken = jwt.sign({ email }, REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  });

  return { accessToken, refreshToken };
};

export const verifyJwt = (accessToken: string) => {
  try {
    return jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

export const setJwtCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};
