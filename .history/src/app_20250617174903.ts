import express from 'express';
import { PrismaClient } from '@prisma/client';
import deviceStatusRouter from "./routes/deviceStatusRoutes"
const app = express();
app.use(express.json());

app.use('/api/device-status', deviceStatusRouter)

export default app;
