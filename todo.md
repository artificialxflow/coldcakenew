## کارهای اصلی پیاده‌سازی

### ✅ تکمیل شده
- [x] راه‌اندازی Prisma و مدل‌های دیتابیس (User, SmsCode, Session و تمام مدل‌های تجاری)
- [x] پیاده‌سازی سرویس Taban SMS با کد 3000505
- [x] پیاده‌سازی APIهای احراز هویت (`request-code`, `verify-code`, `me`, `logout`)
- [x] ایجاد صفحات احراز هویت (`/auth/login`) با فرم دو مرحله‌ای SMS
- [x] ساخت داشبورد محافظت‌شده و اتصال آن به JWT
- [x] ایجاد API routes و services برای Customers, Products, Sales, Debts
- [x] ایجاد API routes و services برای Gold Price, Analytics, Content, Maps Scraper
- [x] ایجاد صفحه Settings با مدیریت Integration Settings
- [x] ایجاد صفحه Dashboard
- [x] ایجاد صفحه Messages
- [x] ایجاد صفحه Gold Price
- [x] ایجاد UI Components و Design System
- [x] ایجاد مستندات Google Apps Script و n8n

### 🔄 در حال انجام
- [ ] ساخت API routes برای Reports: GET /api/reports/sales، GET /api/reports/export (Excel/PDF)
- [ ] ساخت API routes برای Bank Ledger: GET /api/bank-ledger/export
- [ ] ساخت صفحه Reports (app/reports/page.tsx) با تب‌های Summary, Sales, Debts, Inventory, Forms, Bank Ledger و Export functionality
- [ ] ساخت صفحه Analytics (app/analytics/page.tsx) با customer interests، seasonal predictions
- [ ] ساخت صفحه Content (app/content/page.tsx) با آپلود محتوا، AI enhancement، scheduling
- [ ] ساخت صفحه Maps Scraper (app/maps-scraper/page.tsx)
- [ ] ساخت صفحه Workflows (app/workflows/page.tsx) با نمایش workflows تعریف شده، فعال/غیرفعال کردن، اجرای دستی
- [ ] ایجاد مستندات Environment Variables (docs/ENVIRONMENT_VARIABLES.md)
- [ ] تست کامل: API endpoints، Forms، Validations، Export functions، Authentication، Settings Management

### ⏳ در انتظار
- [ ] ایجاد و اجرای Migration برای مدل‌های جدید (prisma migrate dev) - بعداً وقتی دیتابیس در دسترس باشد
