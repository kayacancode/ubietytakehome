import express from 'express'
import { PrismaClient } from '../../generated/prisma';
import { apiKeyAuth } from '../middlewares/apiKeyAuth';
const router = express.Router()
const prisma = new PrismaClient();

// route to get all device statuses
router.get('/', async (req,res)=> {
    const statuses = await prisma.deviceStatus.findMany();
    res.json(statuses);
})

// get device by ID
// GET /status{device_id}
router.get('/status', async (req:any, res:any) => {
    const { device_id } = req.query;
    if (!device_id) {
      return res.status(400).json({ error: 'device_id is required' }); // Validation
    }
  
    try {
      const status = await prisma.deviceStatus.findFirst({
        where: { deviceId: device_id as string },
        orderBy: { timestamp: 'desc' }, // Most recent first
      });
  
      if (!status) {
        return res.status(404).json({ error: 'No status found for this device_id' });
      }
  
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// create a new device status POST/Status
router.post('/', async (req,res) =>{
    const {deviceId, timestamp,batteryLevel, rssi, online} = req.body;
    const newStatus = await prisma.deviceStatus.create({
        data: {deviceId, timestamp, batteryLevel, rssi, online },
    });
    res.json(newStatus)
})

router.use(apiKeyAuth);
export default router; 