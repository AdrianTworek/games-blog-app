import express from 'express';
import { StatusCodes } from 'http-status-codes';

const router = express.Router();

// Healthcheck
router.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to games-blog API' });
});

export { router as api };
