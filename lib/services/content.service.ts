import { prisma } from '../db/prisma';
import { getIntegrationSettings } from './settings.service';

export interface CreateContentData {
  type: 'image' | 'video' | 'audio';
  url: string;
  originalCaption?: string;
  platforms?: ('telegram' | 'whatsapp' | 'rubika' | 'instagram' | 'youtube' | 'aparat')[];
  status?: 'draft' | 'published' | 'scheduled';
  scheduledDate?: Date;
}

export async function getContents() {
  return prisma.content.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getContentById(id: string) {
  return prisma.content.findUnique({
    where: { id },
  });
}

export async function createContent(data: CreateContentData) {
  return prisma.content.create({
    data,
  });
}

export async function updateContent(id: string, data: Partial<CreateContentData>) {
  return prisma.content.update({
    where: { id },
    data: {
      ...data,
      scheduledDate: data.scheduledDate,
      publishedAt: data.status === 'published' ? new Date() : undefined,
    },
  });
}

export async function deleteContent(id: string) {
  return prisma.content.delete({
    where: { id },
  });
}

export async function enhanceContentWithAI(
  contentId: string,
  caption: string,
  options?: {
    addFestival?: boolean;
    addDiscount?: boolean;
    discountPercent?: number;
    discountHours?: number;
    addServiceInfo?: boolean;
    addSeasonalSale?: boolean;
    addCTA?: boolean;
    addHashtags?: boolean;
  }
) {
  const integrationSettings = await getIntegrationSettings();
  const businessSettings = await prisma.businessSettings.findFirst();

  // Build enhancement prompt
  let prompt = `بهبود و بهینه‌سازی این کپشن فارسی برای پست شبکه اجتماعی فروشگاه لوازم بچه و سیسمونی:\n\n${caption}\n\n`;

  const enhancements: string[] = [];

  if (options?.addFestival !== false) {
    enhancements.push('- اضافه کردن متن جشنواره فروش (مثلاً: "جشنواره بزرگ فروش لوازم بچه")');
  }

  if (options?.addDiscount !== false) {
    const discount = options?.discountPercent || businessSettings?.discountPercent || 10;
    const hours = options?.discountHours || businessSettings?.discountDurationHours || 48;
    enhancements.push(`- اضافه کردن متن تخفیف ${discount}% تا ${hours} ساعت آینده`);
  }

  if (options?.addServiceInfo !== false) {
    enhancements.push('- اضافه کردن اطلاعات خدمات حضوری (مثلاً: "برای بازدید حضوری در خدمتیم")');
  }

  if (options?.addSeasonalSale !== false) {
    enhancements.push('- اضافه کردن متن حراجی فصلی (بر اساس فصل فعلی)');
  }

  if (options?.addCTA !== false) {
    enhancements.push('- اضافه کردن CTA قوی و جذاب (مثلاً: "همین الان سفارش بدید!" یا "برای اطلاعات بیشتر تماس بگیرید")');
  }

  if (options?.addHashtags !== false) {
    enhancements.push('- اضافه کردن هشتگ‌های پرجستجو مرتبط با لوازم بچه و سیسمونی (حداقل 5-10 هشتگ فارسی و انگلیسی)');
  }

  if (enhancements.length > 0) {
    prompt += '\nلطفاً موارد زیر را اضافه کن:\n';
    enhancements.forEach((e) => {
      prompt += `${e}\n`;
    });
  }

  prompt += '\nمتن نهایی باید: جذاب، فروشنده، و شامل تمام اطلاعات لازم برای جذب مشتری باشد.';

  // Try Gemini first, then OpenAI
  if (integrationSettings.geminiApiKey) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + integrationSettings.geminiApiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const enhanced = data.candidates[0]?.content?.parts[0]?.text || caption;
        
        await prisma.content.update({
          where: { id: contentId },
          data: { aiEnhancedCaption: enhanced },
        });

        return enhanced;
      }
    } catch (error) {
      console.error('Gemini API error:', error);
    }
  }

  if (integrationSettings.openAiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${integrationSettings.openAiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: prompt,
          }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const enhanced = data.choices[0]?.message?.content || caption;
        
        await prisma.content.update({
          where: { id: contentId },
          data: { aiEnhancedCaption: enhanced },
        });

        return enhanced;
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  // If both fail, return original
  return caption;
}

export async function publishContent(id: string) {
  // TODO: Actually publish to platforms
  return prisma.content.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date(),
    },
  });
}
