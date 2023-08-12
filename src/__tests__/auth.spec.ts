/* eslint-disable @typescript-eslint/ban-ts-comment */
import request from 'supertest';
import { app } from '@src/app';
import { StatusCodes } from 'http-status-codes';
import * as AuthService from '@src/modules/auth/auth.service';

const invalidUserInput = {
  email: 'test@test',
  password: 'test',
  passwordConfirm: 'test1',
};

const validUserInput = {
  email: 'test@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
};

const userPayload = {
  email: 'test@test.com',
  password: 'test1234',
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
          .send({ ...validUserInput, email: invalidUserInput.email })
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given too short password', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({ ...validUserInput, password: invalidUserInput.password })
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given invalid password confirmation', () => {
      it('should return a 400', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({
            ...validUserInput,
            passwordConfirm: 'doesnotmatch',
          })
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given valid input', () => {
      it('should return a 201', async () => {
        jest
          .spyOn(AuthService, 'register')
          // @ts-ignore
          .mockReturnValueOnce(userPayload);

        const { statusCode, body } = await request(app)
          .post('/api/auth/register')
          .send(validUserInput);

        expect(statusCode).toBe(StatusCodes.CREATED);
        expect(body).toEqual(userPayload);
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
  });
});
