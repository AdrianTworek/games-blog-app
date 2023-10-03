import express from 'express';
import {
  createGameHandler,
  deleteGameHandler,
  getAllGamesHandler,
} from './game.controller';
import { requireUser } from '@src/middleware/requireUser';
import { deserializeUser } from '@src/middleware/deserializeUser';
import { validateRequest } from '@src/middleware/validateRequest';
import { createGameSchema } from './game.schema';

const router = express.Router();

/**
 * @openapi
 * /api/games:
 *   get:
 *     tags:
 *       - Game
 *     summary: Gets all games
 *     responses:
 *      200:
 *        description: Success
 */
router.get('/', getAllGamesHandler);

router.use(deserializeUser, requireUser);

/**
 * @openapi
 * /api/games:
 *   post:
 *     tags:
 *       - Game
 *     summary: Creates a new game
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateGameInput'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateGameResponse'
 *      400:
 *        description: Bad request
 */
router.post('/', validateRequest(createGameSchema), createGameHandler);

/**
 * @openapi
 * /api/games/{gameId}:
 *   delete:
 *     tags:
 *       - Game
 *     summary: Deletes a game
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *     responses:
 *      204:
 *        description: Success
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not found
 */
router.delete('/:gameId', deleteGameHandler);

export { router as gameRouter };
