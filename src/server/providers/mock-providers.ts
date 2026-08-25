import { EmailProvider, SmsProvider, WhatsAppProvider, SendMessagePayload, SendMessageResult } from "./interfaces";

export class MockEmailProvider implements EmailProvider {
  name = "Mock / Unconfigured Email Provider";

  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
  }

  async sendEmail(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.isConfigured() && process.env.NODE_ENV !== "test") {
      return {
        success: false,
        status: "UNCONFIGURED",
        error: "Email provider API key unconfigured. Message saved in unconfigured queue.",
      };
    }

    return {
      success: true,
      status: "SENT",
      providerMessageId: `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }
}

export class MockSmsProvider implements SmsProvider {
  name = "Mock / Unconfigured SMS Provider (Sparrow SMS Adapter)";

  isConfigured(): boolean {
    return Boolean(process.env.SPARROW_SMS_TOKEN);
  }

  async sendSms(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.isConfigured() && process.env.NODE_ENV !== "test") {
      return {
        success: false,
        status: "UNCONFIGURED",
        error: "SMS gateway token unconfigured. Message saved in unconfigured queue.",
      };
    }

    return {
      success: true,
      status: "SENT",
      providerMessageId: `mock-sms-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  name = "Mock / Unconfigured WhatsApp Provider";

  isConfigured(): boolean {
    return Boolean(process.env.WHATSAPP_CLOUD_API_TOKEN);
  }

  async sendWhatsApp(payload: SendMessagePayload): Promise<SendMessageResult> {
    if (!this.isConfigured() && process.env.NODE_ENV !== "test") {
      return {
        success: false,
        status: "UNCONFIGURED",
        error: "WhatsApp Cloud API token unconfigured. Message saved in unconfigured queue.",
      };
    }

    return {
      success: true,
      status: "SENT",
      providerMessageId: `mock-wa-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }
}
