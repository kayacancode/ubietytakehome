export function isDeviceHealthy(status: {
    batteryLevel: number | null;
    rssi: number | null;
    online: boolean;
  }): boolean {
    return (
      status.batteryLevel !== null &&
      status.batteryLevel >= 20 &&
      status.rssi !== null &&
      status.rssi >= -70 &&
      status.online === true
    );
  }
  