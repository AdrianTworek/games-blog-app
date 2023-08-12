import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { authRouter } from '@src/modules/auth/auth.routes';
import { globalErrorHandler } from '@src/middleware/globalErrorHandler';

const router = express.Router();

// Healthcheck
router.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to games-blog API' });
});

// Routes
router.use('/auth', authRouter);

// Global error handler
router.use(globalErrorHandler);

export { router as api };
