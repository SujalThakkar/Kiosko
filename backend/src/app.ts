import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter       from './routes/auth';
import roomsRouter      from './routes/rooms';
import componentsRouter from './routes/components';
import requestsRouter   from './routes/requests';
import issuancesRouter  from './routes/issuances';
import kioskRouter      from './routes/kiosk';
import reportsRouter    from './routes/reports';

const app = express();

// -----------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ],
  credentials: true,
}));
app.use(express.json());

// -----------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth',       authRouter);
app.use('/rooms',      roomsRouter);
app.use('/components', componentsRouter);
app.use('/requests',   requestsRouter);
app.use('/issuances',  issuancesRouter);
app.use('/kiosk',      kioskRouter);
app.use('/reports',    reportsRouter);

export default app;
