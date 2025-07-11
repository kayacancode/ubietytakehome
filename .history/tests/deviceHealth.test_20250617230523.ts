import { describe } from "node:test";
import { isDeviceHealthy } from "./deviceHealthyLogic";

describe('isDeviceHealthy', () =>{
    it('returns true for a healthy device',() => {
        expect(isDeviceHealthy({batteryLevel:50, rssi:-60, online:true})).toBe(true);
    });
    it('returns false if batteryLevel is too low', () => {
        expect(isDeviceHealthy({batteryLevel:10, rssi:-60, online:true})).toBe(false)
    })
    it('returns false if rssi is too low', () =>{
        expect(isDeviceHealthy({batteryLevel:50, rssi:-80, online:true})).toBe(false)
    })
});
