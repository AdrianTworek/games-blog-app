import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { api } from '@src/routes';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 250,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(
  cors({
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());
app.use('/api', api);

export { app };
