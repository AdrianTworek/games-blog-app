import express from 'express';
import { validateRequest } from '@src/middleware/validateRequest';
import {
  loginHandler,
  registerHandler,
} from '@src/modules/auth/auth.controller';
import { loginSchema, registerSchema } from './auth.schema';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerHandler);
router.post('/login', validateRequest(loginSchema), loginHandler);

export { router as authRouter };
