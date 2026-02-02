import { prisma } from '../db/prisma';

// Validation functions
function validateGoogleClientId(clientId: string | null | undefined): boolean {
  if (!clientId) return true; // Optional field
  // Google Client ID format: usually ends with .apps.googleusercontent.com or is a long alphanumeric string
  return clientId.length > 10 && /^[a-zA-Z0-9._-]+$/.test(clientId);
}

function validateGoogleClientSecret(clientSecret: string | null | undefined): boolean {
  if (!clientSecret) return true; // Optional field
  // Google Client Secret is usually a long alphanumeric string
  return clientSecret.length > 10;
}

function validateUrl(url: string | null | undefined): boolean {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateApiKey(apiKey: string | null | undefined): boolean {
  if (!apiKey) return true; // Optional field
  // Most API keys are alphanumeric strings of reasonable length
  return apiKey.length > 10;
}

// Business Settings
export interface BusinessSettingsData {
  businessName?: string;
  contactPhone: string;
  telegramChannel: string;
  rubikaChannel: string;
  whatsappNumber: string;
  instagramPage: string;
  address?: string;
  goldPriceIncreasePercent?: number;
  discountPercent?: number;
  discountDurationHours?: number;
  pricingVariable?: 'gold' | 'usd' | 'eur' | 'custom';
  priceIncreasePercent?: number;
  autoPriceUpdateEnabled?: boolean;
  autoPriceUpdateTime?: string;
  automatedMessaging?: any;
}

export async function getBusinessSettings() {
  let settings = await prisma.businessSettings.findFirst();
  
  if (!settings) {
    // Create default settings
    settings = await prisma.businessSettings.create({
      data: {
        contactPhone: '',
        telegramChannel: '',
        rubikaChannel: '',
        whatsappNumber: '',
        instagramPage: '',
      },
    });
  }
  
  return settings;
}

export async function updateBusinessSettings(data: Partial<BusinessSettingsData>) {
  let settings = await prisma.businessSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: {
        contactPhone: data.contactPhone || '',
        telegramChannel: data.telegramChannel || '',
        rubikaChannel: data.rubikaChannel || '',
        whatsappNumber: data.whatsappNumber || '',
        instagramPage: data.instagramPage || '',
        ...data,
      },
    });
  } else {
    settings = await prisma.businessSettings.update({
      where: { id: settings.id },
      data,
    });
  }
  
  return settings;
}

// Integration Settings
export interface IntegrationSettingsData {
  googleCloudClientId?: string;
  googleCloudClientSecret?: string;
  n8nWebhookUrl?: string;
  geminiApiKey?: string;
  openAiApiKey?: string;
}

export async function getIntegrationSettings() {
  let settings = await prisma.integrationSettings.findFirst();
  
  if (!settings) {
    // Create default empty settings
    settings = await prisma.integrationSettings.create({
      data: {},
    });
  }
  
  return settings;
}

export async function updateIntegrationSettings(data: IntegrationSettingsData) {
  // Validate inputs
  if (data.googleCloudClientId !== undefined && !validateGoogleClientId(data.googleCloudClientId)) {
    throw new Error('فرمت Google Cloud Client ID نامعتبر است');
  }
  
  if (data.googleCloudClientSecret !== undefined && !validateGoogleClientSecret(data.googleCloudClientSecret)) {
    throw new Error('فرمت Google Cloud Client Secret نامعتبر است');
  }
  
  if (data.n8nWebhookUrl !== undefined && !validateUrl(data.n8nWebhookUrl)) {
    throw new Error('فرمت URL نامعتبر است. لطفاً یک URL کامل وارد کنید (مثال: https://example.com)');
  }
  
  if (data.geminiApiKey !== undefined && !validateApiKey(data.geminiApiKey)) {
    throw new Error('فرمت Gemini API Key نامعتبر است');
  }
  
  if (data.openAiApiKey !== undefined && !validateApiKey(data.openAiApiKey)) {
    throw new Error('فرمت OpenAI API Key نامعتبر است');
  }
  
  let settings = await prisma.integrationSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.integrationSettings.create({
      data,
    });
  } else {
    settings = await prisma.integrationSettings.update({
      where: { id: settings.id },
      data,
    });
  }
  
  return settings;
}
