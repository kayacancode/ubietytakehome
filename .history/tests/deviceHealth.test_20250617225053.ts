// tests/unit/deviceHealth.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';

// Device health logic - extract this to a separate module
export class DeviceHealthChecker {
  static isDeviceHealthy(status: {
    batteryLevel?: number | null;
    rssi?: number | null;
    online: boolean;
    timestamp: Date;
  }): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check if device is online
    if (!status.online) {
      issues.push('Device is offline');
    }
    
    // Check battery level (consider unhealthy if below 20%)
    if (status.batteryLevel !== null && status.batteryLevel !== undefined) {
      if (status.batteryLevel < 20) {
        issues.push('Low battery level');
      }
      if (status.batteryLevel < 5) {
        issues.push('Critical battery level');
      }
    }
    
    // Check signal strength (RSSI values typically range from -30 to -90 dBm)
    // Values below -80 dBm are considered poor
    if (status.rssi !== null && status.rssi !== undefined) {
      if (status.rssi < -80) {
        issues.push('Poor signal strength');
      }
      if (status.rssi < -90) {
        issues.push('Very poor signal strength');
      }
    }
    
    // Check if data is stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (status.timestamp < oneHourAgo) {
      issues.push('Data is stale');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }
  
  static getHealthStatus(statuses: Array<{
    deviceId: string;
    batteryLevel?: number | null;
    rssi?: number | null;
    online: boolean;
    timestamp: Date;
  }>): {
    totalDevices: number;
    healthyDevices: number;
    unhealthyDevices: number;
    deviceHealth: Array<{
      deviceId: string;
      healthy: boolean;
      issues: string[];
    }>;
  } {
    const deviceHealth = statuses.map(status => ({
      deviceId: status.deviceId,
      ...this.isDeviceHealthy(status)
    }));
    
    const healthyDevices = deviceHealth.filter(d => d.healthy).length;
    
    return {
      totalDevices: statuses.length,
      healthyDevices,
      unhealthyDevices: statuses.length - healthyDevices,
      deviceHealth
    };
  }
}

// Unit Tests
describe('DeviceHealthChecker', () => {
  const baseStatus = {
    batteryLevel: 50,
    rssi: -60,
    online: true,
    timestamp: new Date()
  };

  describe('isDeviceHealthy', () => {
    it('should return healthy for a good device status', () => {
      const result = DeviceHealthChecker.isDeviceHealthy(baseStatus);
      
      expect(result.healthy).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect offline device as unhealthy', () => {
      const offlineStatus = { ...baseStatus, online: false };
      const result = DeviceHealthChecker.isDeviceHealthy(offlineStatus);
      
      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Device is offline');
    });

    it('should detect low battery as unhealthy', () => {
      const lowBatteryStatus = { ...baseStatus, batteryLevel: 15 };
      const result = DeviceHealthChecker.isDeviceHealthy(lowBatteryStatus);
      
      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Low battery level');
    });

    it('should detect critical battery level', () => {
      const criticalBatteryStatus = { ...baseStatus, batteryLevel: 3 };
      const result = DeviceHealthChecker.isDeviceHealthy(criticalBatteryStatus);
      
      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Critical battery level');
      expect(result.issues).toContain('Low battery level'); // Should have both
    });

    it('should detect poor signal strength', () => {
      const poorSignalStatus = { ...baseStatus, rssi: -85 };
      const result = DeviceHealthChecker.isDeviceHealthy(poorSignalStatus);
      
      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Poor signal strength');
    });

    it('should detect very poor signal strength', () => {
      const veryPoorSignalStatus = { ...baseStatus, rssi: -95 };
      const result = DeviceHealthChecker.isDeviceHealthy(veryPoorSignalStatus);
      
      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Very poor signal strength');
      expect(result.issues).toContain('Poor signal strength'); // Should have both
    });

    it('should detect stale data', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const staleStatus = { ...baseStatus, timestamp: twoHoursAgo };
      const result = DeviceHealthChecker.isDeviceHealthy(staleStatus);
      
      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Data is stale');
    });

    it('should handle null battery level gracefully', () => {
      const noBatteryStatus = { ...baseStatus, batteryLevel: null };
      const result = DeviceHealthChecker.isDeviceHealthy(noBatteryStatus);
      
      expect(result.healthy).toBe(true); // Should still be healthy if other params are good
    });

    it('should handle null RSSI gracefully', () => {
      const noRssiStatus = { ...baseStatus, rssi: null };
      const result = DeviceHealthChecker.isDeviceHealthy(noRssiStatus);
      
      expect(result.healthy).toBe(true); // Should still be healthy if other params are good
    });

    it('should detect multiple issues', () => {
      const problematicStatus = {
        batteryLevel: 5,
        rssi: -95,
        online: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      };
      
      const result = DeviceHealthChecker.isDeviceHealthy(problematicStatus);
      
      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Device is offline');
      expect(result.issues).toContain('Critical battery level');
      expect(result.issues).toContain('Very poor signal strength');
      expect(result.issues).toContain('Data is stale');
      expect(result.issues.length).toBeGreaterThan(4); // Should have multiple issues
    });
  });

  describe('getHealthStatus', () => {
    it('should calculate overall health statistics', () => {
      const statuses = [
        { deviceId: 'device1', ...baseStatus },
        { deviceId: 'device2', ...baseStatus, online: false },
        { deviceId: 'device3', ...baseStatus, batteryLevel: 10 }
      ];
      
      const result = DeviceHealthChecker.getHealthStatus(statuses);
      
      expect(result.totalDevices).toBe(3);
      expect(result.healthyDevices).toBe(1);
      expect(result.unhealthyDevices).toBe(2);
      expect(result.deviceHealth).toHaveLength(3);
      expect(result.deviceHealth[0].healthy).toBe(true);
      expect(result.deviceHealth[1].healthy).toBe(false);
      expect(result.deviceHealth[2].healthy).toBe(false);
    });

    it('should handle empty device list', () => {
      const result = DeviceHealthChecker.getHealthStatus([]);
      
      expect(result.totalDevices).toBe(0);
      expect(result.healthyDevices).toBe(0);
      expect(result.unhealthyDevices).toBe(0);
      expect(result.deviceHealth).toHaveLength(0);
    });

    it('should handle all healthy devices', () => {
      const statuses = [
        { deviceId: 'device1', ...baseStatus },
        { deviceId: 'device2', ...baseStatus },
        { deviceId: 'device3', ...baseStatus }
      ];
      
      const result = DeviceHealthChecker.getHealthStatus(statuses);
      
      expect(result.totalDevices).toBe(3);
      expect(result.healthyDevices).toBe(3);
      expect(result.unhealthyDevices).toBe(0);
    });
  });
});

// Validation logic tests
export class DeviceStatusValidator {
  static validateCreatePayload(payload: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!payload.device_id && !payload.deviceId) {
      errors.push('device_id is required');
    }
    
    if (!payload.timestamp) {
      errors.push('timestamp is required');
    }
    
    if (typeof payload.online !== 'boolean') {
      errors.push('online must be a boolean');
    }
    
    // Validate optional fields if present
    if (payload.battery_level !== undefined && payload.battery_level !== null) {
      if (typeof payload.battery_level !== 'number' || payload.battery_level < 0 || payload.battery_level > 100) {
        errors.push('battery_level must be a number between 0 and 100');
      }
    }
    
    if (payload.rssi !== undefined && payload.rssi !== null) {
      if (typeof payload.rssi !== 'number') {
        errors.push('rssi must be a number');
      }
    }
    
    // Validate timestamp format
    if (payload.timestamp) {
      const timestamp = new Date(payload.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('timestamp must be a valid ISO 8601 date string');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

describe('DeviceStatusValidator', () => {
  const validPayload = {
    device_id: 'sensor-123',
    timestamp: '2025-06-17T14:00:00Z',
    battery_level: 75,
    rssi: -60,
    online: true
  };

  describe('validateCreatePayload', () => {
    it('should validate a correct payload', () => {
      const result = DeviceStatusValidator.validateCreatePayload(validPayload);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept deviceId instead of device_id', () => {
      const payload = { ...validPayload };
      delete payload.device_id;
      payload.deviceId = 'sensor-123';
      
      const result = DeviceStatusValidator.validateCreatePayload(payload);
      
      expect(result.valid).toBe(true);
    });

    it('should reject payload without device identifier', () => {
      const payload = { ...validPayload };
      delete payload.device_id;
      
      const result = DeviceStatusValidator.validateCreatePayload(payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('device_id is required');
    });

    it('should reject payload without timestamp', () => {
      const payload = { ...validPayload };
      delete payload.timestamp;
      
      const result = DeviceStatusValidator.validateCreatePayload(payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('timestamp is required');
    });

    it('should reject payload with non-boolean online field', () => {
      const payload = { ...validPayload, online: 'true' };
      
      const result = DeviceStatusValidator.validateCreatePayload(payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('online must be a boolean');
    });

    it('should reject invalid battery level', () => {
      const payload = { ...validPayload, battery_level: 150 };
      
      const result = DeviceStatusValidator.validateCreatePayload(payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('battery_level must be a number between 0 and 100');
    });

    it('should reject invalid timestamp format', () => {
      const payload = { ...validPayload, timestamp: 'not-a-date' };
      
      const result = DeviceStatusValidator.validateCreatePayload(payload);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('timestamp must be a valid ISO 8601 date string');
    });

    it('should handle optional fields being null', () => {
      const payload = { 
        ...validPayload, 
        battery_level: null, 
        rssi: null 
      };
      
      const result = DeviceStatusValidator.validateCreatePayload(payload);
      
      expect(result.valid).toBe(true);
    });
  });
});