type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "secret",
  "token",
  "auth_token",
  "api_key",
  "creditcard",
  "ssn",
  "credentials",
];

function sanitizeContext(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class Logger {
  private formatLog(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = payload.context
      ? sanitizeContext(payload.context)
      : undefined;

    const logEntry = {
      timestamp,
      level,
      message: payload.message,
      ...(sanitizedContext ? { context: sanitizedContext } : {}),
      ...(payload.error instanceof Error
        ? {
            errorName: payload.error.name,
            errorMessage: payload.error.message,
            stack: process.env.NODE_ENV !== "production" ? payload.error.stack : undefined,
          }
        : payload.error
        ? { error: payload.error }
        : {}),
    };

    return JSON.stringify(logEntry);
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(this.formatLog("info", { message, context }));
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(this.formatLog("warn", { message, context }));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    console.error(this.formatLog("error", { message, error, context }));
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatLog("debug", { message, context }));
    }
  }
}

export const logger = new Logger();
