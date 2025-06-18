import express from 'express'
import { PrismaClient } from '../../generated/prisma';
import { apiKeyAuth } from '../middlewares/apiKeyAuth';
import { Request, Response } from 'express';

const router = express.Router()
const prisma = new PrismaClient();
router.use(apiKeyAuth); // applying middleware to all routes


// route to get all device statuses
router.get('/', async (req:Request,res:Response)=> {
    const statuses = await prisma.deviceStatus.findMany();
    res.json(statuses);
})

// get device by ID
// GET /status{deviceId}

router.get('/', async (req: Request, res: Response) => {
    const { deviceId } = req.query;
    if (!deviceId) {
      res.status(400).json({ error: 'deviceId is required' });
      return;
    }
    try {
      const status = await prisma.deviceStatus.findFirst({ //get the most recent 
        where: { deviceId: req.query.deviceId as string },
      });
      if (!status) {
        res.status(404).json({ error: 'No status found for this deviceId' });
        return;
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// create a new device status POST/Status
router.post('/', async (req:Request,res:Response) =>{
    const {deviceId, timestamp, batteryLevel, rssi, online} = req.body;
    const newStatus = await prisma.deviceStatus.create({
        data: {deviceId, timestamp,  batteryLevel, rssi, online },
    });
    res.json(newStatus)
})

export default router; 