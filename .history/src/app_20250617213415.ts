import express from 'express';
import { PrismaClient } from '@prisma/client';
import deviceStatusRouter from "./routes/deviceStatusRoutes"
import { errorHandler } from './middlewares/errorHandler';
const app = express();
app.use(express.json());

app.use('/api/device-status', deviceStatusRouter)
app.use('/api/status', deviceStatusRouter)

app.use(errorHandler)

export default app;
