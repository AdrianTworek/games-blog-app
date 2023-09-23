import { createServer } from 'http';
import { config } from 'dotenv';
import { env } from '@src/config/env';
import { app } from '@src/app';
import { prisma } from '@src/db/prisma';
import { swaggerDocs } from '@src/utils/swagger.js';

config();

const bootstrap = async () => {
  const { PORT, HOST } = env;

  const server = createServer(app);

  server.listen(PORT, HOST, () => {
    console.log(`Server running at http://localhost:${PORT}/api`);
    swaggerDocs(app, PORT);
  });

  const SIGNALS = ['SIGTERM', 'SIGINT'];

  for (const signal of SIGNALS) {
    process.on(signal, async () => {
      console.log(`Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('Server closed. Disconnecting Prisma...');
        await prisma.$disconnect();
        console.log('Prisma disconnected. Exiting.');
        process.exit(0);
      });
    });
  }
};

bootstrap().catch((error) => {
  throw error;
});
