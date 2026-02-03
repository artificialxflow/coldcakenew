# راهنمای Deployment

این مستندات شامل دستورالعمل‌های کامل برای استقرار پروژه روی سرور (Runflare) است.

## لاگ‌گذاری

پروژه شامل سیستم لاگ‌گذاری کامل برای debugging مشکلات deployment است. تمام لاگ‌ها با prefix `[DEPLOY]` نمایش داده می‌شوند.

## مراحل Deployment

### 1. تنظیمات Runflare

#### Build Command:
```bash
npm install && npx prisma generate && npm run build
```

یا برای استفاده از script با logging:
```bash
npm install && npm run build
```

#### Start Command:
```bash
npm start
```

#### Environment Variables:
باید همه متغیرهای موجود در `env.example` را تنظیم کنید:
- `DATABASE_URL` (ضروری)
- `JWT_SECRET` (ضروری)
- `NODE_ENV=production`
- `TABANSMS_API_KEY`
- و سایر متغیرها

### 2. Scripts موجود

#### `prebuild` (قبل از build):
- بررسی environment variables
- بررسی Prisma schema
- بررسی migrations
- **فایل**: `scripts/pre-build-check.js`

#### `postinstall` (بعد از npm install):
- بررسی node_modules
- Generate Prisma Client
- **فایل**: `scripts/postinstall-check.js`

#### `build` (build اصلی):
- Generate Prisma Client
- Build Next.js
- Verify build output
- **فایل**: `scripts/build-with-logs.js`

#### `prestart` (قبل از start):
- Test database connection
- بررسی Prisma Client
- **فایل**: `scripts/init.js`

#### `start` (start اصلی):
- بررسی build output
- Port checking
- Start Next.js
- **فایل**: `scripts/start-with-logs.js`

### 3. لاگ‌های مهم

تمام لاگ‌ها با prefix `[DEPLOY]` شروع می‌شوند:

- `✅ [DEPLOY]` - موفقیت‌آمیز
- `❌ [DEPLOY]` - خطا
- `⚠️  [DEPLOY]` - هشدار
- `🔍 [DEPLOY]` - بررسی
- `📋 [DEPLOY]` - اطلاعات

### 4. بررسی لاگ‌ها در Runflare

1. به پنل Runflare بروید
2. بخش "Logs" را باز کنید
3. به دنبال `[DEPLOY]` بگردید
4. خطاهای `❌` را بررسی کنید

### 5. مشکلات رایج

#### مشکل: Prisma Client not found
**راه‌حل**: 
```bash
npx prisma generate
```

#### مشکل: Database connection failed
**راه‌حل**: 
- بررسی `DATABASE_URL`
- بررسی دسترسی به دیتابیس از سرور

#### مشکل: Port already in use (EADDRINUSE)
**راه‌حل 1 (خودکار - پیشنهادی)**: 
Script جدید به صورت خودکار این مشکل را حل می‌کند:
```bash
npm start
```
Script خودکار process روی port را kill می‌کند.

**راه‌حل 2 (دستی)**: 
```bash
# پیدا کردن و kill کردن process
lsof -ti:3000 | xargs kill -9

# یا
fuser -k 3000/tcp

# یا استفاده از script
npm run kill-port

# سپس
npm start
```

**راه‌حل 3 (استفاده از port دیگر)**: 
```bash
PORT=3001 npm start
```

#### مشکل: Missing environment variables
**راه‌حل**: 
- بررسی همه متغیرها در Runflare
- استفاده از `env.example` به عنوان مرجع

### 6. Migration

پس از اولین deployment موفق:

```bash
npx prisma migrate deploy
```

یا در Runflare در Post Deploy Script اضافه کنید.

### 7. Health Check

برای بررسی وضعیت سیستم:

```bash
node scripts/health-check.js
```

### 8. Troubleshooting

اگر deployment ناموفق بود:

1. **لاگ‌ها را بررسی کنید**:
   - همه لاگ‌های `❌` را بخوانید
   - خطاهای مربوط به Prisma را بررسی کنید
   - خطاهای مربوط به Environment Variables را بررسی کنید

2. **Build را محلی تست کنید**:
   ```bash
   npm run build
   ```

3. **Database connection را تست کنید**:
   ```bash
   node scripts/health-check.js
   ```

4. **Prisma را بررسی کنید**:
   ```bash
   npx prisma generate
   npx prisma migrate status
   ```

## لاگ‌های مهم برای Monitoring

- `[DEPLOY] Database connection successful` - اتصال به دیتابیس موفق
- `[DEPLOY] Build completed successfully` - Build موفق
- `[DEPLOY] Starting Next.js server` - سرور در حال شروع
- `[DEPLOY] Failed to` - هر خطایی که رخ دهد

## مشکلات Kubernetes / Runflare

### مشکل: Startup probe failed / Unhealthy

**علائم:**
- `Startup probe failed: dial tcp :3000: connect: connection refused`
- `Unhealthy Pod`
- `FailedPostStartHook`

**علت احتمالی:**
سرور Next.js به موقع start نمی‌شود یا روی port درست listen نمی‌کند.

**راه‌حل:**
1. **بررسی لاگ‌ها**: به دنبال `[DEPLOY]` بگردید و ببینید آیا `Next.js server started successfully` را می‌بینید
2. **بررسی port**: مطمئن شوید `PORT` environment variable درست تنظیم شده (معمولاً 3000)
3. **بررسی build**: مطمئن شوید `.next` directory وجود دارد و build موفق بوده
4. **بررسی Prisma**: مطمئن شوید Prisma Client generate شده

**راه‌حل پیشرفته:**
اگر مشکل ادامه داشت، ممکن است نیاز باشد startup probe delay را در Runflare تنظیم کنید:
- Initial delay: 10-15 seconds
- Period: 5 seconds
- Timeout: 3 seconds
- Failure threshold: 3

### مشکل: Back-off restarting

**علائم:**
- `Back-off restarting failed container`
- Pod مدام restart می‌شود

**راه‌حل:**
1. **بررسی exit code**: در لاگ‌ها به دنبال `Exit code` بگردید
2. **بررسی crash**: به دنبال خطاهای runtime بگردید
3. **بررسی memory**: ممکن است memory limit کم باشد

### مشکل: PostStartHook failed

**علائم:**
- `FailedPostStartHook`
- Container kill می‌شود

**راه‌حل:**
این معمولاً به این معنی است که health check یا readiness probe fail شده. مطمئن شوید:
- سرور روی port درست listen می‌کند
- `/api/health` endpoint پاسخ می‌دهد
- Database connection برقرار است

## دیپلوی با Coolify (Git + Nixpacks)

اگر از **Coolify** و اتصال به **Git** استفاده می‌کنید، پروژه با **Nixpacks** بیلد می‌شود (بدون Dockerfile دستی).

### نکته مهم درباره Domains

در Coolify این فیلد معمولاً برای ساختن متغیرهای `COOLIFY_URL` و `COOLIFY_FQDN` استفاده می‌شود و **فقط یک مقدار** را درست پشتیبانی می‌کند.

- **چند مقدار با فاصله/کاما نگذارید** (مثل `coldcake.ir 188.245.233.71`)
- این کار باعث می‌شود دستور `nixpacks plan` با خطای `Found argument ... which wasn't expected` شکست بخورد.

### فایل `nixpacks.toml`

در ریشهٔ پروژه فایل `nixpacks.toml` وجود دارد که:
- **Build:** `npm run build` (خروجی standalone)
- **Start:** `cd .next/standalone && node server.js`
- **HOSTNAME:** `0.0.0.0` برای گوش دادن روی همه اینترفیس‌ها در کانتینر

### Environment Variables در Coolify

- `PORT=3001` (یا همان پورتی که در Network تنظیم کرده‌اید)
- `HOSTNAME=0.0.0.0`
- `DATABASE_URL` و `JWT_SECRET` و بقیهٔ متغیرها طبق `env.example`

### Network در Coolify

- **Ports Exposes** و **Port Mappings** را با همان مقدار `PORT` (مثلاً ۳۰۰۱) یکسان کنید تا PORT mismatch نشود.

---

## خطای ChunkLoadError / 404 برای فایل‌های `_next/static/chunks`

**علائم:** صفحه خطا می‌دهد با پیام «Loading chunk ... failed» و در کنسول مرورگر خطای 404 برای یک فایل `.js` داخل `_next/static/chunks`.

**علت:** معمولاً کش مرورگر یا CDN؛ HTML قدیمی هنوز اسم چانک بیلد قبلی را دارد ولی روی سرور بیلد جدید با نام چانک دیگری است.

**راه‌حل:**
1. **Hard Refresh:** `Ctrl+Shift+R` (ویندوز) یا `Cmd+Shift+R` (مک)
2. **پاک کردن کش سایت:** در DevTools → Application → Storage → Clear site data برای دامنه
3. **حالت ناشناس:** یک بار همان آدرس را در پنجره Incognito/Private باز کنید

بعد از هر Redeploy اگر کاربران چنین خطایی دیدند، یک بار رفرش سخت یا پاک کردن کش کافی است.

---

## نکات

- همیشه لاگ‌ها را قبل از report کردن مشکل بررسی کنید
- لاگ‌ها شامل timestamp هستند
- همه لاگ‌ها به console ارسال می‌شوند و در Runflare logs قابل مشاهده هستند
- Script جدید خودکار port verification انجام می‌دهد
- Health check endpoint در `/api/health` برای monitoring در دسترس است
