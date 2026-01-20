
import { WebhookResponse } from '../types';

/**
 * Sends a question to the Make.com webhook.
 * We safely check for process.env to avoid ReferenceErrors in browser environments.
 */
const DEFAULT_URL = 'https://hook.us2.make.com/1ylj8ccfse5t7cp734yv3xwsexq46oez';

// Safely resolve the URL
const getWebhookUrl = (): string => {
  try {
    // Check if process and process.env exist (typical in build-time replacement)
    if (typeof process !== 'undefined' && process.env && process.env.WEBHOOK_URL) {
      return process.env.WEBHOOK_URL;
    }
  } catch (e) {
    // Fallback if process is not defined
  }
  return DEFAULT_URL;
};

const WEBHOOK_URL = getWebhookUrl();

export const askHandbookQuestion = async (question: string): Promise<string> => {
  console.log(`[Webhook] Sending question: "${question}" to ${WEBHOOK_URL}`);
  
  try {
    const payload = { question };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[Webhook] Server responded with status: ${response.status}`);
      throw new Error(`Connection Error (${response.status})`);
    }

    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data: WebhookResponse = await response.json();
      return data.answer || data.text || data.response || data.message || JSON.stringify(data);
    } 
    
    const text = await response.text();
    return text || "No response text was provided by the handbook assistant.";

  } catch (error) {
    console.error('[Webhook] Fatal Error during fetch:', error);
    throw error;
  }
};
