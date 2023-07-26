import { createServer } from 'http';
import { config } from 'dotenv';
import { app } from './app';
import { env } from './config/env';

config();

const PORT = env.PORT ?? 5000;
const HOST = env.HOST;

const server = createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
