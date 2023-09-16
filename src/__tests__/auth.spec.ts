/* eslint-disable @typescript-eslint/ban-ts-comment */
import request from 'supertest';
import argon2 from 'argon2';
import { app } from '@src/app';
import { StatusCodes } from 'http-status-codes';
import * as AuthService from '@src/modules/auth/auth.service';
import * as AuthUtils from '@src/modules/auth/auth.utils';
import { Prisma } from '@prisma/client';

const invalidUserRegisterInput = {
  email: 'test@test',
  password: 'test',
  passwordConfirm: 'test1',
};

const validUserRegisterInput = {
  email: 'test@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
};

const validUserRegisterResult = {
  id: '1',
  email: 'test@test.com',
  createdAt: new Date('2023-09-16T16:38:01.152Z'),
  updatedAt: new Date('2023-09-16T16:38:01.152Z'),
};

const validUserLoginInput = {
  email: 'test@test.com',
  password: 'test1234',
};

const invalidUserLoginInput = {
  email: 'test@test',
  password: 'test1234',
};

const foundUserMock = {
  id: '1',
  email: 'test@test.com',
  password: 'test1234',
  createdAt: new Date('2023-09-16T16:38:01.152Z'),
  updatedAt: new Date('2023-09-16T16:38:01.152Z'),
  refreshTokens: [],
};

const refreshTokenMock = {
  id: '1',
  token: 'token',
  userId: '1',
  createdAt: new Date('2023-09-16T16:38:01.152Z'),
  updatedAt: new Date('2023-09-16T16:38:01.152Z'),
};

const jwtMock =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.6UnTfPwyE4KAIBggMrSXsuFZ-O-w8TPqdMEictuXJec';

const loggedUser = {
  email: 'test@test.com',
};

describe('auth', () => {
  describe('register', () => {
    describe('given empty input', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/register')
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given invalid email address', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({
            ...validUserRegisterInput,
            email: invalidUserRegisterInput.email,
          })
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given too short password', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({
            ...validUserRegisterInput,
            password: invalidUserRegisterInput.password,
          })
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given invalid password confirmation', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({
            ...validUserRegisterInput,
            passwordConfirm: 'doesnotmatch',
          })
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given valid input', () => {
      it('should return a 201', async () => {
        const registerMock = jest.spyOn(AuthService, 'register');
        registerMock.mockResolvedValue(validUserRegisterResult);

        const res = await request(app)
          .post('/api/auth/register')
          .send(validUserRegisterInput)
          .expect(StatusCodes.CREATED);

        expect(res.body).toEqual({
          ...validUserRegisterResult,
          createdAt: validUserRegisterResult.createdAt.toISOString(),
          updatedAt: validUserRegisterResult.createdAt.toISOString(),
        });
      });
    });

    describe('given duplicate email address', () => {
      it('should return a 409', async () => {
        const registerMock = jest.spyOn(AuthService, 'register');
        registerMock.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Error', {
            code: 'P2002',
            clientVersion: '',
          })
        );

        const res = await request(app)
          .post('/api/auth/register')
          .send(validUserRegisterInput)
          .expect(StatusCodes.CONFLICT);

        expect(res.body.message).toContain('User already exists');
      });
    });

    describe('given there is an error', () => {
      it('should return a 500', async () => {
        const findUserByEmailMock = jest.spyOn(AuthService, 'findUserByEmail');

        findUserByEmailMock.mockRejectedValue(new Error('Database error'));

        await request(app)
          .post('/api/auth/register')
          .send(validUserRegisterInput)
          .expect(StatusCodes.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('login', () => {
    describe('given empty input', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/login')
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given invalid email address', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({ ...validUserLoginInput, email: invalidUserLoginInput.email })
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given valid input', () => {
      it('should return a 200 and set a cookie', async () => {
        jest
          .spyOn(AuthService, 'findUserByEmail')
          .mockResolvedValue(foundUserMock);
        jest.spyOn(argon2, 'verify').mockResolvedValue(true);
        jest
          .spyOn(AuthService, 'createRefreshToken')
          .mockResolvedValue(refreshTokenMock);

        const res = await request(app)
          .post('/api/auth/login')
          .send(validUserLoginInput)
          .expect(StatusCodes.OK);

        expect(res.header['set-cookie']).toBeDefined();
      });
    });

    describe('given there is an error', () => {
      it('should return a 500', async () => {
        const findUserByEmailMock = jest.spyOn(AuthService, 'findUserByEmail');

        findUserByEmailMock.mockRejectedValue(new Error('Database error'));

        await request(app)
          .post('/api/auth/login')
          .send(validUserLoginInput)
          .expect(StatusCodes.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('refresh', () => {
    describe('given user is not logged in', () => {
      it('should return a 401', async () => {
        await request(app)
          .get('/api/auth/refresh')
          .expect(StatusCodes.UNAUTHORIZED);
      });
    });

    describe('given there is no refresh token', () => {
      it('should return a 401', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        await request(app)
          .get('/api/auth/refresh')
          .set('Authorization', jwtMock)
          .expect(StatusCodes.UNAUTHORIZED);
      });
    });

    describe('given there is a refresh token reuse detection', () => {
      it('should return a 403', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        const findUserByRefreshTokenMock = jest.spyOn(
          AuthService,
          'findUserByRefreshToken'
        );
        const findUserByEmailMock = jest.spyOn(AuthService, 'findUserByEmail');

        findUserByRefreshTokenMock.mockResolvedValue(null);
        findUserByEmailMock.mockResolvedValue(null);

        await request(app)
          .get('/api/auth/refresh')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=token')
          .expect(StatusCodes.FORBIDDEN);
      });
    });

    describe('given there is an error', () => {
      it('should return a 500', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        const findRefreshTokenMock = jest.spyOn(
          AuthService,
          'findRefreshToken'
        );

        findRefreshTokenMock.mockRejectedValue(new Error('Database error'));

        await request(app)
          .get('/api/auth/refresh')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=invalid_token')
          .expect(StatusCodes.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('logout', () => {
    describe('given user is not logged in', () => {
      it('should return a 401', async () => {
        await request(app)
          .post('/api/auth/logout')
          .expect(StatusCodes.UNAUTHORIZED);
      });
    });

    describe('given valid refresh token', () => {
      it('should clear cookie and return a 204', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        const findRefreshTokenMock = jest.spyOn(
          AuthService,
          'findRefreshToken'
        );
        const deleteRefreshTokenMock = jest.spyOn(
          AuthService,
          'deleteRefreshToken'
        );

        findRefreshTokenMock.mockResolvedValue(refreshTokenMock);
        deleteRefreshTokenMock.mockResolvedValue(refreshTokenMock);

        const res = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=token')
          .expect(StatusCodes.NO_CONTENT);

        expect(deleteRefreshTokenMock).toHaveBeenCalledWith(
          refreshTokenMock.token
        );
        expect(res.header['set-cookie']).toEqual([
          'jwt_refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
        ]);
      });
    });

    describe('given invalid refresh token exists', () => {
      it('should clear cookie and return a 204', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        const findRefreshTokenMock = jest.spyOn(
          AuthService,
          'findRefreshToken'
        );
        const deleteRefreshTokenMock = jest.spyOn(
          AuthService,
          'deleteRefreshToken'
        );

        findRefreshTokenMock.mockResolvedValue(null);

        const res = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=invalid_token')
          .expect(StatusCodes.NO_CONTENT);

        expect(deleteRefreshTokenMock).not.toHaveBeenCalled();
        expect(res.header['set-cookie']).toEqual([
          'jwt_refresh=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
        ]);
      });
    });

    describe('given refresh token is not provided', () => {
      it('should return a 204', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        const findRefreshTokenMock = jest.spyOn(
          AuthService,
          'findRefreshToken'
        );
        const deleteRefreshTokenMock = jest.spyOn(
          AuthService,
          'deleteRefreshToken'
        );

        findRefreshTokenMock.mockResolvedValue(null);

        const res = await request(app)
          .post('/api/auth/logout')
          .set('Authorization', jwtMock)
          .expect(StatusCodes.NO_CONTENT);

        expect(deleteRefreshTokenMock).not.toHaveBeenCalled();
        expect(res.header['set-cookie']).toBeUndefined();
      });
    });

    describe('given there is an error', () => {
      it('should return a 500', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        const findRefreshTokenMock = jest.spyOn(
          AuthService,
          'findRefreshToken'
        );

        findRefreshTokenMock.mockRejectedValue(new Error('Database error'));

        await request(app)
          .post('/api/auth/logout')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=invalid_token')
          .expect(StatusCodes.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
