# TODO v6: Dynamic Product Categories Management

## Phase 1: Database Schema & Migration
- [ ] Add Category model to Prisma schema (name, slug, description, order, active)
- [ ] Add categoryId field and relation to Product model (keep category String? for compatibility)
- [ ] Create migration SQL to add Category table and categoryId column
- [ ] Create migrate-categories.ts script to migrate existing Product.category values

## Phase 2: Category Service Layer
- [ ] Create lib/services/category.service.ts with CRUD operations

## Phase 3: API Endpoints
- [ ] Create GET/POST endpoints in app/api/admin/categories/route.ts
- [ ] Create GET/PUT/DELETE endpoints in app/api/admin/categories/[id]/route.ts

## Phase 4: Admin UI
- [ ] Create app/admin/categories/page.tsx with list, add, edit, delete UI
- [ ] Add category management item to components/layout/navigation.ts

## Phase 5: Update Products Page
- [ ] Remove hardcoded categories array and fetch from API in app/products/page.tsx
- [ ] Update lib/services/product.service.ts to support categoryId
- [ ] Update app/api/products/route.ts to handle categoryId in requests

## Phase 6: Types & Migration
- [ ] Add Category interface to types/index.ts
- [ ] Run migration script and verify data integrity (manual step)
