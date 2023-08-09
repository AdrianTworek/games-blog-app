import { createServer } from 'http';
import { config } from 'dotenv';
import { env } from '@src/config/env';
import { app } from '@src/app';

config();

const { PORT, HOST } = env;

const server = createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
