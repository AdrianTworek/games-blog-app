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

router.post('/register', validateRequest(registerSchema), registerHandler);
router.post('/login', validateRequest(loginSchema), loginHandler);
router.get('/refresh', refreshAccessTokenHandler);
router.post('/logout', deserializeUser, requireUser, logoutHandler);

export { router as authRouter };
