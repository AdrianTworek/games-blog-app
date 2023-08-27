import { env } from '@src/config/env';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = env;

export const signTokens = (payload: string | Buffer | object) => {
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '5m',
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  });

  return { accessToken, refreshToken };
};

export const verifyJwt = ({
  token,
  refresh = false,
}: {
  token: string;
  refresh?: boolean;
}) => {
  try {
    return jwt.verify(
      token,
      refresh ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET
    );
  } catch (error) {
    return null;
  }
};

export const setJwtRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt_refresh', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day,
  });
};
