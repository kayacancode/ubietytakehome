import express from 'express'
import { PrismaClient } from '../../generated/prisma';
import { apiKeyAuth } from '../middlewares/apiKeyAuth';
import { Request, Response } from 'express';

const router = express.Router()
const prisma = new PrismaClient();

// route to get all device statuses
router.get('/', async (req:Request,res:Response)=> {
    const statuses = await prisma.deviceStatus.findMany();
    res.json(statuses);
})

// get device by ID
// GET /status{device_id}

router.get('/status', async (req: Request, res: Response) => {
    const { device_id } = req.query;
    if (!device_id) {
      res.status(400).json({ error: 'device_id is required' });
      return;
    }
    try {
      const status = await prisma.deviceStatus.findFirst({ //get the most recent 
        where: { device_id: req.query.device_id as string },
      });
      if (!status) {
        res.status(404).json({ error: 'No status found for this device_id' });
        return;
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// create a new device status POST/Status
router.post('/status', async (req:Request,res:Response) =>{
    const {device_id, timestamp, battery_level, rssi, online} = req.body;
    const newStatus = await prisma.deviceStatus.create({
        data: {device_id, timestamp,  battery_level, rssi, online },
    });
    res.json(newStatus)
})

router.use(apiKeyAuth);
export default router; 