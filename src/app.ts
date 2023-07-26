import express from 'express';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';

const app = express();
app.use(morgan('dev'));

// Healthcheck
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to games-blog API' });
});

export { app };
