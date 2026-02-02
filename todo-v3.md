# TODO v3 - فروشگاه آنلاین کامل

## فاز 1: دیتابیس و مدل‌ها

- [x] به‌روزرسانی Prisma Schema: اضافه کردن مدل‌های Order, OrderItem, Payment, Cart, CartItem, BlogPost, Address
- [x] به‌روزرسانی مدل Product: اضافه کردن images, slug, priceType, featured, seoTitle, seoDescription
- [x] ایجاد و اجرای Prisma migration برای مدل‌های جدید

## فاز 2: Backend APIs

### API های فروشگاه عمومی
- [x] ایجاد API /api/store/products برای لیست محصولات عمومی
- [x] ایجاد API /api/store/products/[id] برای جزئیات محصول
- [x] ایجاد API /api/store/categories برای لیست دسته‌بندی‌ها

### API های سبد خرید
- [x] ایجاد API /api/store/cart برای مدیریت سبد خرید

### API های سفارش
- [x] ایجاد API /api/store/orders برای ایجاد و مدیریت سفارش‌ها

### API های پرداخت
- [x] ایجاد API /api/store/payments برای پرداخت (دستی + بستر زرین‌پال)

### API های بلاگ
- [x] ایجاد API /api/blog برای مدیریت پست‌های بلاگ

## فاز 3: Services

- [x] ایجاد service برای مدیریت سبد خرید (lib/services/cart.service.ts)
- [x] ایجاد service برای مدیریت سفارش‌ها (lib/services/order.service.ts)
- [x] ایجاد service برای پرداخت با یکپارچه‌سازی زرین‌پال (lib/services/payment.service.ts)
- [x] ایجاد service برای بلاگ (lib/services/blog.service.ts)

## فاز 4: Frontend - فروشگاه عمومی

- [x] ایجاد صفحه اصلی فروشگاه (app/store/page.tsx)
- [x] ایجاد صفحه لیست محصولات (app/store/products/page.tsx)
- [x] ایجاد صفحه جزئیات محصول (app/store/products/[id]/page.tsx)
- [x] ایجاد کامپوننت‌های فروشگاه (ProductCard, ProductGallery, PriceDisplay, etc.)

## فاز 5: Frontend - سبد خرید و تسویه

- [x] ایجاد صفحه سبد خرید (app/store/cart/page.tsx)
- [x] ایجاد صفحه تسویه حساب (app/store/checkout/page.tsx)

## فاز 6: Frontend - بلاگ

- [x] ایجاد صفحه لیست بلاگ (app/blog/page.tsx)
- [x] ایجاد صفحه نمایش پست بلاگ (app/blog/[slug]/page.tsx)
- [x] ایجاد کامپوننت‌های بلاگ (BlogCard, BlogPost, BlogSidebar)

## فاز 7: Frontend - پنل کاربری

- [x] ایجاد صفحه حساب کاربری (app/store/account/page.tsx)
- [x] ایجاد صفحه سفارش‌های کاربر (app/store/account/orders/page.tsx)

## فاز 8: Admin Panel

- [x] ایجاد صفحه مدیریت سفارش‌ها در پنل ادمین (app/orders/page.tsx)
- [x] ایجاد صفحه مدیریت بلاگ در پنل ادمین (app/blog-admin/page.tsx)
- [x] به‌روزرسانی صفحه مدیریت محصولات برای پشتیبانی از فیلدهای جدید

## فاز 9: Utilities و Helpers

- [x] ایجاد utility functions برای SEO (slug, meta tags, structured data)
- [x] به‌روزرسانی types/index.ts با interface های جدید

## فاز 10: Configuration

- [x] به‌روزرسانی middleware برای مسیرهای جدید فروشگاه و بلاگ
- [x] اضافه کردن متغیرهای محیطی برای زرین‌پال
- [ ] پیاده‌سازی SEO برای صفحات فروشگاه و بلاگ (اختیاری - می‌تواند بعداً اضافه شود)
