import { createServer } from 'http';
import { config } from 'dotenv';
import { app } from './app';

config();

const PORT = Number(process.env.PORT ?? 5000);
const HOST = '0.0.0.0';

const server = createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
