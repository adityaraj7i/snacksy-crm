import { EmailProvider, SmsProvider, WhatsAppProvider } from "./interfaces";
import { MockEmailProvider, MockSmsProvider, MockWhatsAppProvider } from "./mock-providers";

export function getEmailProvider(): EmailProvider {
  return new MockEmailProvider();
}

export function getSmsProvider(): SmsProvider {
  return new MockSmsProvider();
}

export function getWhatsAppProvider(): WhatsAppProvider {
  return new MockWhatsAppProvider();
}
