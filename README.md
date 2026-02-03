# ColdCake.ir – راه‌اندازی و دیپلوی

پروژه‌ی **ColdCake** یک اپلیکیشن فروشگاه و پنل مدیریتی است که با **Next.js (App Router)**، **Prisma** و **PostgreSQL** پیاده‌سازی شده و برای تولید روی سرور لینوکسی (مثلاً با **Coolify + Nixpacks**) اجرا می‌شود.

این راهنما تمام مراحل لازم از راه‌اندازی محلی تا دیپلوی روی سرور را پوشش می‌دهد.

---

## 1. پیش‌نیازها

روی سیستم توسعه (محلی):

- Node.js نسخه ۱۸+ (ترجیحاً ۲۰ یا ۲۲)
- npm (یا pnpm/yarn، این راهنما با npm نوشته شده)
- PostgreSQL (برای دیتابیس محلی)
- Git

روی سرور (برای دیپلوی):

- یک سرور لینوکسی (Ubuntu 22/24 پیشنهاد می‌شود)
- Docker و Coolify (یا پلتفرم مشابه)
- یک دیتابیس PostgreSQL (سرویس جدا یا داخل همان سرور)
- دامنه تنظیم‌شده (مثلاً `coldcake.ir`) ترجیحاً پشت Cloudflare

---

## 2. کلون کردن پروژه و راه‌اندازی محلی

```bash
git clone <REPO_URL> coldcake
cd coldcake

# نصب پکیج‌ها
npm install
```

### 2.1 ساخت دیتابیس محلی

در PostgreSQL یک دیتابیس بساز:

```sql
CREATE DATABASE coldcake_db;
```

در ادامه، متغیر `DATABASE_URL` را برای این دیتابیس ست می‌کنیم.

---

## 3. متغیرهای محیطی (Environment Variables)

### 3.1 ساخت فایل env محلی

فایل نمونه را کپی کن:

```bash
cp env.example .env.local
```

سپس `.env.local` را باز کن و حداقل موارد زیر را مقداردهی کن:

- `DATABASE_URL`  
  مثال محلی:
  ```env
  DATABASE_URL=postgresql://postgres:password@localhost:5432/coldcake_db
  ```

- `JWT_SECRET`  
  یک رشته تصادفی و طولانی:
  ```env
  JWT_SECRET=your-super-long-random-secret-at-least-32-chars
  ```

- `NEXT_PUBLIC_SITE_URL` (برای لینک‌های مطلق)
  ```env
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```

- تنظیمات SMS (برای لاگین با OTP – اگر در محیط توسعه نیاز نداری، می‌توانی از مقادیر تست استفاده کنی یا موقتاً خالی بگذاری، ولی در Production باید واقعی باشند):
  ```env
  TABANSMS_BASE_URL=https://edge.ippanel.com/v1
  TABANSMS_API_KEY=<YOUR_TABAN_API_KEY>
  TABANSMS_SENDER_NUMBER=3000xxxx
  TABANSMS_PATTERN_CODE=...
  TABANSMS_PATTERN_VAR=OTP
  ```

لیست کامل متغیرها و توضیحات‌شان در `docs/ENVIRONMENT_VARIABLES.md` آمده است.

---

## 4. Prisma و مایگریشن دیتابیس (محلی)

بعد از تنظیم `.env.local`:

```bash
# تولید Prisma Client
npx prisma generate

# اعمال مایگریشن‌ها روی دیتابیس محلی
npx prisma migrate dev --name init

# در صورت نیاز: پر کردن دیتابیس با داده نمونه
npm run prisma:seed
```

اسکریپت‌ها:

- `npm run prisma:generate` → `prisma generate`
- `npm run prisma:migrate` → `prisma migrate dev`
- `npm run prisma:deploy` → `prisma migrate deploy`
- `npm run prisma:seed` → اجرای `prisma/seed.ts` با tsx

---

## 5. اجرای پروژه در حالت توسعه (Local)

```bash
npm run dev
```

سپس در مرورگر باز کن:

- فروشگاه / UI اصلی: http://localhost:3000  
- ورود به پنل ادمین: http://localhost:3000/auth/login

### 5.1 ورود ادمین تست

برای تسهیل، یک bypass برای admin در کد وجود دارد:

- شماره موبایل: `09126723365`
- کد تأیید (OTP): `0000`

نیازی نیست برای این شماره «دریافت کد» بزنی؛ مستقیم همین شماره و کد ۰۰۰۰ را وارد کن و به پنل ادمین هدایت می‌شوی. اگر نقش `admin` در دیتابیس وجود نداشته باشد، هنگام اولین لاگین ساخته می‌شود.

> توجه: برای استفاده از کاربر و نقش‌های دیگر، می‌توانی `npm run prisma:seed` را اجرا کنی تا نقش‌ها و کاربر ادمین password-based هم ساخته شود.

---

## 6. بیلد Production (Standalone)

برای بیلد production:

```bash
npm run build
```

این اسکریپت:

- env و dependency‌ها را چک می‌کند (`scripts/pre-build-check.js`)
- Prisma Client را generate می‌کند
- Next.js را با خروجی **standalone** می‌سازد (`output: 'standalone'` در `next.config.ts`)
- مسیر `.next/standalone/server.js` را آماده می‌کند

برای اجرای بیلد به‌صورت ساده روی سرور محلی:

```bash
npm start
# یا در صورت نیاز:
npm run start:simple  # next start
```

---

## 7. دیپلوی روی Coolify با GitHub + Nixpacks

### 7.1 آماده‌سازی ریپو

- ریپو را روی GitHub/GitLab قرار بده.
- مطمئن شو `nixpacks.toml` در ریشه پروژه commit شده است:

```toml
[phases.build]
cmds = ["npm run build"]

[start]
cmd = "cd .next/standalone && node server.js"

[variables]
HOSTNAME = "0.0.0.0"
```

### 7.2 ساخت اپ در Coolify

1. در Coolify یک **Application** جدید بساز.
2. **Git Source**:
   - Provider: GitHub
   - Repository: `artificialxflow/coldcakenew` (یا ریپوی خودت)
   - Branch: `main`
3. **Build Pack**: `Nixpacks`
4. **Domains**:
   - فقط: `coldcake.ir`  
     > مهم: این فیلد فقط **یک مقدار** می‌پذیرد. چیزی مثل `coldcake.ir 188.245.233.71` باعث خطای `Found argument ... which wasn't expected` در Nixpacks می‌شود.
5. **Network**:
   - Ports Exposes: مثلاً `3001`
   - Port Mappings: `3001:3001` (یا برابر با پورتی که می‌خواهی)
6. **Environment Variables** در Coolify (Production):

حداقل:

```env
NODE_ENV=production
PORT=3001
HOSTNAME=0.0.0.0

DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db_name>
JWT_SECRET=<production-secret>
NEXT_PUBLIC_SITE_URL=https://coldcake.ir

TABANSMS_BASE_URL=https://edge.ippanel.com/v1
TABANSMS_API_KEY=<real-api-key>
TABANSMS_SENDER_NUMBER=<service-number>
TABANSMS_PATTERN_CODE=<pattern-code>
TABANSMS_PATTERN_VAR=OTP
```

و سایر متغیرها طبق `docs/ENVIRONMENT_VARIABLES.md`.

7. **Healthcheck**:
   - می‌توانی endpoint `/api/health` را برای لایونگنس/ریدینس در Kubernetes یا ابزار مانیتورینگ استفاده کنی.

---

## 8. مایگریت دیتابیس در Production (خودکار)

بعد از اولین دیپلوی روی سرور Production باید مایگریشن‌ها را اعمال کنی. دو روش:

### 8.1 اجرای دستی (یک بار)

روی سرور (یا از طریق “Exec” در Coolify):

```bash
npm run prisma:deploy
# در صورت نیاز:
npm run prisma:generate
```

### 8.2 Post-Deploy Script در Coolify

در تنظیمات اپ، در بخش **Post Deploy Script** می‌توانی اضافه کنی:

```bash
npm run prisma:deploy
```

به این ترتیب هر بار که دیپلوی جدید موفق شود، مایگریشن‌ها هم اتوماتیک روی دیتابیس Production اعمال می‌شوند.

---

## 9. پیکربندی Cloudflare / دامنه

برای `coldcake.ir` اگر از Cloudflare استفاده می‌کنی:

- DNS:
  - A → `coldcake.ir` → IP سرور (مثلاً `188.245.233.71`) → **Proxied (ابر نارنجی)**
- SSL/TLS:
  - **Encryption mode: Full** (نه Flexible)  
    تا حلقه‌ی ریدایرکت HTTPS ایجاد نشود.
- بهتر است Always Use HTTPS روشن باشد.

> توصیه: سایت را همیشه با دامنه (`https://coldcake.ir`) استفاده کن، نه مستقیماً با IP، چون دسترسی با IP می‌تواند باعث ۴۰۴ روی `/_next/static/*` به‌خاطر تنظیمات Traefik/Coolify شود.

---

## 10. Health Check و مانیتورینگ

### 10.1 اسکریپت محلی

```bash
node scripts/health-check.js
```

### 10.2 Endpoint HTTP

- `GET /api/health`  
  برمی‌گرداند:
  ```json
  {
    "status": "ok" | "error",
    "timestamp": "...",
    "uptime": 123,
    "environment": "production",
    "database": "ok" | "error" | "unknown"
  }
  ```

این endpoint برای health-check در Load Balancer / Kubernetes / UptimeRobot مناسب است.

---

## 11. کامندهای پرکاربرد

```bash
# توسعه
npm run dev

# بیلد production
npm run build

# استارت production (با اسکریپت لاگ‌دار)
npm start

# استارت ساده Next.js
npm run start:simple

# Prisma
npx prisma generate
npx prisma migrate dev --name <name>
npm run prisma:deploy
npm run prisma:seed

# تست دیتابیس و سرویس‌ها
node scripts/health-check.js
```

---

## 12. منابع تکمیلی

- `docs/ENVIRONMENT_VARIABLES.md` – توضیح کامل تمام env ها
- `docs/DEPLOYMENT.md` – جزئیات بیشتر دیپلوی و troubleshooting
- `docs/CRON_ENDPOINTS.md` – اندپوینت‌های cron و یکپارچه‌سازی‌ها
- `docs/n8n-integration.md` – اتصال به n8n برای پیام‌ها و قیمت طلا
