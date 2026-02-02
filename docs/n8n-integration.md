# راهنمای یکپارچه‌سازی n8n با Cold Cake

این راهنما نحوه اتصال n8n به Cold Cake API و ایجاد workflow های خودکار را توضیح می‌دهد.

## آدرس n8n

n8n شما در آدرس زیر در دسترس است:
- **URL**: https://autocoldcake.runflare.run

## تنظیمات اولیه

### 1. دریافت Webhook URL

1. وارد پنل n8n خود شوید
2. یک workflow جدید ایجاد کنید
3. یک نود **Webhook** اضافه کنید
4. Webhook URL را کپی کنید (مثال: `https://autocoldcake.runflare.run/webhook/xxxxx`)
5. این URL را در پنل تنظیمات Cold Cake → یکپارچه‌سازی‌ها → n8n Webhook URL وارد کنید

### 2. تنظیم Authentication

برای اتصال به Cold Cake API، باید از JWT token استفاده کنید:

1. یک نود **HTTP Request** اضافه کنید
2. Method: **POST**
3. URL: `https://coldcake.ir/api/auth/request-code`
4. Body:
```json
{
  "phone": "YOUR_PHONE_NUMBER"
}
```
5. سپس از endpoint `/api/auth/verify-code` برای دریافت token استفاده کنید
6. Token را در یک Variable ذخیره کنید
7. در درخواست‌های بعدی، Header اضافه کنید:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN`

**یا بهتر است از Cookie استفاده کنید** که به صورت خودکار در مرورگر ذخیره می‌شود.

## مثال‌های Workflow

### 1. Automated Messaging Workflow

این workflow به صورت روزانه پیام‌های خودکار را ارسال می‌کند:

**نودها:**
1. **Schedule Trigger** - هر روز ساعت 9 صبح
2. **HTTP Request** - GET `/api/messages/automated/run`
3. **IF Node** - بررسی موفقیت
4. **HTTP Request** - POST به Telegram/WhatsApp API

### 2. Gold Price Update Workflow

این workflow قیمت طلا را به‌روزرسانی می‌کند:

**نودها:**
1. **Schedule Trigger** - هر ساعت
2. **HTTP Request** - دریافت قیمت طلا از API خارجی
3. **HTTP Request** - POST `/api/gold-price/update` به Cold Cake
4. **IF Node** - اگر قیمت تغییر کرده
5. **HTTP Request** - POST `/api/products/price-preview`
6. **Notification** - اطلاع‌رسانی

### 3. Report Generation Workflow

این workflow گزارش‌های روزانه/هفتگی ایجاد می‌کند:

**نودها:**
1. **Schedule Trigger** - هر هفته یکشنبه
2. **HTTP Request** - GET `/api/reports/summary`
3. **HTTP Request** - GET `/api/reports/export?format=excel`
4. **Google Drive** - آپلود فایل Excel
5. **Email** - ارسال گزارش به ایمیل

### 4. Customer Sync Workflow

این workflow مشتریان جدید را همگام‌سازی می‌کند:

**نودها:**
1. **Webhook** - دریافت trigger از Cold Cake
2. **HTTP Request** - GET `/api/customers`
3. **Google Sheets** - به‌روزرسانی Sheet
4. **Conditional** - بررسی تغییرات
5. **Notification** - اطلاع‌رسانی

## Webhook Endpoints در Cold Cake

Cold Cake می‌تواند به n8n webhook درخواست بفرستد:

### ارسال trigger به n8n

```javascript
// در کد Cold Cake
const n8nWebhookUrl = integrationSettings.n8nWebhookUrl;

await fetch(n8nWebhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'sale_created',
    data: { saleId, customerId, amount }
  })
});
```

### دریافت trigger در n8n

1. یک نود **Webhook** در n8n ایجاد کنید
2. Method: **POST**
3. Authentication: **None** (یا API Key)
4. در workflow خود، از `{{ $json.event }}` و `{{ $json.data }}` استفاده کنید

## مثال‌های کامل

### Workflow 1: Automated Daily Report

```json
{
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 9 * * *" }]
        }
      }
    },
    {
      "name": "Get Report",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://coldcake.ir/api/reports/summary",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth"
      }
    }
  ]
}
```

### Workflow 2: Price Alert

```json
{
  "nodes": [
    {
      "name": "Check Gold Price",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://coldcake.ir/api/gold-price"
      }
    },
    {
      "name": "Check Threshold",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.changePercent }}",
              "operation": "larger",
              "value2": 5
            }
          ]
        }
      }
    },
    {
      "name": "Send Alert",
      "type": "n8n-nodes-base.telegram",
      "parameters": {
        "chatId": "YOUR_CHAT_ID",
        "text": "قیمت طلا بیش از 5% افزایش یافت!"
      }
    }
  ]
}
```

## نکات مهم

1. **Authentication**: از JWT token یا Cookie برای دسترسی به API استفاده کنید
2. **Rate Limiting**: درخواست‌های زیاد به API نکنید
3. **Error Handling**: همیشه error handling در workflow خود داشته باشید
4. **Webhook Security**: برای production، authentication را فعال کنید

## لینک‌های مفید

- [n8n Documentation](https://docs.n8n.io)
- [Cold Cake API Documentation](./api-documentation.md)
- [n8n Workflow Examples](https://n8n.io/workflows)
