import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';

const { MONGODB_URI, PORT = 4000, CLIENT_ORIGIN = 'http://localhost:5173' } = process.env;

if (!MONGODB_URI) {
  throw new Error('Falta configurar MONGODB_URI en server/.env');
}

await connectDatabase(MONGODB_URI);

const app = createApp({ clientOrigin: CLIENT_ORIGIN });
app.listen(PORT, () => {
  console.log(`API disponible en http://localhost:${PORT}`);
});
