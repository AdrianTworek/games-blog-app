import express from 'express';
import { validateRequest } from '@src/middleware/validateRequest';
import {
  loginHandler,
  logoutHandler,
  refreshAccessTokenHandler,
  registerHandler,
} from '@src/modules/auth/auth.controller';
import { loginSchema, registerSchema } from './auth.schema';
import { deserializeUser } from '@src/middleware/deserializeUser';
import { requireUser } from '@src/middleware/requireUser';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registers a new user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RegisterResponse'
 *      409:
 *        description: Conflict
 *      400:
 *        description: Bad request
 */
router.post('/register', validateRequest(registerSchema), registerHandler);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logs a user in
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/LoginInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginResponse'
 *      400:
 *        description: Bad request
 */
router.post('/login', validateRequest(loginSchema), loginHandler);

/**
 * @openapi
 * /api/auth/refresh:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Refreshes an access token
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginResponse'
 *      401:
 *        description: Not authenticated
 *      403:
 *        description: Not authorized
 */
router.get('/refresh', refreshAccessTokenHandler);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logs a user out
 *     responses:
 *      204:
 *        description: Success
 *      400:
 *        description: Bad request
 *      401:
 *        description: Not authenticated
 */
router.post('/logout', deserializeUser, requireUser, logoutHandler);

export { router as authRouter };
