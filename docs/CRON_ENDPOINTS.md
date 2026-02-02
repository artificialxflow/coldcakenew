# مستندات Cron Endpoints

این مستندات نحوه استفاده از Cron Endpoints برای خودکارسازی سیستم را توضیح می‌دهد.

## 🔐 امنیت

تمام Cron Endpoints با `CRON_SECRET` محافظت می‌شوند. این secret را در Environment Variables تنظیم کنید:

```env
CRON_SECRET=your-secret-key-here
```

هنگام فراخوانی endpoint از cron service یا n8n، این secret را در header ارسال کنید:

```
X-Cron-Secret: your-secret-key-here
```

---

## 📋 Endpoints

### 1. به‌روزرسانی قیمت محصولات بر اساس طلا

**Endpoint:** `POST /api/cron/update-product-prices`

**توضیحات:** این endpoint قیمت طلا را از API خارجی دریافت می‌کند و اگر از بالاترین قیمت سال بیشتر باشد، قیمت محصولات را به‌روزرسانی می‌کند.

**Request Body (اختیاری):**
```json
{
  "userId": "user-id-here",
  "priceIncreasePercent": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "قیمت طلا به‌روز شد. 5 محصول به‌روزرسانی شد، 10 محصول بدون تغییر ماند.",
  "details": {
    "goldPriceUpdated": true,
    "productsUpdated": 5,
    "productsSkipped": 10
  },
  "timestamp": "2024-12-29T10:30:00.000Z"
}
```

**استفاده در n8n:**
- Schedule Trigger: هر روز در ساعت 23:59 (یا هر زمان دیگری)
- HTTP Request Node به `https://coldcake.ir/api/cron/update-product-prices`
- Header: `X-Cron-Secret: ${CRON_SECRET}`
- Method: POST
- Body: `{ "userId": "..." }`

**استفاده در cron service (cron-job.org):**
```
URL: https://coldcake.ir/api/cron/update-product-prices
Method: POST
Headers: X-Cron-Secret: your-secret-key
Body: { "userId": "..." }
Schedule: Daily at 23:59
```

---

### 2. ارسال پیام خودکار به مشتریان

**Endpoint:** `POST /api/cron/send-automated-messages`

**توضیحات:** این endpoint پیام‌های شخصی‌سازی شده را به مشتریان ارسال می‌کند (روزانه/هفتگی/ماهانه).

**Request Body (اختیاری):**
```json
{
  "userId": "user-id-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "پیام خودکار با موفقیت ارسال شد. 15 پیام ارسال شد.",
  "details": {
    "runId": "run-id-here",
    "totalCustomers": 15,
    "sentMessages": 15,
    "failedMessages": 0,
    "successRate": 100
  },
  "timestamp": "2024-12-29T10:30:00.000Z"
}
```

**استفاده در n8n:**
- Schedule Trigger: روزانه/هفتگی/ماهانه (بر اساس تنظیمات)
- HTTP Request Node به `https://coldcake.ir/api/cron/send-automated-messages`
- Header: `X-Cron-Secret: ${CRON_SECRET}`

**نکته:** فرکانس ارسال بر اساس تنظیمات `automatedMessaging` در `BusinessSettings` تعیین می‌شود.

---

### 3. اطلاع‌رسانی پیش‌بینی فصلی

**Endpoint:** `POST /api/cron/seasonal-notifications`

**توضیحات:** این endpoint پیش‌بینی‌های فصلی را بررسی می‌کند و 1 ماه قبل از فصل به کاربر اطلاع می‌دهد.

**Request Body (اختیاری):**
```json
{
  "userId": "user-id-here",
  "sendNotification": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "📊 هشدار پیش‌بینی فصلی...",
  "details": {
    "predictionsGenerated": 12,
    "upcomingPredictions": 5
  },
  "timestamp": "2024-12-29T10:30:00.000Z"
}
```

**استفاده در n8n:**
- Schedule Trigger: ماهانه (اول هر ماه)
- HTTP Request Node به `https://coldcake.ir/api/cron/seasonal-notifications`

---

### 4. دریافت قیمت طلا از API خارجی

**Endpoint:** `POST /api/gold-price/fetch`

**توضیحات:** دریافت قیمت طلا از API خارجی و ذخیره در دیتابیس (می‌تواند توسط n8n یا cron فراخوانی شود).

**Response:**
```json
{
  "success": true,
  "goldPrice": { ... },
  "source": "n8n"
}
```

---

## ⚙️ تنظیمات Environment Variables

```env
# API قیمت طلا
GOLD_PRICE_API_URL=https://api.prices.readme.io/v1/gold
GOLD_PRICE_API_KEY=your-api-key

# n8n (پیشنهادی)
N8N_WEBHOOK_URL=https://autocoldcake.runflare.run/webhook/

# امنیت Cron
CRON_SECRET=your-secret-key-here
```

---

## 🔄 راه‌اندازی با n8n

### Workflow 1: به‌روزرسانی قیمت طلا و محصولات

1. **Schedule Trigger**: هر روز 23:59
2. **HTTP Request**: 
   - URL: `https://coldcake.ir/api/cron/update-product-prices`
   - Method: POST
   - Headers: `X-Cron-Secret: ${CRON_SECRET}`
   - Body: `{ "userId": "..." }`

### Workflow 2: ارسال پیام خودکار

1. **Schedule Trigger**: روزانه در ساعت مشخص (مثلاً 10:00)
2. **HTTP Request**:
   - URL: `https://coldcake.ir/api/cron/send-automated-messages`
   - Method: POST
   - Headers: `X-Cron-Secret: ${CRON_SECRET}`

### Workflow 3: اطلاع‌رسانی فصلی

1. **Schedule Trigger**: اول هر ماه
2. **HTTP Request**:
   - URL: `https://coldcake.ir/api/cron/seasonal-notifications`
   - Method: POST
   - Headers: `X-Cron-Secret: ${CRON_SECRET}`

---

## 📝 نکات مهم

1. **اولویت n8n**: پیشنهاد می‌شود از n8n برای scraping قیمت طلا استفاده کنید و سپس به `/api/gold-price/update` ارسال کنید.

2. **userId**: در سیستم‌های single-user، می‌توانید userId را از دیتابیس یا از اولین کاربر بگیرید.

3. **Error Handling**: تمام endpoints خطاها را handle می‌کنند و پاسخ مناسب برمی‌گردانند.

4. **Logging**: تمام عملیات در console لاگ می‌شوند برای debugging.

---

**آخرین بروزرسانی:** 29 دسامبر 2024
