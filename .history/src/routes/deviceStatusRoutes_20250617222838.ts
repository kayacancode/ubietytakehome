import express from 'express'
import { PrismaClient } from '../../generated/prisma';
import { apiKeyAuth } from '../middlewares/apiKeyAuth';
import { Request, Response } from 'express';

const router = express.Router()
const prisma = new PrismaClient();

// Apply middleware to all routes
router.use(apiKeyAuth);

// POST /status - Create a new device status
router.post('/', async (req: Request, res: Response) => {
  try {
    // Handle both snake_case (device_id) and camelCase (deviceId) from request
    const { 
      device_id, 
      deviceId, 
      timestamp, 
      battery_level, 
      batteryLevel, 
      rssi, 
      online 
    } = req.body;

    // Use device_id if provided, otherwise fall back to deviceId
    const finalDeviceId = device_id || deviceId;
    const finalBatteryLevel = battery_level || batteryLevel;

    // Validation
    if (!finalDeviceId) {
      return res.status(400).json({ error: 'device_id is required' });
    }
    if (!timestamp) {
      return res.status(400).json({ error: 'timestamp is required' });
    }
    if (typeof online !== 'boolean') {
      return res.status(400).json({ error: 'online must be a boolean' });
    }

    const newStatus = await prisma.deviceStatus.create({
      data: {
        deviceId: finalDeviceId,
        timestamp: new Date(timestamp),
        batteryLevel: finalBatteryLevel,
        rssi,
        online
      },
    });

    res.status(201).json(newStatus);
  } catch (error) {
    console.error('Error creating device status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /status/summary - Get summary of all devices with their most recent status
router.get('/summary', async (req: Request, res: Response) => {
  try {
    // Get all unique device IDs first
    const devices = await prisma.deviceStatus.findMany({
      select: { deviceId: true },
      distinct: ['deviceId']
    });

    // Get the most recent status for each device
    const summaries = await Promise.all(
      devices.map(async (device) => {
        const latestStatus = await prisma.deviceStatus.findFirst({
          where: { deviceId: device.deviceId },
          orderBy: { timestamp: 'desc' },
          select: {
            deviceId: true,
            batteryLevel: true,
            online: true,
            timestamp: true
          }
        });
        return latestStatus;
      })
    );

    res.json(summaries.filter(Boolean)); // Remove any null results
  } catch (error) {
    console.error('Error fetching device summaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /status/:deviceId - Get most recent status for a specific device
router.get('/:deviceId', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const status = await prisma.deviceStatus.findFirst({
      where: { deviceId: deviceId },
      orderBy: { timestamp: 'desc' }
    });

    if (!status) {
      return res.status(404).json({ error: 'No status found for this deviceId' });
    }

    res.json(status);
  } catch (error) {
    console.error('Error fetching device status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /status - Get all device statuses (optional, for debugging)
router.get('/', async (req: Request, res: Response) => {
  try {
    const statuses = await prisma.deviceStatus.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching all statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;