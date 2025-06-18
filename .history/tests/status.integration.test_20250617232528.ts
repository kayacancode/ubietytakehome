import request from 'supertest';
import app from '../src/app';

describe('POST /api/status', () => {
  it('should create a new device status', async () => {
    const newStatus = {
      deviceId: 'test-device-001',
      timestamp: new Date().toISOString(),
      batteryLevel: 75,
      rssi: -65,
      online: true,
    };

    const response = await request(app)
      .post('/api/status')
      .send(newStatus);

    expect(response.status).toBe(200); // or 200, depending on your API
    expect(response.body).toMatchObject(newStatus);
    expect(response.body).toHaveProperty('id');
  });

  // Optional: Test for missing required fields
  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/status')
      .send({ deviceId: 'test-device-001' }); // Missing other fields

    expect(response.status).toBe(400);
  });
});
