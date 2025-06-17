import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient();

// route to get all device statuses
router.get('/', async (req,res)=> {
    const statuses = await prisma.deviceStatus.findMany();
    res.json(statuses);
})