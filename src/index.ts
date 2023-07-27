import { createServer } from 'http';
import { config } from 'dotenv';
import { env } from './config/env';
import { app } from './app';

config();

const { PORT, HOST } = env;

const server = createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
