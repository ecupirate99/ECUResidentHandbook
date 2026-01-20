
export interface Message {
  id: string;
  question: string;
  answer?: string;
  timestamp: Date;
  status: 'loading' | 'success' | 'error';
  feedback?: 'up' | 'down';
}

export interface WebhookResponse {
  answer?: string;
  text?: string;
  [key: string]: any;
}
