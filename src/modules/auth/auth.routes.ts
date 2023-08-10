import express from 'express';
import { validateRequest } from '@src/middleware/validateRequest';
import { registerHandler } from '@src/modules/auth/auth.controller';
import { registerSchema } from './auth.schema';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerHandler);

export { router as authRouter };
