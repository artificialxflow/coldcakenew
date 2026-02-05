# Test Phase 1: Environment, Database & Authentication

## 1. Environment & Setup
- [ ] **Dependencies**: storage and installation check
  - Execute `npm install` and ensure no peer dependency conflicts.
  - Verify `node_modules` structure.
- [ ] **Environment Variables**:
  - Check `.env` against `.env.example`.
  - Verify sensitive keys (DATABASE_URL, JWT_SECRET, API Keys) are present.
- [ ] **Build & Lint**:
  - Run `npm run build` to check for compilation errors.
  - Run `npm run lint` to identify static analysis issues.

## 2. Database (Prisma)
- [ ] **Schema Validation**:
  - Run `npx prisma validate` to check `schema.prisma` validity.
- [ ] **Migrations**:
  - Run `npx prisma migrate status` to ensure DB is in sync.
  - Test a fresh reset: `npx prisma migrate reset` (Caution: Data loss).
- [ ] **Seeding**:
  - Run `npm run prisma:seed` to verify seed script works (admin user, default roles, basic config).

## 3. Authentication & Authorization
- [ ] **Registration/Login**:
  - Test OTP generation (Mock SMS provider if needed).
  - Test Password login for administrative users.
- [ ] **Session Management**:
  - Verify JWT token generation and expiry.
  - Test Refresh Token rotation mechanism.
  - Check `Session` table in DB for active sessions.
- [ ] **Role-Based Access Control (RBAC)**:
  - Verify `Role` and `Permission` models content.
  - Test protecting a route (e.g., `/admin`) with different roles.
  - Verify `middleware.ts` correctly intercepts unauthenticated requests.

## Improvements & Suggestions
- [ ] Add `pre-commit` hooks for linting.
- [ ] Implement rate limiting on login/OTP endpoints to prevent abuse.
- [ ] Consider adding Docker container for a local Postgres instance for easier testing.
