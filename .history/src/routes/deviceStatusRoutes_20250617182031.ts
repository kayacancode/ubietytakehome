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
router.get('/:id', async (req,res) => {
    const {id} = req.params;
    const status = await prisma.deviceStatus.findUnique({
        where: {id: Number(id)},
    });
    res.json(status);
});

// create a new device status POST/Status
router.post('/', async (req,res) =>{
    const {devicceId, timestamp,batteryLevel, rssi, online} = req.body;
    const newStatus = await prisma.deviceStatus.create({
        data: {devicceId, timestamp, batteryLevel, rssi, online },
    });
    res.json(newStatus)
})

router.use(apiKeyAuth);
export default router; 