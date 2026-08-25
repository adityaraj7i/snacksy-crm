# Snacksy Cafe And Restro CRM

Production Customer Relationship Management (CRM) platform designed specifically for **Snacksy Cafe And Restro** in Nepal.

## 📌 Project Overview
- **Business**: Snacksy Cafe And Restro
- **Market**: Nepal
- **Default Currency**: NPR (`रू`, stored internally as integer Paisa where `1 NPR = 100 Paisa`)
- **Default Timezone**: `Asia/Kathmandu` (UTC +05:45)
- **Phone Prefix**: `+977`

---

## 🚀 Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript (Strict Mode), Tailwind CSS, Lucide Icons, React Hook Form, Zod.
- **Backend**: Next.js Server Actions, Route Handlers, modular service/repository layer, capability-based RBAC policy engine.
- **Database**: PostgreSQL + Prisma ORM.
- **Testing**: Vitest.

---

## 🛠 Local Developer Setup

### Prerequisites
- Node.js `v20.x` or higher
- PostgreSQL `14.x` or higher
- `npm` package manager

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your local PostgreSQL connection string.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Client Generation
Generate Prisma Client types and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

### 4. Database Seeding
Seed the database with initial Organization ("Snacksy Cafe And Restro") and primary Branch ("Snacksy Kirtipur"):
```bash
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality Assurance & Scripts

| Action | Command |
| :--- | :--- |
| **Type Check** | `npm run typecheck` |
| **ESLint Check** | `npm run lint` |
| **Unit Test Suite** | `npm run test` |
| **Health Check Endpoint** | Access `http://localhost:3000/api/health` |
| **Production Build** | `npm run build` |
| **Production Start** | `npm run start` |

---

## 🔒 Security Baseline
- Secrets and `.env` files are excluded from Git via `.gitignore`.
- HTTP Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) are enforced in `next.config.mjs`.
- Sensitive fields (passwords, tokens, keys) are automatically redacted in structured logger `src/server/lib/logger.ts`.
