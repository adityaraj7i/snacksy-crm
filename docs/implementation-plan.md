# Implementation Roadmap (Phases 0 – 14): Snacksy Cafe And Restro CRM

## Phase 0: Architecture & Engineering Foundation Setup
- **Objectives**: Establish complete project scaffolding, TypeScript strict configuration, Prisma schema design, RBAC specifications, CRM business rules, and repository health.
- **Database Changes**: Define initial PostgreSQL schema with Prisma ORM in `prisma/schema.prisma`.
- **Backend Tasks**: Configure Next.js App Router, path aliases, environment variable structure, Vitest test runner.
- **Frontend Tasks**: Configure Tailwind CSS, shadcn/ui theme configuration, root layout, and utility formatters (`formatCurrencyNPR`, `formatNepalPhoneNumber`).
- **Tests**: Initial utility unit test verifying currency formatting and phone normalization.
- **Acceptance Criteria**: Repository passes `npm run build`, `npm run lint`, `npm run typecheck`, and `npm run test` cleanly.

---

## Phase 1: Foundation Services & Core Layout
- **Objectives**: Build shared layout components (sidebar, header, breadcrumbs), base domain service contracts, error handling middleware, and tenant context provider.
- **Database Changes**: Apply Prisma migration for baseline tables.
- **Backend Tasks**: Construct base Repository and Service classes; build logging and error handling wrappers.
- **Frontend Tasks**: Build navigation sidebar, branch switcher dropdown, page header, and toast notifications.
- **Tests**: Integration tests for tenant filtering repositories.
- **Acceptance Criteria**: App renders responsive navigation shell with active branch indicator.

---

## Phase 2: Authentication & RBAC Policy Layer
- **Objectives**: Secure authentication, user login, password hashing, session context, and capability-based policy engine.
- **Database Changes**: Seed default system roles (Owner, Manager, Marketing, Front Desk, Staff, Read-Only) and permissions.
- **Backend Tasks**: Implement Auth server actions, JWT session handling, policy functions (`src/server/policies/`).
- **Frontend Tasks**: Login page, forgot password view, user profile settings, route protection middleware.
- **Tests**: Unit tests for policy functions; integration tests for auth flow.
- **Acceptance Criteria**: Unauthenticated users redirected to login; users restricted to authorized features based on assigned permissions.

---

## Phase 3: Core Customer 360 & Profiles
- **Objectives**: Comprehensive customer management, CRUD operations, preference tracking, staff notes, tagging, consent logging, and record deduplication/merge interface.
- **Database Changes**: Full customer entity relationships enabled.
- **Backend Tasks**: Customer CRUD services, search/filter algorithms, deduplication engine, merge transaction handler.
- **Frontend Tasks**: Customer directory table, search bar, filter drawer, Customer 360 profile detail page, merge modal, tag selector.
- **Tests**: Unit tests for deduplication matching logic; E2E customer creation test.
- **Acceptance Criteria**: Staff can create, search, edit, tag, and merge duplicate customer profiles seamlessly.

---

## Phase 4: Visits, Orders & Floor Management
- **Objectives**: Log customer visits, capture orders, track table assignments, calculate average spend, and update customer lifecycle stages automatically.
- **Database Changes**: Visit, Order, OrderItem, and Table schemas active.
- **Backend Tasks**: Visit check-in/check-out service, POS order ingestion endpoint, automated customer lifecycle re-calculation trigger.
- **Frontend Tasks**: Live visit register view, quick visit log modal, order history tab on Customer 360 profile.
- **Tests**: Unit tests for lifecycle stage calculator (New -> Returning -> Regular -> VIP).
- **Acceptance Criteria**: Logging a visit updates customer total visits, spend, and lifecycle stage in real time.

---

## Phase 5: Reservations & Waitlist
- **Objectives**: Table booking management, reservation scheduling, party size allocation, and walk-in waitlist queue tracking.
- **Database Changes**: Reservation and WaitlistEntry schema active.
- **Backend Tasks**: Table availability checking service, reservation conflict guard, SMS notification trigger on table ready.
- **Frontend Tasks**: Reservation calendar/grid view, new booking form, waitlist queue management screen.
- **Tests**: Unit tests for table overlap conflict detection.
- **Acceptance Criteria**: Staff can schedule reservations without double-booking tables and notify waitlisted guests.

---

## Phase 6: Loyalty & Rewards System
- **Objectives**: Automated points earning on visits/spend, tier progression (Bronze, Silver, Gold), rewards catalog, and voucher redemption at cashier counter.
- **Database Changes**: LoyaltyAccount, Tier, Transaction, Reward, and Redemption schema active.
- **Backend Tasks**: Points calculation engine, tier upgrade background watcher, voucher code generation and redemption validator.
- **Frontend Tasks**: Loyalty summary tab on customer profile, reward catalog management UI, cashier redemption modal.
- **Tests**: Unit tests for points calculation on spend amounts in Paisa.
- **Acceptance Criteria**: Customers earn points accurately based on spend, and vouchers can be redeemed cleanly.

---

## Phase 7: Customer Segmentation & RFM Engine
- **Objectives**: Dynamic rule-based customer segmentation, RFM matrix scoring (Recency, Frequency, Monetary), and automated cohort tagger.
- **Database Changes**: Segment, SegmentRule schemas active; RFM score fields cached on customer.
- **Backend Tasks**: Rule evaluation engine (AND/OR filter combinations), daily RFM score calculation cron task.
- **Frontend Tasks**: Segment builder UI with dynamic rule adding, RFM matrix chart view, segment subscriber preview.
- **Tests**: Unit tests for complex segment rule matching logic.
- **Acceptance Criteria**: Marketers can define dynamic segments (e.g. "Lapsed VIPs") and see matched customer counts.

---

## Phase 8: Campaigns (SMS, Email & WhatsApp)
- **Objectives**: Target campaign builder, template customization, message dispatch via Nepal SMS gateways (Sparrow/Aakash) and WhatsApp API, delivery analytics.
- **Database Changes**: Campaign, CampaignMessage, MessageEvent schemas active.
- **Backend Tasks**: SMS/WhatsApp gateway driver integration, rate-limited dispatch worker, delivery webhook listener.
- **Frontend Tasks**: Campaign wizard, message template editor, campaign analytics dashboard (Sent, Delivered, Opened, ROI).
- **Tests**: Mock gateway driver unit tests.
- **Acceptance Criteria**: Campaigns can be dispatched to selected segments and track delivery status accurately.

---

## Phase 9: Automations Engine
- **Objectives**: Event-driven automation workflows (e.g., auto-send birthday SMS 7 days prior, auto-send thank-you SMS after 1st visit, win-back lapsed customers).
- **Database Changes**: Automation and AutomationRun schemas active.
- **Backend Tasks**: Event emitter integration, rule evaluator, schedule cron execution engine.
- **Frontend Tasks**: Automation list view, trigger builder UI, execution log viewer.
- **Tests**: Integration tests for event-driven automation triggers.
- **Acceptance Criteria**: Automations fire reliably when matching business events occur.

---

## Phase 10: Customer Feedback & Task Management
- **Objectives**: Post-visit feedback collection (1-5 stars), negative feedback alert triggers (≤2 stars), resolution assignment, and internal staff task tracking.
- **Database Changes**: Feedback, FeedbackResolution, Task, Interaction schemas active.
- **Backend Tasks**: Feedback ingestion service, automatic manager notification on low rating, task CRUD services.
- **Frontend Tasks**: Feedback dashboard, negative review resolution workflow modal, staff task board (Kanban / List).
- **Tests**: Unit tests for negative rating detection.
- **Acceptance Criteria**: Low ratings trigger manager alerts and create mandatory follow-up resolution tasks.

---

## Phase 11: Executive Dashboard & Analytics Reports
- **Objectives**: Real-time sales metrics, visit trends, customer retention rates, RFM distribution graphs, and CSV/PDF report exports.
- **Database Changes**: Optimize aggregate analytics indexes.
- **Backend Tasks**: High-performance aggregation queries, CSV export streamer.
- **Frontend Tasks**: Executive dashboard page, retention charts, revenue breakdown, export modal.
- **Tests**: Unit tests for reporting mathematical aggregators.
- **Acceptance Criteria**: Dashboard loads analytics within <500ms with working CSV export options.

---

## Phase 12: Data Imports (CSV) & Integrations
- **Objectives**: Bulk customer/historical order CSV importer with column mapping, validation, error logging, and external POS webhook configuration.
- **Database Changes**: ImportJob, IntegrationConnection, WebhookEvent schemas active.
- **Backend Tasks**: Asynchronous CSV streaming parser, validation engine, POS webhook handler.
- **Frontend Tasks**: CSV import wizard (upload, column mapping, progress bar, error summary), integration settings page.
- **Tests**: Unit test for CSV parser with invalid phone formats.
- **Acceptance Criteria**: Bulk CSV files can be imported with detailed error reports for bad rows.

---

## Phase 13: Security Hardening & E2E Testing
- **Objectives**: Comprehensive security audit, rate limiting, SQL injection protection verification, CSRF guards, and end-to-end testing suite.
- **Database Changes**: Audit log indices verification.
- **Backend Tasks**: Add rate limiting to public endpoints, sanitize output, enforce security headers.
- **Frontend Tasks**: Form input sanitization, error boundary fallbacks.
- **Tests**: Playwright E2E test suite covering Auth, Customer Creation, Visit Logging, and Campaign Dispatch.
- **Acceptance Criteria**: All Playwright E2E tests pass cleanly in headless mode.

---

## Phase 14: Production Deployment & Go-Live
- **Objectives**: Production build setup, database migration execution on production PostgreSQL host, environment verification, monitoring setup, and documentation sign-off.
- **Database Changes**: Production database migration applied.
- **Backend Tasks**: Configure Sentry tracking, healthcheck endpoint `/api/health`.
- **Frontend Tasks**: Production asset optimization, SEO & OpenGraph meta configs.
- **Tests**: Smoke test suite against staging/production instance.
- **Acceptance Criteria**: CRM fully operational, accessible over HTTPS with zero console errors.
