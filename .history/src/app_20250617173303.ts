import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/status', async (req, res) => {
  const statuses = await prisma.deviceStatus.findMany();
  res.json(statuses);
});

export default app;
