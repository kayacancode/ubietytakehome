-- CreateTable
CREATE TABLE "DeviceStatus" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "batteryLevel" INTEGER,
    "rssi" INTEGER,
    "online" BOOLEAN NOT NULL,

    CONSTRAINT "DeviceStatus_pkey" PRIMARY KEY ("id")
);
