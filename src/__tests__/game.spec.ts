import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { app } from '@src/app';
import * as AuthUtils from '@src/modules/auth/auth.utils';
import * as GameService from '@src/modules/game/game.service';

const jwtMock =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.6UnTfPwyE4KAIBggMrSXsuFZ-O-w8TPqdMEictuXJec';

const loggedUser = {
  email: 'test@test.com',
};

const gameMock = {
  id: '1',
  title: 'Game title',
  description: 'Game description',
  authorId: '1',
  createdAt: new Date('2023-09-16T16:38:01.152Z'),
  updatedAt: new Date('2023-09-16T16:38:01.152Z'),
  author: {
    email: 'invalid@test.com',
  },
};

const userGameMock = {
  id: '1',
  title: 'Game title',
  description: 'Game description',
  authorId: '1',
  createdAt: new Date('2023-09-16T16:38:01.152Z'),
  updatedAt: new Date('2023-09-16T16:38:01.152Z'),
  author: {
    email: loggedUser.email,
  },
};

describe('game', () => {
  describe('get all games', () => {
    it('should return a 200', async () => {
      const getAllGamesMock = jest.spyOn(GameService, 'getAllGames');

      getAllGamesMock.mockResolvedValue([]);

      const { statusCode } = await request(app).get('/api/games');

      expect(statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('create game', () => {
    describe('given user is not logged in', () => {
      it('should return a 401', async () => {
        await request(app).post('/api/games').expect(StatusCodes.UNAUTHORIZED);
      });
    });

    describe('given invalid input', () => {
      it('should return a 400', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        await request(app)
          .post('/api/games')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=token')
          .expect(StatusCodes.BAD_REQUEST);
      });
    });

    describe('given valid input', () => {
      it('should return a 201', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        const createGameMock = jest
          .spyOn(GameService, 'createGame')
          .mockResolvedValue(gameMock);

        await request(app)
          .post('/api/games')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=token')
          .send(gameMock)
          .expect(StatusCodes.CREATED);

        expect(createGameMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('given current user wants to delete a game which does not exist', () => {
      it('should return a 404', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        jest.spyOn(GameService, 'getGameById').mockResolvedValue(null);

        await request(app)
          .delete('/api/games/2')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=token')
          .expect(StatusCodes.NOT_FOUND);
      });
    });

    describe('given current user wants to delete game created by someone else', () => {
      it('should return a 403', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        jest.spyOn(GameService, 'getGameById').mockResolvedValue(gameMock);

        await request(app)
          .delete('/api/games/2')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=token')
          .expect(StatusCodes.FORBIDDEN);
      });
    });

    describe('given current user wants to delete his game', () => {
      it('should return a 204', async () => {
        jest.spyOn(AuthUtils, 'verifyJwt').mockReturnValue(loggedUser);

        jest.spyOn(GameService, 'getGameById').mockResolvedValue(userGameMock);

        const deleteGameMock = jest
          .spyOn(GameService, 'deleteGame')
          .mockResolvedValue(userGameMock);

        await request(app)
          .delete('/api/games/2')
          .set('Authorization', jwtMock)
          .set('Cookie', 'jwt_refresh=token')
          .expect(StatusCodes.NO_CONTENT);

        expect(deleteGameMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
