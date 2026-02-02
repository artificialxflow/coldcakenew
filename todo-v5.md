# چک‌لیست Cold Cake v5 – نقش‌ها، ادمین، فروشگاه، فاکتور، دیتابیس، طلا

این فایل چک‌لیست تکمیل پلن v5 است: نقش و دسترسی، پنل تحت `/admin`، صفحهٔ اصلی فروشگاه، فاکتور به ازای هر سفارش، ریست/طراحی دیتابیس، و منبع قیمت طلا.

**آخرین بروزرسانی:** ۱۴۰۴/۱۱/۱۲

---

## فاز ۱ – دیتابیس و Schema

- [x] طراحی و اعمال مدل‌های Role, Permission, RolePermission در [prisma/schema.prisma](prisma/schema.prisma)
- [x] افزودن فیلدهای email?, passwordHash?, roleId به User و رابطه با Role
- [x] طراحی و اعمال مدل Invoice و رابطه با Order
- [x] اطمینان از وجود ستون images و سایر فیلدهای لازم در Product در مایگریشن
- [x] تعیین ترتیب مایگریشن‌ها و یکپارچه‌سازی در یک یا چند مایگریشن تمیز
- [x] به‌روزرسانی seed: ایجاد Roleهای پیش‌فرض (admin, accountant و غیره)، Permissionها، یک User ادمین با پسورد، یک User با نقش محدود

## فاز ۲ – احراز هویت و دسترسی

- [x] پیاده‌سازی ورود با یوزر/پسورد در `/admin/login` و صدور JWT/کوکی
- [x] تغییر ریدایرکت پس از لاگین OTP به `/admin` به‌جای `/dashboard`
- [x] پیاده‌سازی تابع/میدلور requirePermission و استفاده در APIهای پنل
- [x] صفحهٔ مدیریت کاربران و نقش‌ها در پنل (`/admin/users`): لیست، افزودن کاربر (یوزر، پسورد، نقش)، ویرایش نقش/دسترسی
- [x] فیلتر منوی Sidebar و دسترسی به صفحات پنل بر اساس Role/Permission

## فاز ۳ – ساختار مسیرها و صفحهٔ اصلی

- [x] انتقال محتوای فروشگاه به صفحهٔ اصلی (`/`) و تنظیم [app/page.tsx](app/page.tsx)
- [x] ایجاد layout پنل در [app/admin/layout.tsx](app/admin/layout.tsx) با محافظت و DashboardLayout
- [x] انتقال یا کپی صفحات پنل به زیر `app/admin/` (dashboard, products, reports, messages, orders, content, gold-price, analytics, maps-scraper, workflows, settings, blog-admin)
- [x] به‌روزرسانی Sidebar و تمام لینک‌های داخلی پنل به پیشوند `/admin/`
- [x] ریدایرکت مسیرهای قدیمی (/dashboard, /products, ...) به معادل /admin/...

## فاز ۴ – فاکتور

- [x] پیاده‌سازی سرویس/API صدور Invoice بلافاصله پس از ایجاد Order و تولید invoiceNumber یکتا
- [x] API دریافت جزئیات فاکتور بر اساس orderId یا invoiceNumber
- [x] صفحه یا API تولید فاکتور قابل چاپ (HTML/PDF) با قالب ثابت
- [x] محدود کردن دسترسی لیست/صدور فاکتور به permissionهای invoices.read و invoices.write

## فاز ۵ – قیمت طلا

- [x] اضافه کردن منبع آنلاین مشخص (API یا اسکرپ) در [lib/services/gold-price-api.service.ts](lib/services/gold-price-api.service.ts) به‌عنوان پیش‌فرض یا fallback
- [x] به‌روزرسانی مستندات env برای متغیرهای قیمت طلا

## فاز ۶ – نهایی

- [x] ایجاد فایل [todo-v5.md](todo-v5.md) در ریشهٔ پروژه با همین چک‌لیست
- [ ] تست ریست دیتابیس (DROP SCHEMA + migrate deploy + seed) و اطمینان از عدم خطای Product.images یا سایر ستون‌ها
- [ ] تست دسترسی نقش محدود (فقط فاکتور/موجودی و غیره) و تست صفحهٔ اصلی به‌عنوان فروشگاه و پنل تحت /admin
