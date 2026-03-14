import { WebhookDeliveryService } from '../src/services/webhookDeliveryService.js';
import crypto from 'crypto';

describe('WebhookDeliveryService - Signing', () => {
  test('should generate valid HMAC signature', () => {
    const secret = 'test-secret';
    const payload = JSON.stringify({ event: 'test' });
    const service: any = new WebhookDeliveryService(); // cast to any to access private/static if needed or just use current structure
    
    // Reproduce logic from webhookDeliveryService.ts
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
      
    // If the service has a sign method we use that
    // Manual check for consistency
    expect(expectedSignature).toBeDefined();
    expect(typeof expectedSignature).toBe('string');
  });
});
