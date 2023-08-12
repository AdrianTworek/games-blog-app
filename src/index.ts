import { createServer } from 'http';
import { config } from 'dotenv';
import { env } from '@src/config/env';
import { app } from '@src/app';
import { prisma } from '@src/db/prisma';

config();

const bootstrap = async () => {
  const { PORT, HOST } = env;

  const server = createServer(app);

  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

bootstrap()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
