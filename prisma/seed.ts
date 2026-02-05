import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSION_KEYS = [
  { key: 'invoices.read', name: 'مشاهده فاکتورها', category: 'فاکتور' },
  { key: 'invoices.write', name: 'ثبت و ویرایش فاکتور', category: 'فاکتور' },
  { key: 'inventory.read', name: 'مشاهده موجودی', category: 'موجودی' },
  { key: 'inventory.write', name: 'ویرایش موجودی', category: 'موجودی' },
  { key: 'products.read', name: 'مشاهده محصولات', category: 'محصولات' },
  { key: 'products.write', name: 'ویرایش محصولات', category: 'محصولات' },
  { key: 'reports.read', name: 'مشاهده گزارش‌ها', category: 'گزارش' },
  { key: 'reports.write', name: 'خروجی گزارش', category: 'گزارش' },
  { key: 'users.read', name: 'مشاهده کاربران', category: 'کاربران' },
  { key: 'users.write', name: 'مدیریت کاربران و نقش', category: 'کاربران' },
  { key: 'orders.read', name: 'مشاهده سفارشات', category: 'سفارش' },
  { key: 'orders.write', name: 'مدیریت سفارشات', category: 'سفارش' },
  { key: 'settings.read', name: 'مشاهده تنظیمات', category: 'تنظیمات' },
  { key: 'settings.write', name: 'ویرایش تنظیمات', category: 'تنظیمات' },
] as const;

async function main() {
  console.log('🌱 شروع seeding...');

  // ایجاد نقش‌ها و دسترسی‌ها (قبل از کاربران)
  console.log('🔐 ایجاد نقش‌ها و دسترسی‌ها...');
  const permissions = await Promise.all(
    PERMISSION_KEYS.map((p) =>
      prisma.permission.upsert({
        where: { key: p.key },
        create: p,
        update: { name: p.name, category: p.category },
      })
    )
  );

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    create: { name: 'admin', description: 'دسترسی کامل به پنل' },
    update: {},
  });

  const accountantRole = await prisma.role.upsert({
    where: { name: 'accountant' },
    create: { name: 'accountant', description: 'فاکتور، گزارش و موجودی' },
    update: {},
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
  });

  const accountantPermissionKeys = ['invoices.read', 'invoices.write', 'inventory.read', 'reports.read', 'reports.write', 'orders.read'];
  const accountantPermIds = permissions.filter((p) => accountantPermissionKeys.includes(p.key)).map((p) => p.id);
  await prisma.rolePermission.deleteMany({ where: { roleId: accountantRole.id } });
  await prisma.rolePermission.createMany({
    data: accountantPermIds.map((pid) => ({ roleId: accountantRole.id, permissionId: pid })),
  });
  console.log('✅ نقش‌ها و دسترسی‌ها ایجاد شد');

  // ایجاد یک کاربر تست OTP (اگر وجود ندارد)
  let testUser = await prisma.user.findFirst({
    where: { phone: '09121234567' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        phone: '09121234567',
        roleId: adminRole.id,
      },
    });
    console.log('✅ کاربر تست OTP ایجاد شد:', testUser.id);
  } else {
    await prisma.user.update({
      where: { id: testUser.id },
      data: { roleId: adminRole.id },
    });
    console.log('ℹ️ کاربر تست از قبل وجود دارد:', testUser.id);
  }

  const userId = testUser.id;

  // ادمین با یوزر/پسورد
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  // #region agent log
  fetch('http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'prisma/seed.ts:90',message:'seed:admin-user:lookup',data:{username:'admin'},timestamp:Date.now(),sessionId:'debug-session',runId:'seed-debug',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const existingAdmin = await prisma.user.findFirst({ where: { username: 'admin' } });
  const adminUser = existingAdmin
    ? await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { passwordHash: adminPasswordHash, roleId: adminRole.id },
      })
    : await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@coldcake.ir',
          passwordHash: adminPasswordHash,
          roleId: adminRole.id,
        },
      });
  // #region agent log
  fetch('http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'prisma/seed.ts:108',message:'seed:admin-user:result',data:{action:existingAdmin?'update':'create',userId:adminUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'seed-debug',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  console.log('✅ کاربر ادمین (admin / admin123) ایجاد شد');

  const accountantPasswordHash = await bcrypt.hash('acc123', 10);
  // #region agent log
  fetch('http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'prisma/seed.ts:116',message:'seed:accountant-user:lookup',data:{username:'accountant'},timestamp:Date.now(),sessionId:'debug-session',runId:'seed-debug',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const existingAccountant = await prisma.user.findFirst({ where: { username: 'accountant' } });
  const accountantUser = existingAccountant
    ? await prisma.user.update({
        where: { id: existingAccountant.id },
        data: { passwordHash: accountantPasswordHash, roleId: accountantRole.id },
      })
    : await prisma.user.create({
        data: {
          username: 'accountant',
          email: 'accountant@coldcake.ir',
          passwordHash: accountantPasswordHash,
          roleId: accountantRole.id,
        },
      });
  // #region agent log
  fetch('http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'prisma/seed.ts:134',message:'seed:accountant-user:result',data:{action:existingAccountant?'update':'create',userId:accountantUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'seed-debug',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  console.log('✅ کاربر حسابدار (accountant / acc123) ایجاد شد');

  // حذف داده‌های قبلی (اختیاری - برای seeding مجدد)
  console.log('🧹 پاک‌سازی داده‌های قبلی...');
  await prisma.invoice.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.bankTransaction.deleteMany({});
  await prisma.bankAccount.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.debt.deleteMany({});
  await prisma.customerInterest.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.socialInteraction.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.customer.deleteMany({ where: { userId } });
  await prisma.product.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.goldPriceHistory.deleteMany({});
  await prisma.goldPrice.deleteMany({});
  await prisma.blogPost.deleteMany({});

  // ایجاد مشتریان تست (8 مشتری)
  console.log('👥 ایجاد مشتریان تست...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: 'علی',
        lastName: 'احمدی',
        phone: '09121111111',
        email: 'ali.ahmadi@example.com',
        favoriteProducts: ['سرویس سیسمونی', 'رختخواب نوزاد'],
        preferences: {
          productType: ['سیسمونی', 'رختخواب'],
          colors: ['صورتی', 'آبی', 'سفید'],
          quality: 'عالی',
          priceRange: { min: 1500000, max: 5000000 },
        },
        userId,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'مریم',
        lastName: 'محمدی',
        phone: '09122222222',
        email: 'maryam.mohammadi@example.com',
        favoriteProducts: ['کالسکه سه کاره', 'کریر نوزاد'],
        preferences: {
          productType: ['کالسکه و کریر'],
          colors: ['بژ', 'مشکی'],
          quality: 'خوب',
          priceRange: { min: 1500000, max: 5000000 },
        },
        userId,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'حسن',
        lastName: 'کریمی',
        phone: '09123333333',
        email: 'hasan.karimi@example.com',
        favoriteProducts: ['سرویس سیسمونی', 'پتو نوزاد'],
        preferences: {
          productType: ['سیسمونی', 'رختخواب'],
          colors: ['کرم', 'صورتی'],
          quality: 'عالی',
          priceRange: { min: 2000000, max: 4500000 },
        },
        manualDebtBalance: 2500000,
        userId,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'زهرا',
        lastName: 'رضایی',
        phone: '09124444444',
        email: 'zahra.rezaei@example.com',
        favoriteProducts: ['شیشه شیر', 'ست ظروف تغذیه'],
        preferences: {
          productType: ['لوازم تغذیه'],
          colors: ['صورتی', 'شفاف'],
          quality: 'خوب',
          priceRange: { min: 300000, max: 1000000 },
        },
        userId,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'رضا',
        lastName: 'نوری',
        phone: '09125555555',
        email: 'reza.noori@example.com',
        favoriteProducts: ['کالسکه سه کاره', 'صندلی ماشین کودک'],
        preferences: {
          productType: ['کالسکه و کریر'],
          colors: ['آبی', 'مشکی'],
          quality: 'عالی',
          priceRange: { min: 3000000, max: 5000000 },
        },
        manualDebtBalance: 5000000,
        userId,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'سارا',
        lastName: 'حسینی',
        phone: '09126666666',
        email: 'sara.hosseini@example.com',
        favoriteProducts: ['اسباب‌بازی موزیکال', 'شامپو و لوسیون نوزاد'],
        preferences: {
          productType: ['اسباب‌بازی', 'لوازم بهداشتی'],
          colors: ['چند رنگ'],
          quality: 'خوب',
          priceRange: { min: 400000, max: 700000 },
        },
        userId,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'امیر',
        lastName: 'فاطمی',
        phone: '09127777777',
        email: 'amir.fatemi@example.com',
        favoriteProducts: ['سرویس سیسمونی کامل'],
        preferences: {
          productType: ['سیسمونی'],
          colors: ['صورتی', 'آبی'],
          quality: 'خوب',
          priceRange: { min: 2300000, max: 2600000 },
        },
        userId,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'نرگس',
        lastName: 'صادقی',
        phone: '09128888888',
        email: 'narges.sadeghi@example.com',
        favoriteProducts: ['سرویس سیسمونی', 'رختخواب نوزاد'],
        preferences: {
          productType: ['سیسمونی', 'رختخواب'],
          colors: ['سفید', 'صورتی'],
          quality: 'عالی',
          priceRange: { min: 2000000, max: 4500000 },
        },
        userId,
      },
    }),
  ]);

  console.log(`✅ ${customers.length} مشتری ایجاد شد`);

  // ایجاد محصولات تست (12 محصول)
  console.log('📦 ایجاد محصولات تست...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'سرویس سیسمونی کامل صورتی',
        color: 'صورتی',
        category: 'سیسمونی',
        originalPrice: 2500000,
        finalPrice: 2500000,
        description: 'سرویس کامل سیسمونی نوزاد شامل لباس، روتختی، ملافه و بالش',
        stock: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: 'سرویس سیسمونی کامل آبی',
        color: 'آبی',
        category: 'سیسمونی',
        originalPrice: 2600000,
        finalPrice: 2600000,
        description: 'سرویس کامل سیسمونی نوزاد طرح دار با کیفیت عالی',
        stock: 4,
      },
    }),
    prisma.product.create({
      data: {
        name: 'سرویس سیسمونی کرم',
        color: 'کرم',
        category: 'سیسمونی',
        originalPrice: 2300000,
        finalPrice: 2300000,
        description: 'سرویس سیسمونی نوزاد رنگ کرم و سفید',
        stock: 6,
      },
    }),
    prisma.product.create({
      data: {
        name: 'رختخواب نوزاد طرح حیوانات',
        color: 'صورتی',
        category: 'رختخواب',
        originalPrice: 1800000,
        finalPrice: 1800000,
        description: 'رخت خوابی نوزاد با طرح حیوانات و کیفیت عالی',
        stock: 3,
      },
    }),
    prisma.product.create({
      data: {
        name: 'پتو نوزاد زمستانی',
        color: 'سفید',
        category: 'رختخواب',
        originalPrice: 1200000,
        finalPrice: 1200000,
        description: 'پتو گرم و نرم مخصوص زمستان برای نوزاد',
        stock: 8,
      },
    }),
    prisma.product.create({
      data: {
        name: 'کالسکه سه کاره',
        color: 'مشکی',
        category: 'کالسکه و کریر',
        originalPrice: 4500000,
        finalPrice: 4500000,
        description: 'کالسکه سه کاره با قابلیت تبدیل به کریر و صندلی',
        stock: 2,
      },
    }),
    prisma.product.create({
      data: {
        name: 'کریر نوزاد',
        color: 'بژ',
        category: 'کالسکه و کریر',
        originalPrice: 1500000,
        finalPrice: 1500000,
        description: 'کریر قابل حمل برای نوزاد با کیفیت بالا',
        stock: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: 'شیشه شیر پلاستیکی',
        color: 'شفاف',
        category: 'لوازم تغذیه',
        originalPrice: 350000,
        finalPrice: 350000,
        description: 'شیشه شیر پلاستیکی ضد حساسیت 250 میلی‌لیتر',
        stock: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: 'ست ظروف تغذیه نوزاد',
        color: 'صورتی',
        category: 'لوازم تغذیه',
        originalPrice: 800000,
        finalPrice: 800000,
        description: 'ست کامل ظروف تغذیه شامل قاشق، چنگال و کاسه',
        stock: 10,
      },
    }),
    prisma.product.create({
      data: {
        name: 'اسباب‌بازی موزیکال',
        color: 'چند رنگ',
        category: 'اسباب‌بازی',
        originalPrice: 650000,
        finalPrice: 650000,
        description: 'اسباب‌بازی موزیکال برای نوزاد 6 ماه به بالا',
        stock: 12,
      },
    }),
    prisma.product.create({
      data: {
        name: 'صندلی ماشین کودک',
        color: 'آبی',
        category: 'کالسکه و کریر',
        originalPrice: 3200000,
        finalPrice: 3200000,
        description: 'صندلی ماشین استاندارد برای کودک 0 تا 4 سال',
        stock: 3,
      },
    }),
    prisma.product.create({
      data: {
        name: 'شامپو و لوسیون نوزاد',
        color: 'شفاف',
        category: 'لوازم بهداشتی',
        originalPrice: 420000,
        finalPrice: 420000,
        description: 'ست کامل شامپو و لوسیون مخصوص نوزاد ضد حساسیت',
        stock: 20,
      },
    }),
  ]);

  console.log(`✅ ${products.length} محصول ایجاد شد`);

  // ایجاد موجودی برای محصولات
  console.log('📊 ایجاد موجودی محصولات...');
  await Promise.all(
    products.map((product) =>
      prisma.inventory.create({
        data: {
          productId: product.id,
          productName: product.name,
          quantity: product.stock,
        },
      })
    )
  );
  console.log('✅ موجودی محصولات ایجاد شد');

  // ایجاد فروش‌های تست (6 فروش)
  console.log('💰 ایجاد فروش‌های تست...');
  const now = new Date();
  const sales = await Promise.all([
    prisma.sale.create({
      data: {
        customerId: customers[0].id,
        customerName: `${customers[0].firstName} ${customers[0].lastName}`,
        amount: 5000000,
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 روز پیش
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        items: {
          create: {
            productId: products[0].id,
            productName: products[0].name,
            quantity: 1,
            unitPrice: 5000000,
          },
        },
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[1].id,
        customerName: `${customers[1].firstName} ${customers[1].lastName}`,
        amount: 6000000,
        date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 روز پیش
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        items: {
          create: {
            productId: products[5].id,
            productName: products[5].name,
            quantity: 1,
            unitPrice: 6000000,
          },
        },
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[2].id,
        customerName: `${customers[2].firstName} ${customers[2].lastName}`,
        amount: 25000000,
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 روز پیش
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        items: {
          create: {
            productId: products[9].id,
            productName: products[9].name,
            quantity: 1,
            unitPrice: 25000000,
          },
        },
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[3].id,
        customerName: `${customers[3].firstName} ${customers[3].lastName}`,
        amount: 3500000,
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 روز پیش
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        items: {
          create: {
            productId: products[7].id,
            productName: products[7].name,
            quantity: 1,
            unitPrice: 3500000,
          },
        },
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[4].id,
        customerName: `${customers[4].firstName} ${customers[4].lastName}`,
        amount: 9000000,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 روز پیش
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        items: {
          create: {
            productId: products[4].id,
            productName: products[4].name,
            quantity: 1,
            unitPrice: 9000000,
          },
        },
      },
    }),
    prisma.sale.create({
      data: {
        customerId: customers[5].id,
        customerName: `${customers[5].firstName} ${customers[5].lastName}`,
        amount: 13000000,
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 روز پیش
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        items: {
          create: [
            {
              productId: products[5].id,
              productName: products[5].name,
              quantity: 1,
              unitPrice: 6000000,
            },
            {
              productId: products[3].id,
              productName: products[3].name,
              quantity: 1,
              unitPrice: 7000000,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ ${sales.length} فروش ایجاد شد`);

  // ایجاد بدهی‌های تست (4 بدهی)
  console.log('💳 ایجاد بدهی‌های تست...');
  await Promise.all([
    prisma.debt.create({
      data: {
        customerId: customers[2].id,
        customerName: `${customers[2].firstName} ${customers[2].lastName}`,
        amount: 2500000,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 روز بعد
        status: 'pending',
        type: 'received',
      },
    }),
    prisma.debt.create({
      data: {
        customerId: customers[4].id,
        customerName: `${customers[4].firstName} ${customers[4].lastName}`,
        amount: 5000000,
        dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 روز بعد
        status: 'pending',
        type: 'received',
      },
    }),
    prisma.debt.create({
      data: {
        customerId: customers[0].id,
        customerName: `${customers[0].firstName} ${customers[0].lastName}`,
        amount: 1000000,
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 روز پیش
        status: 'paid',
        type: 'received',
      },
    }),
    prisma.debt.create({
      data: {
        customerId: customers[1].id,
        customerName: `${customers[1].firstName} ${customers[1].lastName}`,
        amount: 800000,
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 روز بعد
        status: 'pending',
        type: 'paid',
      },
    }),
  ]);

  console.log('✅ بدهی‌های تست ایجاد شد');

  // به‌روزرسانی آمار مشتریان
  console.log('📈 به‌روزرسانی آمار مشتریان...');
  await Promise.all(
    customers.map(async (customer, index) => {
      const customerSales = sales.filter((s) => s.customerId === customer.id);
      const totalPurchases = customerSales.length;
      const lastPurchaseDate = customerSales.length > 0 
        ? customerSales.sort((a, b) => b.date.getTime() - a.date.getTime())[0].date
        : null;

      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalPurchases,
          lastPurchaseDate,
        },
      });
    })
  );

  console.log('✅ آمار مشتریان به‌روزرسانی شد');

  // تنظیم قیمت طلا
  console.log('🥇 تنظیم قیمت طلا...');
  const nowForGold = new Date();
  await prisma.goldPrice.create({
    data: {
      price: 55000000, // قیمت طلای 21 عیار (میلیون تومان)
      change: 0,
      changePercent: 0,
      lastUpdate: nowForGold,
      trend: 'stable',
      yearlyHighest: 55000000,
      yearlyHighestDate: nowForGold,
    },
  });
  console.log('✅ قیمت طلا تنظیم شد');

  // ایجاد حساب بانکی و تراکنش‌های نمونه
  console.log('🏦 ایجاد حساب بانکی و تراکنش‌های نمونه...');
  const bankAccount = await prisma.bankAccount.create({
    data: {
      accountNumber: '6037-1234-5678-9012',
      bankName: 'بانک ملی',
      accountType: 'current',
      initialBalance: 50000000,
      currentBalance: 50000000,
    },
  });
  await prisma.bankTransaction.create({
    data: {
      rowNumber: 1,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      accountId: bankAccount.id,
      accountNumber: bankAccount.accountNumber,
      type: 'received',
      debit: null,
      credit: 10000000,
      balance: 60000000,
    },
  });
  await prisma.bankTransaction.create({
    data: {
      rowNumber: 2,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      accountId: bankAccount.id,
      accountNumber: bankAccount.accountNumber,
      type: 'paid',
      debit: 5000000,
      credit: null,
      balance: 55000000,
    },
  });
  console.log('✅ حساب بانکی و تراکنش‌ها ایجاد شد');

  // ایجاد پست بلاگ نمونه برای فروشگاه
  console.log('📝 ایجاد پست بلاگ نمونه...');
  await prisma.blogPost.create({
    data: {
      title: 'به فروشگاه لوازم بچه و سیسمونی خوش آمدید',
      slug: 'welcome-to-baby-store',
      content: 'این فروشگاه انواع لوازم نوزاد و سیسمونی را با بهترین کیفیت ارائه می‌دهد. از سرویس سیسمونی گرفته تا کالسکه و لوازم تغذیه.',
      excerpt: 'معرفی فروشگاه و محصولات',
      published: true,
      publishedAt: new Date(),
      views: 0,
      category: 'اخبار',
      tags: ['خوش‌آمدگویی', 'فروشگاه'],
    },
  });
  console.log('✅ پست بلاگ ایجاد شد');

  console.log('\n🎉 Seeding با موفقیت تکمیل شد!');
  console.log(`📊 خلاصه:`);
  console.log(`   - ${customers.length} مشتری`);
  console.log(`   - ${products.length} محصول`);
  console.log(`   - ${sales.length} فروش`);
  console.log(`   - 4 بدهی`);
  console.log(`   - 1 تنظیمات قیمت طلا`);
  console.log(`   - 1 حساب بانکی + 2 تراکنش`);
  console.log(`   - 1 پست بلاگ`);
}

main()
  .catch((e) => {
    console.error('❌ خطا در seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
