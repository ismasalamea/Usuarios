import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import usersRouter from './routes/users.js';
import { handleError, notFound } from './middleware/errors.js';

export function createApp({ clientOrigin }) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: '20kb' }));
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false
    })
  );
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/users', usersRouter);
  app.use(notFound);
  app.use(handleError);

  return app;
}
