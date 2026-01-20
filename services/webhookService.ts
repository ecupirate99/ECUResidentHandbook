
import { WebhookResponse } from '../types';

/**
 * Sends a question to the Make.com webhook.
 * Updated Webhook Address: hook.us2.make.com/1ylj8ccfse5t7cp734yv3xwsexq46oez
 */
const WEBHOOK_URL = 'https://hook.us2.make.com/1ylj8ccfse5t7cp734yv3xwsexq46oez';

export const askHandbookQuestion = async (question: string): Promise<string> => {
  console.log(`[Webhook] Sending question: "${question}" to ${WEBHOOK_URL}`);
  
  try {
    // Ensuring the variable name is exactly 'question' as requested
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
    
    // Attempt to parse as JSON if the header suggests it
    if (contentType && contentType.includes("application/json")) {
      const data: WebhookResponse = await response.json();
      console.log('[Webhook] Received JSON response:', data);
      
      // Extract answer from common response keys used by Make.com modules
      return data.answer || data.text || data.response || data.message || JSON.stringify(data);
    } 
    
    // Fallback to plain text if not JSON
    const text = await response.text();
    console.log('[Webhook] Received text response:', text);
    return text || "No response text was provided by the handbook assistant.";

  } catch (error) {
    console.error('[Webhook] Fatal Error during fetch:', error);
    throw error;
  }
};
