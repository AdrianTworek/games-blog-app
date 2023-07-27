import zennv from 'zennv';
import { z } from 'zod';

export const env = zennv({
  dotenv: true,
  schema: z.object({
    PORT: z.number().default(5000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z.string(),
  }),
});
