import request from 'supertest';
import { app } from '@src/app';
import { StatusCodes } from 'http-status-codes';

describe('Healthcheck endpoint', () => {
  test('should return healthcheck message', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toEqual(StatusCodes.OK);
    expect(res.body).toEqual({
      message: 'Welcome to games-blog API',
    });
  });
});
