const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const smsConfig = {
  baseUrl: requiredEnv("TABANSMS_BASE_URL"),
  apiKey: requiredEnv("TABANSMS_API_KEY"),
  senderNumber: requiredEnv("TABANSMS_SENDER_NUMBER"),
  patternCode: process.env.TABANSMS_PATTERN_CODE,
  patternVar: process.env.TABANSMS_PATTERN_VAR || "OTP",
};


