import axios from 'axios';
import crypto from 'crypto';
import Webhook from '../models/Webhook.js';
import Organization from '../models/Organization.js';
import type { IWebhook } from '../models/Webhook.js';
import DeliveryLog from '../models/DeliveryLog.js';

/**
 * Service to handle webhook delivery with signing and retries
 */
export class WebhookDeliveryService {
  private static RETRY_SCHEDULE = [1000, 4000, 16000]; // 1s, 4s, 16s

  /**
   * Main entry point to trigger a webhook event for an organization
   */
  static async triggerEvent(organizationId: string, eventType: string, payload: any) {
    console.log(`[WebhookService] Triggering ${eventType} for Org: ${organizationId}`);
    
    try {
      const [webhooks, org] = await Promise.all([
        Webhook.find({ 
          organizationId: organizationId as any, 
          subscribedEvents: eventType 
        }),
        Organization.findById(organizationId)
      ]);

      const deliveryList = [...webhooks];

      // Also include the global organization webhook if configured
      if (org?.webhookUrl && org?.webhookSecret) {
        // Avoid duplicate delivery if the global URL is also in the specific webhooks list
        const alreadyIncluded = webhooks.some(w => w.url === org.webhookUrl);
        if (!alreadyIncluded) {
          deliveryList.push({
            _id: org._id, // Use Org ID as a mock Webhook ID for logging
            url: org.webhookUrl,
            secret: org.webhookSecret,
            organizationId: org._id
          } as any);
        }
      }

      if (deliveryList.length === 0) {
        console.log(`[WebhookService] No webhooks found for ${eventType}`);
        return;
      }

      await Promise.all(deliveryList.map(webhook => this.deliver(webhook, eventType, payload)));
    } catch (error) {
      console.error('[WebhookService] Error fetching webhooks:', error);
    }
  }

  /**
   * Internal method to handle delivery, signing, and logging
   */
  private static async deliver(webhook: IWebhook, eventType: string, payload: any, attempt: number = 1) {
    const fullPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      ...payload
    };

    // 1. Sign payload
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(fullPayload))
      .digest('hex');

    console.log(`[WebhookService] Delivering ${eventType} to ${webhook.url} (Attempt ${attempt})`);

    try {
      const response = await axios.post(webhook.url, fullPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'User-Agent': 'DealSim-Webhook-Service/1.0'
        },
        timeout: 10000 // 10s timeout
      });

      // 2. Log success
      await DeliveryLog.create({
        webhookId: webhook._id,
        eventType,
        payload: fullPayload,
        status: 'success',
        statusCode: response.status,
        attempt,
        timestamp: new Date()
      });

      console.log(`[WebhookService] Delivery successful: ${webhook.url}`);
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorMessage = error.message;

      // 3. Log failure
      await DeliveryLog.create({
        webhookId: webhook._id,
        eventType,
        payload: fullPayload,
        status: 'failed',
        statusCode,
        attempt,
        timestamp: new Date(),
        error: errorMessage
      });

      console.error(`[WebhookService] Delivery failed to ${webhook.url}: ${errorMessage}`);

      // 4. Retry Logic
      if (attempt <= this.RETRY_SCHEDULE.length) {
        const delay = this.RETRY_SCHEDULE[attempt - 1];
        console.log(`[WebhookService] Scheduling retry ${attempt} in ${delay}ms`);
        
        setTimeout(() => {
          this.deliver(webhook, eventType, payload, attempt + 1);
        }, delay);
      } else {
        console.error(`[WebhookService] Maximum attempts reached for ${webhook.url}`);
      }
    }
  }

  /**
   * Utility for testing a webhook registration
   */
  static async triggerTest(webhook: IWebhook) {
    return this.deliver(webhook, 'webhook.test', {
      message: 'This is a test notification from DealSim.',
      testId: crypto.randomUUID()
    });
  }
}
