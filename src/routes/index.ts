import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { authRouter } from '@src/modules/auth/auth.routes';
import { globalErrorHandler } from '@src/middleware/globalErrorHandler';

const router = express.Router();

/**
 * @openapi
 * /api:
 *   get:
 *     tags:
 *       - Healthcheck
 *     summary: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
router.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to games-blog API' });
});

// Routes
router.use('/auth', authRouter);

// Global error handler
router.use(globalErrorHandler);

// Not found route
router.all('*', (req, res) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: `Route '${req.url}' not found` });
});

export { router as api };
