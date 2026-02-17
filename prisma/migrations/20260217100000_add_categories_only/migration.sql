-- CreateTable Category (only; no User index changes)
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_name_idx" ON "Category"("name");
CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_active_idx" ON "Category"("active");
CREATE INDEX IF NOT EXISTS "Category_order_idx" ON "Category"("order");

-- AlterTable Product: add categoryId and relation
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Product_categoryId_fkey') THEN
    ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
