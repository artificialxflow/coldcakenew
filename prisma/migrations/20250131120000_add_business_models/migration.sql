-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "favoriteProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" JSONB,
    "lastSuggestedProduct" TEXT,
    "lastPurchaseDate" TIMESTAMP(3),
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "manualDebtBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "slug" TEXT,
    "priceType" TEXT NOT NULL DEFAULT 'fixed',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "supplier" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "checkNumber" TEXT,
    "bank" TEXT,
    "receiveDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "type" TEXT,
    "description" TEXT,
    "accountNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "productId" TEXT,
    "templateId" TEXT,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "automationRunId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "initialBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "checkNumber" TEXT,
    "paidCheckNumber" TEXT,
    "description" TEXT,
    "debit" DOUBLE PRECISION,
    "credit" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION NOT NULL,
    "manualRemaining" DOUBLE PRECISION,
    "customerId" TEXT,
    "customerName" TEXT,
    "bank" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldPrice" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL,
    "changePercent" DOUBLE PRECISION NOT NULL,
    "lastUpdate" TIMESTAMP(3) NOT NULL,
    "trend" TEXT NOT NULL,
    "yearlyHighest" DOUBLE PRECISION NOT NULL,
    "yearlyHighestDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoldPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldPriceHistory" (
    "id" TEXT NOT NULL,
    "goldPriceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL,
    "changePercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GoldPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceChange" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "PriceChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceUpdateLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "variable" TEXT NOT NULL,
    "previousPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "productsAffected" INTEGER NOT NULL,
    "totalPriceIncrease" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceUpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPriceUpdate" (
    "id" TEXT NOT NULL,
    "priceUpdateLogId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "previousPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "priceIncrease" DOUBLE PRECISION NOT NULL,
    "priceIncreasePercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductPriceUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerInterest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productTypes" JSONB NOT NULL,
    "colors" JSONB NOT NULL,
    "quality" JSONB NOT NULL,
    "priceRange" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonalPrediction" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "predictedSales" INTEGER NOT NULL,
    "recommendationDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confidence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonalPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialInteraction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contentId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalCaption" TEXT,
    "aiEnhancedCaption" TEXT,
    "publishedAt" TIMESTAMP(3),
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledDate" TIMESTAMP(3),
    "views" INTEGER DEFAULT 0,
    "likes" INTEGER DEFAULT 0,
    "comments" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomatedMessageRun" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "frequency" TEXT NOT NULL,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "sentMessages" INTEGER NOT NULL DEFAULT 0,
    "failedMessages" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "messages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomatedMessageRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapsScrapeTarget" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "radius" INTEGER,
    "radiusType" TEXT,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalFound" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MapsScrapeTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapedBusiness" (
    "id" TEXT NOT NULL,
    "scrapeTargetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "rating" DOUBLE PRECISION,
    "reviews" INTEGER,
    "website" TEXT,
    "googleMapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "category" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapedBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapsScrapeRun" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalFound" INTEGER NOT NULL DEFAULT 0,
    "businessesScraped" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "error" TEXT,
    "progress" INTEGER,

    CONSTRAINT "MapsScrapeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL,
    "businessName" TEXT,
    "contactPhone" TEXT NOT NULL,
    "telegramChannel" TEXT NOT NULL,
    "rubikaChannel" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "instagramPage" TEXT NOT NULL,
    "address" TEXT,
    "goldPriceIncreasePercent" DOUBLE PRECISION,
    "discountPercent" DOUBLE PRECISION,
    "discountDurationHours" INTEGER,
    "pricingVariable" TEXT,
    "priceIncreasePercent" DOUBLE PRECISION,
    "autoPriceUpdateEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoPriceUpdateTime" TEXT,
    "automatedMessaging" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSettings" (
    "id" TEXT NOT NULL,
    "googleCloudClientId" TEXT,
    "googleCloudClientSecret" TEXT,
    "n8nWebhookUrl" TEXT,
    "geminiApiKey" TEXT,
    "openAiApiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "shippingAddress" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "gateway" TEXT,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");
-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");
-- CreateIndex
CREATE INDEX "Customer_userId_idx" ON "Customer"("userId");
-- CreateIndex
CREATE INDEX "Customer_lastPurchaseDate_idx" ON "Customer"("lastPurchaseDate");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");
-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");
-- CreateIndex
CREATE INDEX "Product_featured_idx" ON "Product"("featured");
-- CreateIndex
CREATE INDEX "Product_priceType_idx" ON "Product"("priceType");

-- CreateIndex
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
-- CreateIndex
CREATE INDEX "Sale_date_idx" ON "Sale"("date");
-- CreateIndex
CREATE INDEX "Sale_month_year_idx" ON "Sale"("month", "year");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
-- CreateIndex
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");

-- CreateIndex
CREATE INDEX "Purchase_productId_idx" ON "Purchase"("productId");
-- CreateIndex
CREATE INDEX "Purchase_purchaseDate_idx" ON "Purchase"("purchaseDate");
-- CreateIndex
CREATE INDEX "Purchase_customerId_idx" ON "Purchase"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_key" ON "Inventory"("productId");
-- CreateIndex
CREATE INDEX "Inventory_productId_idx" ON "Inventory"("productId");

-- CreateIndex
CREATE INDEX "Debt_customerId_idx" ON "Debt"("customerId");
-- CreateIndex
CREATE INDEX "Debt_dueDate_idx" ON "Debt"("dueDate");
-- CreateIndex
CREATE INDEX "Debt_status_idx" ON "Debt"("status");

-- CreateIndex
CREATE INDEX "Message_customerId_idx" ON "Message"("customerId");
-- CreateIndex
CREATE INDEX "Message_platform_idx" ON "Message"("platform");
-- CreateIndex
CREATE INDEX "Message_sentAt_idx" ON "Message"("sentAt");
-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");
-- CreateIndex
CREATE INDEX "Message_automationRunId_idx" ON "Message"("automationRunId");

-- CreateIndex
CREATE INDEX "MessageTemplate_name_idx" ON "MessageTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_accountNumber_key" ON "BankAccount"("accountNumber");
-- CreateIndex
CREATE INDEX "BankAccount_accountNumber_idx" ON "BankAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "BankTransaction_accountId_idx" ON "BankTransaction"("accountId");
-- CreateIndex
CREATE INDEX "BankTransaction_date_idx" ON "BankTransaction"("date");
-- CreateIndex
CREATE INDEX "BankTransaction_type_idx" ON "BankTransaction"("type");
-- CreateIndex
CREATE INDEX "BankTransaction_status_idx" ON "BankTransaction"("status");

-- CreateIndex
CREATE INDEX "GoldPriceHistory_goldPriceId_idx" ON "GoldPriceHistory"("goldPriceId");
-- CreateIndex
CREATE INDEX "GoldPriceHistory_date_idx" ON "GoldPriceHistory"("date");

-- CreateIndex
CREATE INDEX "PriceChange_productId_idx" ON "PriceChange"("productId");
-- CreateIndex
CREATE INDEX "PriceChange_date_idx" ON "PriceChange"("date");

-- CreateIndex
CREATE INDEX "PriceUpdateLog_date_idx" ON "PriceUpdateLog"("date");
-- CreateIndex
CREATE INDEX "PriceUpdateLog_status_idx" ON "PriceUpdateLog"("status");

-- CreateIndex
CREATE INDEX "ProductPriceUpdate_priceUpdateLogId_idx" ON "ProductPriceUpdate"("priceUpdateLogId");
-- CreateIndex
CREATE INDEX "ProductPriceUpdate_productId_idx" ON "ProductPriceUpdate"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerInterest_customerId_key" ON "CustomerInterest"("customerId");

-- CreateIndex
CREATE INDEX "SeasonalPrediction_productId_idx" ON "SeasonalPrediction"("productId");
-- CreateIndex
CREATE INDEX "SeasonalPrediction_season_idx" ON "SeasonalPrediction"("season");
-- CreateIndex
CREATE INDEX "SeasonalPrediction_status_idx" ON "SeasonalPrediction"("status");
-- CreateIndex
CREATE INDEX "SeasonalPrediction_recommendationDate_idx" ON "SeasonalPrediction"("recommendationDate");

-- CreateIndex
CREATE INDEX "Visit_customerId_idx" ON "Visit"("customerId");
-- CreateIndex
CREATE INDEX "Visit_timestamp_idx" ON "Visit"("timestamp");
-- CreateIndex
CREATE INDEX "Visit_source_idx" ON "Visit"("source");

-- CreateIndex
CREATE INDEX "SocialInteraction_customerId_idx" ON "SocialInteraction"("customerId");
-- CreateIndex
CREATE INDEX "SocialInteraction_platform_idx" ON "SocialInteraction"("platform");
-- CreateIndex
CREATE INDEX "SocialInteraction_timestamp_idx" ON "SocialInteraction"("timestamp");

-- CreateIndex
CREATE INDEX "Content_status_idx" ON "Content"("status");
-- CreateIndex
CREATE INDEX "Content_publishedAt_idx" ON "Content"("publishedAt");
-- CreateIndex
CREATE INDEX "Content_type_idx" ON "Content"("type");

-- CreateIndex
CREATE INDEX "AutomatedMessageRun_status_idx" ON "AutomatedMessageRun"("status");
-- CreateIndex
CREATE INDEX "AutomatedMessageRun_scheduledAt_idx" ON "AutomatedMessageRun"("scheduledAt");

-- CreateIndex
CREATE INDEX "MapsScrapeTarget_status_idx" ON "MapsScrapeTarget"("status");
-- CreateIndex
CREATE INDEX "MapsScrapeTarget_priority_idx" ON "MapsScrapeTarget"("priority");
-- CreateIndex
CREATE INDEX "MapsScrapeTarget_createdAt_idx" ON "MapsScrapeTarget"("createdAt");

-- CreateIndex
CREATE INDEX "ScrapedBusiness_scrapeTargetId_idx" ON "ScrapedBusiness"("scrapeTargetId");
-- CreateIndex
CREATE INDEX "ScrapedBusiness_status_idx" ON "ScrapedBusiness"("status");
-- CreateIndex
CREATE INDEX "ScrapedBusiness_name_idx" ON "ScrapedBusiness"("name");

-- CreateIndex
CREATE INDEX "MapsScrapeRun_targetId_idx" ON "MapsScrapeRun"("targetId");
-- CreateIndex
CREATE INDEX "MapsScrapeRun_status_idx" ON "MapsScrapeRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSettings_id_key" ON "BusinessSettings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationSettings_id_key" ON "IntegrationSettings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");
-- CreateIndex
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");
-- CreateIndex
CREATE UNIQUE INDEX "Cart_customerId_key" ON "Cart"("customerId");
-- CreateIndex
CREATE INDEX "Cart_sessionId_idx" ON "Cart"("sessionId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "CartItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
-- CreateIndex
CREATE INDEX "BlogPost_published_idx" ON "BlogPost"("published");
-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");
-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoldPriceHistory" ADD CONSTRAINT "GoldPriceHistory_goldPriceId_fkey" FOREIGN KEY ("goldPriceId") REFERENCES "GoldPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceChange" ADD CONSTRAINT "PriceChange_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceUpdate" ADD CONSTRAINT "ProductPriceUpdate_priceUpdateLogId_fkey" FOREIGN KEY ("priceUpdateLogId") REFERENCES "PriceUpdateLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerInterest" ADD CONSTRAINT "CustomerInterest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonalPrediction" ADD CONSTRAINT "SeasonalPrediction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialInteraction" ADD CONSTRAINT "SocialInteraction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapedBusiness" ADD CONSTRAINT "ScrapedBusiness_scrapeTargetId_fkey" FOREIGN KEY ("scrapeTargetId") REFERENCES "MapsScrapeTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapsScrapeRun" ADD CONSTRAINT "MapsScrapeRun_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "MapsScrapeTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
