# Snacksy Cafe CRM

A clean operations system for a small café and restaurant. It includes role-based workspaces for the owner, waiter, chef, and cashier; table ordering; kitchen workflow; billing; menu photos; staff management; and reports.

## Run locally

Requirements: Node.js 22 and npm.

```bash
npm install
npm run dev
```

The app opens at `http://localhost:3000`.

## Deploy on Vercel

The project builds as a standard Next.js application.

1. Import this GitHub repository into Vercel.
2. Add a Neon Postgres database from the Vercel Marketplace and connect it to the project. It provides `DATABASE_URL`.
3. Create a public Vercel Blob store for menu photos. It provides `BLOB_READ_WRITE_TOKEN`.
4. Add these four-digit secret environment variables to Production and Preview:
   - `INITIAL_OWNER_PIN`
   - `INITIAL_WAITER_PIN`
   - `INITIAL_CHEF_PIN`
   - `INITIAL_CASHIER_PIN`
5. Redeploy the project.

The database schema, starter tables, menu items, and first staff accounts are created automatically on the first request. After login, the owner can change staff names and PINs from the Staff screen.

Never commit real PINs, database credentials, Blob tokens, or local `.env` files.

## Production build

```bash
npm run build
npm start
```
