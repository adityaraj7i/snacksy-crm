export interface SendMessagePayload {
  to: string; // Destination email address or normalized phone number
  subject?: string;
  body: string;
  metadata?: Record<string, any>;
}

export interface SendMessageResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  status: "SENT" | "QUEUED" | "FAILED" | "UNCONFIGURED";
}

export interface EmailProvider {
  name: string;
  isConfigured(): boolean;
  sendEmail(payload: SendMessagePayload): Promise<SendMessageResult>;
}

export interface SmsProvider {
  name: string;
  isConfigured(): boolean;
  sendSms(payload: SendMessagePayload): Promise<SendMessageResult>;
}

export interface WhatsAppProvider {
  name: string;
  isConfigured(): boolean;
  sendWhatsApp(payload: SendMessagePayload): Promise<SendMessageResult>;
}
