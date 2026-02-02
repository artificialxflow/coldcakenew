/**
 * Service for fetching gold price from external APIs
 * Supports multiple sources: pricedb API, web scraping via n8n, etc.
 */

interface GoldPriceApiResponse {
  price: number; // قیمت طلای 18 عیار به تومان
  price21k?: number;
  price24k?: number;
  change?: number;
  changePercent?: number;
  timestamp?: string;
}

/** Default fallback API for gold price (pricedb / readme.io style). */
const DEFAULT_GOLD_PRICE_API_URL = 'https://api.prices.readme.io/v1/gold';

/**
 * Fetch gold price from pricedb API (GitHub: margani/pricedb)
 * Documentation: https://github.com/margani/pricedb
 */
export async function fetchGoldPriceFromPricedb(): Promise<GoldPriceApiResponse | null> {
  try {
    const apiUrl = process.env.GOLD_PRICE_API_URL || DEFAULT_GOLD_PRICE_API_URL;
    const apiKey = process.env.GOLD_PRICE_API_KEY;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch gold price from pricedb: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Adjust based on actual API response structure
    // This is a sample structure - you should adapt it to the real API
    return {
      price: data.price18k || data.price || 0,
      price21k: data.price21k,
      price24k: data.price24k,
      change: data.change || 0,
      changePercent: data.changePercent || 0,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching gold price from pricedb:', error);
    return null;
  }
}

/**
 * Fetch gold price from n8n webhook (if n8n is doing the scraping)
 * n8n workflow should call this endpoint with the scraped price
 */
export async function fetchGoldPriceFromN8n(): Promise<GoldPriceApiResponse | null> {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return null;
    }

    const response = await fetch(`${n8nWebhookUrl}/gold-price`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch gold price from n8n: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    return {
      price: data.price18k || data.price || 0,
      price21k: data.price21k,
      price24k: data.price24k,
      change: data.change || 0,
      changePercent: data.changePercent || 0,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching gold price from n8n:', error);
    return null;
  }
}

/**
 * Fetch gold price from the configured source
 * Priority: 1. N8N_WEBHOOK_URL (if set), 2. GOLD_PRICE_API_URL (if set), 3. default fallback API
 */
export async function fetchGoldPrice(): Promise<GoldPriceApiResponse | null> {
  // 1. Try n8n first (recommended for scraping tgju etc.)
  if (process.env.N8N_WEBHOOK_URL) {
    const n8nPrice = await fetchGoldPriceFromN8n();
    if (n8nPrice) return n8nPrice;
  }

  // 2. Try configured API (GOLD_PRICE_API_URL)
  if (process.env.GOLD_PRICE_API_URL) {
    const apiPrice = await fetchGoldPriceFromPricedb();
    if (apiPrice) return apiPrice;
  }

  // 3. Fallback: try default gold price API (no env required)
  try {
    const apiUrl = DEFAULT_GOLD_PRICE_API_URL;
    const apiKey = process.env.GOLD_PRICE_API_KEY;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    const response = await fetch(apiUrl, { headers, next: { revalidate: 3600 } });
    if (response.ok) {
      const data = await response.json();
      return {
        price: data.price18k ?? data.price ?? 0,
        price21k: data.price21k,
        price24k: data.price24k,
        change: data.change ?? 0,
        changePercent: data.changePercent ?? 0,
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn('Gold price fallback API failed:', e);
  }

  return null;
}

/**
 * Calculate price change from previous price
 */
export function calculatePriceChange(
  currentPrice: number,
  previousPrice: number
): { change: number; changePercent: number } {
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

  return { change, changePercent };
}
