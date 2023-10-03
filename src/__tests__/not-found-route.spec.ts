import { app } from '@src/app';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

describe('not found route', () => {
  describe('given invalid route', () => {
    it('should return a 404', async () => {
      const { statusCode, body } = await request(app).get(
        '/api/not-found-route'
      );

      expect(statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(body).toEqual({ message: "Route '/not-found-route' not found" });
    });
  });
});
