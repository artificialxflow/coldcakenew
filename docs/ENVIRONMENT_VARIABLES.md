# مستندات متغیرهای محیطی (Environment Variables)

این فایل شامل توضیحات کامل همه متغیرهای محیطی مورد استفاده در پروژه Cold Cake است.

## نحوه استفاده

1. فایل `.env.example` را کپی کنید و نام آن را به `.env.local` تغییر دهید:
   ```bash
   cp env.example .env.local
   ```

2. مقادیر متغیرها را با اطلاعات واقعی خود پر کنید.

3. برای تولید، از `.env.production` یا متغیرهای محیطی پلتفرم استقرار خود استفاده کنید.

---

## متغیرهای اصلی (Core Variables)

### `NODE_ENV`
- **توضیح**: محیط اجرای برنامه
- **مقدار پیش‌فرض**: `development`
- **مقادیر مجاز**: `development`, `production`, `test`
- **مثال**: `NODE_ENV=production`

### `PORT`
- **توضیح**: پورت برای اجرای سرور (در تولید معمولاً از پلتفرم استقرار استفاده می‌شود)
- **مقدار پیش‌فرض**: `3000`
- **مثال**: `PORT=3000`

### `HOSTNAME`
- **توضیح**: نام هاست برای سرور
- **مقدار پیش‌فرض**: `0.0.0.0`
- **مثال**: `HOSTNAME=0.0.0.0`

### `NEXT_PUBLIC_SITE_URL`
- **توضیح**: آدرس اصلی سایت (برای تولید لینک‌های مطلق)
- **مثال**: `NEXT_PUBLIC_SITE_URL=https://coldcake.ir`
- **نکته**: این متغیر عمومی است و در سمت کلاینت قابل دسترسی است.

---

## متغیرهای دیتابیس (Database)

### `DATABASE_URL`
- **توضیح**: اتصال به دیتابیس PostgreSQL
- **فرمت**: `postgresql://username:password@host:port/database`
- **مثال**: `DATABASE_URL=postgresql://postgres:password@localhost:5432/coldcake_db`
- **نکته**: این متغیر حساس است و نباید در گیت commit شود.

### `DATABASE_URL_REMOTE`
- **توضیح**: اتصال به دیتابیس ریموت (برای بکاپ یا همگام‌سازی)
- **اختیاری**: بله
- **مثال**: `DATABASE_URL_REMOTE=postgresql://postgres:password@remote-host:5432/coldcake_db`

---

## متغیرهای احراز هویت (Authentication)

### `JWT_SECRET`
- **توضیح**: کلید مخفی برای امضای JWT token ها
- **الزامی**: بله
- **نکته**: باید یک رشته تصادفی و پیچیده باشد (حداقل 32 کاراکتر)
- **مثال**: `JWT_SECRET=your-super-secret-jwt-key-min-32-chars`

### `JWT_EXPIRES_IN`
- **توضیح**: مدت اعتبار JWT token (به ثانیه)
- **مقدار پیش‌فرض**: `604800` (7 روز)
- **مثال**: `JWT_EXPIRES_IN=604800`

### `OTP_EXPIRATION_MINUTES`
- **توضیح**: مدت اعتبار کد تایید OTP (به دقیقه)
- **مقدار پیش‌فرض**: `5`
- **مثال**: `OTP_EXPIRATION_MINUTES=5`

### `NEXT_PUBLIC_DEV_MODE`
- **توضیح**: حالت توسعه (برای فعال کردن ویژگی‌های دیباگ)
- **مقدار پیش‌فرض**: `true`
- **مثال**: `NEXT_PUBLIC_DEV_MODE=false`

---

## متغیرهای سرویس SMS (Taban SMS)

### `TABANSMS_BASE_URL`
- **توضیح**: آدرس پایه API تابان SMS (IPPanel Edge API)
- **مقدار پیش‌فرض**: `https://edge.ippanel.com/v1`
- **مستندات**: [Edge API Documentation](https://ippanelcom.github.io/Edge-Document/docs/)
- **مثال**: `TABANSMS_BASE_URL=https://edge.ippanel.com/v1`

### `TABANSMS_API_KEY`
- **توضیح**: کلید API تابان SMS
- **الزامی**: بله
- **نحوه دریافت**: از پنل تابان SMS دریافت کنید
- **مثال**: `TABANSMS_API_KEY=your-api-key-here`

### `TABANSMS_SENDER_NUMBER`
- **توضیح**: شماره خط خدماتی برای ارسال SMS
- **الزامی**: بله
- **مثال**: `TABANSMS_SENDER_NUMBER=3000505`

### `TABANSMS_PATTERN_CODE`
- **توضیح**: کد Pattern برای ارسال OTP
- **الزامی**: بله (اگر از Pattern استفاده می‌کنید)
- **نحوه دریافت**: از پنل تابان SMS در بخش Pattern دریافت کنید
- **مثال**: `TABANSMS_PATTERN_CODE=jkojgpbokmsv2fe`

### `TABANSMS_PATTERN_VAR`
- **توضیح**: نام متغیر Pattern در پنل تابان (باید با Pattern مطابقت داشته باشد)
- **الزامی**: بله (اگر از Pattern استفاده می‌کنید)
- **مثال**: اگر Pattern شما `کد تایید شما: %OTP%` است، مقدار باید `OTP` باشد
- **مثال**: `TABANSMS_PATTERN_VAR=OTP`

---

## متغیرهای یکپارچه‌سازی (Integration Settings)

> **نکته مهم**: این متغیرها اختیاری هستند چون در دیتابیس (`IntegrationSettings`) نیز ذخیره می‌شوند. می‌توانید از env به عنوان fallback استفاده کنید یا از طریق پنل تنظیمات وارد کنید.

### Google Cloud Platform (برای Google Apps Script)

#### `GOOGLE_CLOUD_CLIENT_ID`
- **توضیح**: شناسه مشتری OAuth 2.0 از Google Cloud Console
- **اختیاری**: بله (می‌توان از طریق پنل تنظیمات وارد کرد)
- **فرمت**: `xxxxx.apps.googleusercontent.com`
- **نحوه دریافت**: به [مستندات Google Apps Script Setup](./google-apps-script-setup.md) مراجعه کنید
- **مثال**: `GOOGLE_CLOUD_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com`

#### `GOOGLE_CLOUD_CLIENT_SECRET`
- **توضیح**: رمز مشتری OAuth 2.0 از Google Cloud Console
- **اختیاری**: بله (می‌توان از طریق پنل تنظیمات وارد کرد)
- **نحوه دریافت**: به [مستندات Google Apps Script Setup](./google-apps-script-setup.md) مراجعه کنید
- **مثال**: `GOOGLE_CLOUD_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx`

### n8n Workflow Automation

#### `N8N_WEBHOOK_URL`
- **توضیح**: آدرس Webhook نود n8n برای دریافت trigger ها
- **اختیاری**: بله (می‌توان از طریق پنل تنظیمات وارد کرد)
- **فرمت**: URL کامل شامل endpoint
- **مثال**: `N8N_WEBHOOK_URL=https://autocoldcake.runflare.run/webhook/`
- **مستندات**: به [مستندات n8n Integration](./n8n-integration.md) مراجعه کنید

### AI APIs (برای AI Enhancement در Content Management)

#### `GEMINI_API_KEY`
- **توضیح**: کلید API گوگل Gemini برای بهبود محتوا با AI
- **اختیاری**: بله (می‌توان از طریق پنل تنظیمات وارد کرد)
- **نحوه دریافت**: از [Google AI Studio](https://makersuite.google.com/app/apikey) دریافت کنید
- **مثال**: `GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxx`

#### `OPENAI_API_KEY`
- **توضیح**: کلید API OpenAI برای بهبود محتوا با AI
- **اختیاری**: بله (می‌توان از طریق پنل تنظیمات وارد کرد)
- **نحوه دریافت**: از [OpenAI Platform](https://platform.openai.com/api-keys) دریافت کنید
- **فرمت**: `sk-...`
- **مثال**: `OPENAI_API_KEY=sk-xxxxxxxxxxxxx`

### قیمت طلا (Gold Price)

اولویت منابع: ۱) N8N_WEBHOOK_URL (اگر تنظیم شده باشد)، ۲) GOLD_PRICE_API_URL، ۳) منبع پیش‌فرض (API داخلی/fallback).

#### `N8N_WEBHOOK_URL`
- **توضیح**: اگر تنظیم شده باشد، ابتدا قیمت طلا از وب‌هوک n8n دریافت می‌شود (مناسب برای اسکرپ tgju یا منابع دیگر).
- **اختیاری**: بله
- **مثال**: `N8N_WEBHOOK_URL=https://your-n8n.runflare.run/webhook/`

#### `GOLD_PRICE_API_URL`
- **توضیح**: آدرس API خارجی برای دریافت قیمت طلا (مثلاً pricedb، یا API معتبر طلا/ارز ایران).
- **اختیاری**: بله؛ در غیر این صورت از منبع پیش‌فرض استفاده می‌شود.
- **مثال**: `GOLD_PRICE_API_URL=https://api.prices.readme.io/v1/gold`

#### `GOLD_PRICE_API_KEY`
- **توضیح**: کلید API برای سرویس قیمت طلا (در صورت نیاز سرویس).
- **اختیاری**: بله
- **مثال**: `GOLD_PRICE_API_KEY=your-gold-price-api-key`

---

## امنیت (Security)

### نکات مهم

1. **هرگز فایل `.env.local` را در گیت commit نکنید**
   - مطمئن شوید که `.env.local` در `.gitignore` قرار دارد

2. **استفاده از متغیرهای محیطی در تولید**
   - در پلتفرم‌های استقرار (مثل Vercel, Render, Railway) از تنظیمات Environment Variables استفاده کنید
   - هرگز کلیدهای API را در کد hardcode نکنید

3. **چرخش کلیدها**
   - به صورت دوره‌ای کلیدهای JWT و API را تغییر دهید
   - در صورت افشای کلیدی، فوراً آن را تغییر دهید

4. **محدود کردن دسترسی**
   - فقط کاربران مجاز باید به فایل `.env.local` دسترسی داشته باشند
   - در سیستم‌های چند کاربره، از سطوح دسترسی مناسب استفاده کنید

---

## مثال فایل `.env.local` کامل

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SITE_URL=https://coldcake.ir

DATABASE_URL=postgresql://postgres:secure-password@localhost:5432/coldcake_db

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=604800
OTP_EXPIRATION_MINUTES=5
NEXT_PUBLIC_DEV_MODE=false

TABANSMS_BASE_URL=https://edge.ippanel.com/v1
TABANSMS_API_KEY=your-taban-sms-api-key
TABANSMS_SENDER_NUMBER=3000505
TABANSMS_PATTERN_CODE=your-pattern-code
TABANSMS_PATTERN_VAR=OTP

GOOGLE_CLOUD_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLOUD_CLIENT_SECRET=your-client-secret

N8N_WEBHOOK_URL=https://autocoldcake.runflare.run/webhook/

GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=sk-your-openai-api-key

GOLD_PRICE_API_URL=https://api.example.com/gold-price
GOLD_PRICE_API_KEY=your-gold-price-api-key
```

---

## منابع و لینک‌های مفید

- [مستندات Google Apps Script Setup](./google-apps-script-setup.md)
- [مستندات n8n Integration](./n8n-integration.md)
- [IPPanel Edge API Documentation](https://ippanelcom.github.io/Edge-Document/docs/)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [OpenAI Platform](https://platform.openai.com/api-keys)

---

## پشتیبانی

در صورت بروز مشکل در تنظیمات متغیرهای محیطی، به بخش [Issues](https://github.com/your-repo/issues) مراجعه کنید یا با تیم پشتیبانی تماس بگیرید.
