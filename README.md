## S86-1225-Abyss_Watchers — Full-Stack Early Flood Warning System

Next.js + AWS + SafeShoreAzure | Real-Time Flood-Risk Visualization and Alerts

Abyss Watchers is a full-stack early flood-warning platform designed for districts vulnerable to seasonal flooding. Using open meteorological data, the system delivers real-time visualization, predictive risk analytics, and automated alerts. It is built with Next.js on the frontend and integrates AWS services with SafeShoreAzure capabilities for cloud reliability and scalability.

Project Overview

Flood-prone regions need rapid access to accurate weather intelligence. Abyss Watchers provides a unified dashboard that allows residents and authorities to monitor rainfall patterns, river levels, and storm indicators, helping them prepare and respond efficiently.

Why This Project Matters

Flood-related disasters often cause severe loss of life and property due to delayed or unclear warnings. By presenting real-time weather insights in a simple and accessible format, Abyss Watchers enables communities to take preventive action and improve disaster readiness.

Key Features (Planned)

Real-time rainfall and river-level monitoring using open meteorological APIs

Interactive dashboards with maps, heatmaps, and rainfall intensity graphs

Automated alerts via SMS, email, WhatsApp, and in-app notifications

Predictive flood-risk insights using historical data

Secure and scalable full-stack architecture

# Tech Stack

Frontend

Next.js

TailwindCSS

Leaflet / Mapbox

Backend

Node.js / Express

Next.js API Routes

Cloud & Services (Planned)

AWS (S3, DynamoDB / RDS, Lambda)

Azure services via SafeShoreAzure

Notification services (SNS, SES, WhatsApp API)

# Getting Started

# Installation & Local Setup

npm install
npm run dev

# Sprint-1 Focus

Project initialization

Clean folder structure

Documentation and setup clarity

Feature development and cloud integrations will be implemented in later sprints.

Reflection:
A well-documented project structure reduces technical debt and allows smooth scaling as real-time data, alerts, and cloud services are added.

Server-side only

// pages/api/db-test.js
export default function handler(req, res) {
const dbUrl = process.env.DATABASE_URL; // server-only
res.status(200).json({ dbUrl });
}

Client-side safe

// components/ApiComponent.js
import { useEffect, useState } from "react";

export default function ApiComponent() {
const [data, setData] = useState(null);

useEffect(() => {
fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/data`)
.then(res => res.json())
.then(data => setData(data));
}, []);

return <div>{JSON.stringify(data)}</div>;
}

---

## Database Migrations & Seeding (Prisma) 🔧

This project uses Prisma Migrate to version the database schema and a reproducible seed script to populate initial data.

### Workflow

1. Create & apply a new migration locally:

   ```bash
   npx prisma migrate dev --name init_schema
   ```

2. Reset the database (use with caution — resets all data):

   ```bash
   npx prisma migrate reset
   ```

3. Run the seed script (wired into package.json):

   ```bash
   npx prisma db seed
   ```

### Seed script details

- The seed file is at `prisma/seed.ts` and is written to be **idempotent**: it uses `upsert` or existence checks so re-running the seed will not create duplicate entities.
- The seed covers sample `User`, `Doctor`, `Queue`, and `Appointment` records to make local testing straightforward.

### Transactions & Query Optimization 🔧

We added a small demonstration of SQL transactions and a TypeScript example showing how to use Prisma's `$transaction()` API. Key points:

- Use `prisma.$transaction([...])` for simple batched transactions or `prisma.$transaction(async (tx) => { ... })` when you need programmatic control and rollbacks.
- Avoid partial writes by wrapping dependent DB operations in a single transaction.
- Use indexes for frequently queried fields (we added indexes to `User.role`, `User.createdAt`, and `Appointment.status`).

Prisma-style example (TypeScript):

```ts
// Example: create appointment and update queue atomically
await prisma.$transaction(async (tx) => {
  const appointment = await tx.appointment.create({
    data: { tokenNo, status: "PENDING", userId, queueId },
  });
  await tx.queue.update({

---

## Form Handling & Validation (React Hook Form + Zod)

This repository contains form examples using `react-hook-form` with `zod` schemas and the `@hookform/resolvers` adapter.

Installation

```bash
npm install react-hook-form @hookform/resolvers
```

Key files added

- `components/FormInput.tsx` — small, reusable input component with label, `aria-invalid`, and error display.
- `app/signup/page.tsx` — Signup form using `useForm` and `zodResolver` for validation.
- `app/contact/page.tsx` — Contact form that reuses `FormInput` and validates via Zod.

Validation pattern (example)

1. Define a Zod schema for the form fields.
2. Use `useForm({ resolver: zodResolver(schema) })` to wire the schema into React Hook Form.
3. Display `formState.errors` under each input and set `aria-invalid` for accessibility.

Accessible & reusable inputs

- `FormInput` reduces duplication and centralizes label/error markup.
- Ensure labels are present and `aria-invalid` is set when errors exist.

Reflection

- React Hook Form minimizes re-renders and provides a simple API for complex forms.
- Zod keeps validation declarative and type-safe, improving developer ergonomics.
- For production, server-side validation should mirror client-side Zod schemas to avoid inconsistencies.

    where: { id: queueId },
    data: { currentNo: tokenNo },
  });
});
```

Runnable SQL-backed demo

- A reliable, cross-environment runnable demo was added at `scripts/transaction-demo.cjs` (uses `pg` and explicit BEGIN / COMMIT / ROLLBACK). This demonstrates both a successful commit and a failing transaction that is rolled back.

Example output from running the demo locally:

```
Counts => users: 3, appointments: 1, queueId:1, currentNo:0

--- Running successful transaction (SQL) ---
SQL Transaction committed, inserted tokenNo 2
Counts => users: 3, appointments: 2, queueId:1, currentNo:2

--- Running failing transaction (SQL) expected rollback) ---
SQL Transaction failed and rolled back: duplicate key value violates unique constraint "Appointment_queueId_tokenNo_key"
Counts => users: 3, appointments: 2, queueId:1, currentNo:2
Done.
```

### Indexes added

We added the following indexes to `prisma/schema.prisma` to improve query performance:

- `User` — `@@index([role])`, `@@index([createdAt])`
- `Appointment` — `@@index([status])`

After adding indexes, run a migration locally:

```bash
npx prisma migrate dev --name add_indexes
```

### Monitoring and benchmarking

- Enable Prisma query logs locally to observe executed queries:

```bash
DEBUG="prisma:query" npm run dev
```

- For production, use DB-native performance tools (RDS Performance Insights, Azure DB metrics) and add request-level tracing.

---

If you'd like, I can also:

- Add an automated test that asserts transaction rollback behavior, or
- Convert `prisma/seed.ts` into a CI-run compiled seed to avoid runtime ts-node quirks.

**Commit:** Transaction & Query Optimisation — committed.

---

## API Routes (app/api) 🔧

This project follows file-based routing from Next.js app router. The following endpoints were added to provide predictable, RESTful access to core resources: Users, Queues, and Appointments.

### Route hierarchy

- `GET /api/users` — list users (pagination via `?page=` & `?limit=`)
- `POST /api/users` — create a user
- `GET /api/users/:id` — get single user
- `PUT /api/users/:id` — update user
- `DELETE /api/users/:id` — delete user

- `GET /api/queues` — list queues (pagination)
- `POST /api/queues` — create queue
- `GET /api/queues/:id` — get single queue
- `PUT /api/queues/:id` — update queue
- `DELETE /api/queues/:id` — delete queue

- `GET /api/appointments` — list appointments (pagination)
- `POST /api/appointments` — create appointment
- `GET /api/appointments/:id` — get single appointment
- `PUT /api/appointments/:id` — update appointment
- `DELETE /api/appointments/:id` — delete appointment

### Pagination & Filtering

List endpoints support `page` and `limit` query parameters. `limit` is capped at 100 by default.

Example: `GET /api/users?page=2&limit=25`

### Status Codes & Error Handling

- `200` — OK
- `201` — Created
- `400` — Bad request (validation)
- `404` — Resource not found
- `500` — Internal server error (unexpected)

Handlers return a **unified response envelope** so every endpoint has a consistent shape for success and error responses. This makes frontends and monitoring tooling simpler and more robust.

#### Unified response envelope

Success example:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": 12, "name": "Charlie" },
  "timestamp": "2025-10-30T10:00:00Z"
}
```

Error example:

```json
{
  "success": false,
  "message": "Missing required field: name",
  "error": { "code": "E001", "details": null },
  "timestamp": "2025-10-30T10:00:00Z"
}
```

#### Error codes

- `VALIDATION_ERROR` — `E001`
- `NOT_FOUND` — `E002`
- `DATABASE_FAILURE` — `E003`
- `INTERNAL_ERROR` — `E500`

> Note: The test scripts and Postman collection were updated to account for the unified envelope; created resource IDs are available at `response.data.id`.

### Example curl requests

```bash
# List users
curl -s http://localhost:3000/api/users

# Create a user
curl -s -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Charlie","email":"charlie@example.com","role":"PATIENT"}'

# Update a user
curl -s -X PUT http://localhost:3000/api/users/1 -H "Content-Type: application/json" -d '{"name":"Updated Name"}'
```

### Sample responses (examples)

- Create (201):

```json
{
  "id": 6,
  "name": "Charlie",
  "email": "charlie@example.com",
  "role": "PATIENT"
}
```

- Not found (404):

```json
{ "error": "Not found" }
```

- Validation error (400):

```json
{ "error": "name and email are required" }
```

### Running tests and Postman

- Run curl-based tests (bash):

```bash
./scripts/api-tests.sh
```

- Run PowerShell tests (Windows PowerShell):

```powershell
./scripts/api-tests.ps1
```

- Import `postman/ApiRoutes.postman_collection.json` into Postman to run the saved collection (includes full CRUD for users, queues, and appointments).

### Test scripts & Postman

- `scripts/api-tests.sh` — bash script with curl tests (requires `jq` for pretty output).
- `scripts/api-tests.ps1` — PowerShell test script.
- `postman/ApiRoutes.postman_collection.json` — Postman collection to import.

### Reflection

Consistent, resource-based naming makes endpoints predictable and easier to integrate with. The handlers include pagination and clear error semantics so clients can handle responses uniformly.

---

## Input Validation with Zod

We validate all `POST` and `PUT` requests using Zod schemas located in `lib/schemas/`.

- **Schemas:**
  - `lib/schemas/userSchema.ts` — `userSchema` and `UserInput`
  - `lib/schemas/queueSchema.ts` — `queueSchema` and `QueueInput`
  - `lib/schemas/appointmentSchema.ts` — `appointmentSchema` and `AppointmentInput`

Each API handler uses the corresponding schema to `parse()` incoming JSON. Validation errors are returned as a structured 400 response:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [ { "field": "name", "message": "Name must be at least 2 characters long" } ]
}
```

Passing example (curl):

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":22}'
```

Failing example (curl):

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"bademail"}'
```

Expected failing response:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "name", "message": "Name must be at least 2 characters long" },
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

Why reuse schemas?

- Keeps frontend and backend validation consistent.
- Reduces duplication and drift when requirements change.
- Enables TypeScript `z.infer<>` types for safe client models.

See the schema files for exact rules and examples.

## Authentication (Signup / Login)

This project includes simple `signup` and `login` API endpoints using `bcrypt` for password hashing and `jsonwebtoken` for JWT issuance.

---

## Client-side Data Fetching with SWR

This project includes an example of using SWR for client-side data fetching, caching, and optimistic updates.

Installation

```bash
npm install
```

SWR is added as a dependency in `package.json` and a small `fetcher` helper is provided at `lib/fetcher.ts`:

```ts
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};
```

Usage example

- `app/users/page.tsx` uses `useSWR("/api/users", fetcher)` to fetch and cache the user list.
- `app/users/AddUser.tsx` demonstrates optimistic updates via `mutate()` and revalidation after creating a user.

Optimistic update pattern (excerpt):

```ts
mutate(
  "/api/users",
  [...(data || []), { id: Date.now(), name, email: "temp@user.com" }],
  false
);
await fetch("/api/users", { method: "POST", ... });
mutate("/api/users");
```

Tips

- Use dynamic keys (`userId ? `/api/users/${userId}` : null`) to pause fetching until dependencies are ready.
- Configure revalidation strategies (`revalidateOnFocus`, `refreshInterval`, `onErrorRetry`) via SWR options.
- Inspect caching behavior with React DevTools and `useSWRConfig()`.

Reflection

- SWR reduces redundant network requests and keeps the UI responsive while refreshing in the background.
- Optimistic UI greatly improves perceived performance but requires careful rollback/error handling for production.


---

## Routing Lesson: Page Routing and Dynamic Routes (Next.js App Router)

This repository also contains a small lesson/demo showing how to implement public and protected pages, dynamic routes, and custom 404 handling using the Next.js App Router.

Route map (implemented under `app/`):

- Public routes: `/` (Home), `/login`
- Protected routes: `/dashboard`, `/users`, `/users/[id]` (requires a JWT cookie)
- API protected routes: `/api/admin/*`, `/api/users/*` (header bearer token)

Key files added for the lesson:

- `app/page.tsx` — Home (public)
- `app/login/page.tsx` — Login page (client): sets a mock `token` cookie and redirects to `/dashboard`
- `app/dashboard/page.tsx` — Protected dashboard page
- `app/users/page.tsx` — Users list (links to dynamic profiles)
- `app/users/[id]/page.tsx` — Dynamic user profile page (e.g., `/users/1`)
- `app/layout.tsx` — Global layout with navigation
- `app/not-found.tsx` — Custom 404 page
- `app/middleware.ts` — Middleware protecting API routes (header token) and pages (`/dashboard` & `/users` via cookie JWT)

Middleware snippet (page protection):

```ts
// app/middleware.ts (excerpt)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect page routes: /dashboard and /users (cookie-based JWT)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try { jwt.verify(token, JWT_SECRET); return NextResponse.next(); } catch { return NextResponse.redirect(new URL("/login", req.url)); }
  }
}
```

Try it locally:

1. Start the dev server:

```bash
npm install
npm run dev
```

2. Visit `/` and `/login`. Click "Login" to set a mock cookie and be redirected to `/dashboard`.
3. Visit `/users/1`, `/users/2` to see dynamic user pages.

Reflection

- Dynamic routing makes it easy to scale content pages (e.g., `/users/[id]`) and improves SEO when server-rendered or statically generated.
- Breadcrumbs and clear path structure help users and search engines understand content hierarchy.
- Middleware offers a central place to protect both API and page routes; for highly-sensitive pages, prefer httpOnly, Secure cookies set by the server rather than client-side cookies.

Screenshots and behavior proof: capture the following locally and add under `docs/screenshots/` for the lesson:

- Public home and login pages
- Successful redirect to protected `/dashboard` after login
- Dynamic pages `/users/1` and `/users/2`
- Custom 404 page at an unknown path

Pro Tip: Great routing design is invisible — users should feel everything connects seamlessly.

---

## Component Architecture Lesson

This project includes a small component-architecture lesson demonstrating a reusable layout with `Header`, `Sidebar`, `LayoutWrapper`, and a sample UI component `Button`.

Folder structure (added):

```
components/
 ├── layout/
 │    ├── Header.tsx
 │    ├── Sidebar.tsx
 │    └── LayoutWrapper.tsx
 ├── ui/
 │    └── Button.tsx
 └── index.ts
styles/
 └── globals.css
```

Usage

- `app/layout.tsx` now imports `styles/globals.css` and wraps pages with `LayoutWrapper` so all pages receive the `Header` and `Sidebar` automatically.
- Import components via the barrel: `import { LayoutWrapper, Button } from "@/components"`.

Example: `components/layout/Header.tsx` (shared header navigation)

```tsx
"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-semibold text-lg">Abyss Watchers</h1>
      <nav className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/users">Users</Link>
      </nav>
    </header>
  );
}
```

Design notes

- Reusability: `LayoutWrapper` composes `Header` and `Sidebar` so changes propagate across pages.
- Accessibility: Shared components are good places to standardize ARIA attributes and keyboard handling.
- Props contract: `Button` demonstrates a simple prop-driven design (`label`, `variant`).

Next steps (suggested)

- Add Storybook for visual testing and component documentation: `npx storybook init`.
- Add aria labels, focus styles, and keyboard shortcuts for improved accessibility.
- Replace mock client-side login cookie with server-set httpOnly cookie for production.

---

## State Management: Context & Hooks

This project includes a simple state-management lesson using React Context and custom hooks. The key artifacts are:

- `context/AuthContext.tsx` — `AuthProvider` and `useAuthContext` for authentication state.
- `context/UIContext.tsx` — `UIProvider` and `useUIContext` for theme and sidebar state.
- `hooks/useAuth.ts` — `useAuth()` custom hook wrapping auth context.
- `hooks/useUI.ts` — `useUI()` custom hook wrapping UI context.

How to use

1. Providers are applied globally in `app/layout.tsx` so every page and component can access contexts.
2. Consume with hooks inside client components:

```tsx
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

function Example() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useUI();
  // ...
}
```

Design notes

- Context keeps shared state centralized and avoids prop drilling.
- Custom hooks provide a small, consistent API surface for components.
- For complex state transitions, consider `useReducer()` inside the provider and expose `dispatch`.

Debug & Performance

- Use React DevTools to inspect provider values.
- Wrap consumer-heavy components with `React.memo()` and avoid passing new inline objects as props.

Deliverables included

- Working `AuthProvider` and `UIProvider`.
- `useAuth` and `useUI` hooks.
- Demo on the home page showing login/logout and theme/sidebar toggles.




- `POST /api/auth/signup` — create an account (stores hashed password)
- `POST /api/auth/login` — exchange credentials for a JWT
- `GET /api/users` — example protected route that requires `Authorization: Bearer <token>`

Example signup request:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"mypassword"}'
```

Example login request:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"mypassword"}'
```

Example protected request (replace <TOKEN>):

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

Notes & recommendations:

- Store `JWT_SECRET` in environment variables in production.
- Consider using `httpOnly` secure cookies for tokens instead of localStorage for better protection against XSS.
- For long-lived sessions, implement a refresh-token flow.

## Authorization Middleware (RBAC)

This project includes `app/middleware.ts` which validates incoming JWTs and enforces role-based rules for protected routes:

- Protects: `/api/admin` (admin-only) and `/api/users` (authenticated users)
- Verifies JWT and returns `401` if missing or `403` if invalid/expired
- For `/api/admin`, middleware checks `decoded.role === 'admin'` and returns `403` on denial
- Attaches `x-user-email` and `x-user-role` headers to forwarded requests for downstream handlers

Example admin access (allowed):

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_JWT>"
```

Example admin access (denied for non-admin):

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <USER_JWT>"
```

Example protected users route (authenticated):

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

Notes & design decisions:

- Middleware uses `jsonwebtoken` and expects the `role` to be present in the JWT payload (the login route includes `role` in the token).
- The middleware sets request headers for downstream access — you can also attach a request-scoped context/store if preferred.
- To add more roles, extend the role checks in `app/middleware.ts` or centralize permission rules in a small RBAC module.

### Roles & Permissions

This project ships a small RBAC helper at `lib/rbac.ts` with a default mapping:

| Role | Permissions |
| --- | --- |
| ADMIN | create, read, update, delete |
| STAFF | read, update |
| PATIENT | read |

Example policy evaluation (server-side):

```ts
// lib/rbac.ts
hasPermission('STAFF', 'create') // => false
hasPermission('ADMIN', 'delete') // => true
```

Audit logs are emitted for every allow/deny decision using `lib/logger.ts`. Example log entries:

```json
{"level":"info","message":"[RBAC] STAFF attempted to create users: DENIED","meta":{"role":"STAFF","resource":"users","action":"create","allowed":false},"timestamp":"..."}
{"level":"info","message":"[RBAC] ADMIN attempted to read users: ALLOWED","meta":{"role":"ADMIN","resource":"users","action":"read","allowed":true},"timestamp":"..."}
```

These logs help with auditing and debugging how authorization decisions are made.

## Centralized Error Handling

We added `lib/logger.ts` and `lib/errorHandler.ts` to provide structured logging and consistent, safe error responses.

- `lib/logger.ts` — lightweight structured logger (JSON output) with `info` and `error` helpers.
- `lib/errorHandler.ts` — `handleError(error, context, status?)` logs the error and returns a safe JSON response.

Behavior:

- Development (`NODE_ENV !== 'production'`): responses include the original error message and `stack`.
- Production (`NODE_ENV === 'production'`): responses return a generic message: `Something went wrong. Please try again later.` and `stack` is redacted in logs.

Example usage in routes:

```ts
import { handleError } from '@/lib/errorHandler'

try {
  // ... route logic
} catch (err) {
  return handleError(err, 'GET /api/users')
}
```

Example dev response (detailed):

```json
{
  "success": false,
  "message": "Database connection failed!",
  "stack": "Error: Database connection failed! at ..."
}
```

Example prod response (safe):

```json
{
  "success": false,
  "message": "Something went wrong. Please try again later."
}
```

Structured log example (console):

```json
{
  "level":"error",
  "message":"Error in GET /api/users",
  "meta":{ "message":"Database connection failed!","stack":"REDACTED" },
  "timestamp":"2025-10-29T16:45:00.000Z"
}
```

Recommendations:

- Send logs to a centralized logger (CloudWatch, Datadog) for production. Replace `lib/logger.ts` with `pino`/`winston` adapter when scaling.
- Extend `handleError` to map custom error types (e.g., validation or auth errors) to specific HTTP statuses and error codes.

## Redis Caching (Cache-Aside)

We added a simple Redis cache helper at `lib/redis.ts` using `ioredis`. The `GET /api/users` endpoint uses a cache-aside strategy:

- Cache key: `users:list`
- TTL: 60 seconds (set via `redis.set(..., 'EX', 60)`).
- On `GET /api/users`, the route checks Redis first; on miss it queries the DB, caches the result, and returns it.
- On user create/update (signup or `PUT /api/users/:id`) the route invalidates `users:list` using `redis.del()` to avoid stale data.

Example `lib/redis.ts`:

```ts
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
export default redis
```

Example behavior:

- Cold request: cache miss -> DB read -> cache set -> return (source: `db`).
- Subsequent request within TTL: cache hit -> return (source: `cache`).

Notes & tradeoffs:

- TTL choice depends on how fresh data must be; 60s is an example.
- For stronger consistency, update cache directly after DB writes instead of deleting.
- Use namespaced keys or include query params in keys when caching filtered/paginated results.

## File Uploads (Pre-signed URLs)

This project includes an example AWS S3 pre-signed URL flow. The upload generator is at `app/api/upload/route.ts` and the metadata persistence endpoint is `app/api/files/route.ts`.

Environment variables required for AWS S3:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`

Example request to obtain a pre-signed URL (server validates file type):

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"filename":"photo.jpg","fileType":"image/jpeg"}'
```

Response (example):

```json
{
  "success": true,
  "uploadURL": "https://...", 
  "key": "uuid-photo.jpg"
}
```

Client-side upload (use PUT to the returned `uploadURL`):

```js
await fetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
```

After upload, store metadata in DB:

```bash
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{"fileName":"photo.jpg","fileURL":"https://...","size":12345,"uploaderId":1}'
```

Notes:

- Keep pre-signed URL expiry short (e.g., 60–120s) and validate file type/size before generating URLs.
- Ensure your Prisma schema includes a `File` model to persist file records; adapt fields used in `app/api/files/route.ts` accordingly.
- For Azure Blob, use `@azure/storage-blob` and generate SAS tokens similarly.

## Email Service Integration (SES / SendGrid)

The project supports transactional emails via AWS SES or SendGrid. Choose provider by setting `EMAIL_PROVIDER=ses` or `EMAIL_PROVIDER=sendgrid`.

Environment variables (SES):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `SES_EMAIL_SENDER` (verified sender address)

Environment variables (SendGrid):

- `SENDGRID_API_KEY`
- `SENDGRID_SENDER` (verified sender)

Endpoint: `POST /api/email` with body `{ to, subject, message, template?, templateVars? }`.

Example (SendGrid):

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"Welcome!","template":"welcome","templateVars":{"name":"Alice"}}'
```

The route returns `{ success: true }` on success and logs message IDs for SES.

Notes:

- SES requires verified sender emails in sandbox mode; move to production and verify domain for higher throughput.
- Handle rate limits with background queues for high volume.

---

## Feedback UI: Toasts, Modals, and Loaders

This project includes a small feedback UI system demonstrating:

- Toast notifications via `react-hot-toast` (instant feedback)
- Accessible modal/dialog for blocking confirmations
- Spinner/loader for process feedback

Files added

- `components/ui/Modal.tsx` — accessible modal with ESC handling and a simple focus trap
- `components/ui/Spinner.tsx` — small SVG spinner for async flows
- `app/feedback/page.tsx` — demo page showing a toast → modal → loader → toast flow
- `app/layout.tsx` — includes `<Toaster />` from `react-hot-toast`

Example trigger flow (in `app/feedback/page.tsx`):

1. Click **Show Toast** → `toast.loading()` then `toast.success()` after completion.
2. Click **Open Modal** → accessible modal opens and traps focus.
3. Confirm → loader shows while async work runs, then `toast.success()` on completion.

Accessibility notes

- Toasts use `aria-live` internally via `react-hot-toast` to announce messages to screen readers.
- Modal uses `role="dialog"`, `aria-modal="true"`, and traps focus while open. Pressing `Esc` closes it.
- Spinner markup includes `role="status"` or can be paired with `aria-live` if announcing progress.

How to try it

```bash
npm install
npm run dev
# open http://localhost:3000/feedback
```

Design reflections

- Use toasts for non-blocking confirmations; avoid using them for critical errors that require user action.
- Use modals sparingly for destructive or irreversible actions; ensure keyboard and screen-reader access.
- Show subtle loaders for background work and use blocking loaders only when the user must wait.

---

## Responsive & Themed Design (TailwindCSS)

I added a Tailwind config with custom theme tokens and responsive breakpoints. Key points:

- `tailwind.config.js` includes `darkMode: 'class'`, custom `brand` colors, and `sm|md|lg|xl` breakpoints.
- `styles/globals.css` now imports Tailwind base/components/utilities.
- Theme is toggled via the UI context and sets the `dark` class on the document root for dark-mode styles.

Example responsive pattern used in layout:

```html
<main class="flex-1 bg-white p-4 md:p-6 lg:p-8"> ... </main>
```

How to try

```bash
npm install
npm run dev
# open the app and resize or use DevTools device toolbar
```

Accessibility & contrast

- Dark mode switches use Tailwind's `dark:` variants to ensure sufficient contrast. Test both themes with contrast tools.

---

## Loading & Error States

To improve perceived performance and resilience, the app includes loading skeletons and route-level error boundaries using the App Router conventions (`loading.tsx` and `error.tsx`).

What I added

- `app/users/loading.tsx` — skeleton UI using `animate-pulse` to show while the `users` route is resolving.
- `app/users/error.tsx` — client-side error boundary that displays the error message and a **Try Again** button (calls `reset()`).
- `app/users/[id]/loading.tsx` and `app/users/[id]/error.tsx` — route-specific fallbacks for dynamic user pages.

Testing & simulation

- To see the loading skeleton, you can simulate a slow network in DevTools and navigate to `/users`.
- To test the error boundary, temporarily throw an error inside the route (e.g., `if (!data) throw new Error('test error')`) and use the **Try Again** button to call `reset()`.

Why this helps

- Skeletons reduce layout shift and give users an expectation of the incoming content structure.
- Error boundaries provide a controlled recovery path and prevent the whole app from crashing on a route-level failure.



- Store event logs or use provider webhooks for bounces and delivery notifications.




## Input Sanitization & OWASP Compliance

This project includes server-side sanitization utilities to reduce XSS and SQL injection risks.

- **Utility:** `lib/sanitize.ts` (uses `sanitize-html`) provides `sanitizeInput()` and `sanitizeObjectStrings()` which strip HTML from user-provided strings.
- **API updates:** Selected API endpoints sanitize string inputs before persistence: `app/api/auth/signup/route.ts`, `app/api/users/route.ts`, and `app/api/appointments/route.ts`.
- **Validation + Sanitization:** Zod schemas still perform structural validation; sanitization ensures strings do not contain embedded HTML or scripts.
- **Next steps:** Add CSP headers and secure headers middleware, apply stricter output encoding for any use of `dangerouslySetInnerHTML`, and add security tests to CI.

Follow OWASP guidance: validate, sanitize, and encode — never trust client input.

## HTTPS Enforcement & Secure Headers

This project adds middleware to enforce secure communication and set essential security headers. Key configuration lives in `app/middleware.ts`.

- **HSTS:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — forces browsers to use HTTPS.
- **CSP:** `Content-Security-Policy` set to a conservative default: `default-src 'self'; img-src 'self' data:; script-src 'self' https:; style-src 'self' 'unsafe-inline';` — adjust to allow trusted CDNs and analytics as needed.
- **CORS:** For API routes, `Access-Control-Allow-Origin` is set from `ALLOWED_ORIGIN` (defaults to `http://localhost:3000`). Avoid `*` in production.
- **Other headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restricted.

Local testing:

1. Ensure `ALLOWED_ORIGIN` is set in your environment when testing cross-origin requests.
2. Start the dev server and inspect response headers in DevTools → Network.

For Next.js deployments that support `next.config.js` headers, you can alternatively set headers there. When running behind a CDN or proxy, prefer configuring HSTS and CSP at the edge (CDN) or load balancer.

## Cloud Database Configuration (RDS / Azure SQL)

This project uses Prisma and can connect to a managed PostgreSQL instance (AWS RDS or Azure Database for PostgreSQL). The following steps outline provisioning, connectivity, and local testing guidance.

1) Provision a managed PostgreSQL instance

- AWS RDS: Create a PostgreSQL DB instance (`nextjs-db`) in RDS console. For testing you may temporarily enable public access and add your IP to the security group inbound rules for port `5432`.
- Azure Database for PostgreSQL: Create a Single Server, set admin credentials, and add your client IP in the Firewall rules.

2) Set your connection string locally

Create a `.env.local` at the project root containing:

DATABASE_URL="postgresql://admin:YourStrongPassword@your-db-endpoint:5432/nextjsdb"

Replace `admin`, `YourStrongPassword`, `your-db-endpoint`, and database name as appropriate.

3) Generate Prisma client and run migrations (local dev)

Install dependencies and run:

```bash
npx prisma generate
npx prisma migrate deploy # or `npx prisma migrate dev` for local development
```

4) Quick connectivity test (local)

We added a lightweight DB check script to verify connectivity using the generated Prisma client:

```bash
# from project root
node scripts/db-check.cjs
```

The script prints `DB CHECK OK` on success, or an error message if it cannot connect.

5) Best practices for production

- Do NOT enable public access in production; use private subnets, VPC peering, or private endpoints.
- Use IAM / managed identities or secrets managers where possible (AWS Secrets Manager, Azure Key Vault) to store DB credentials.
- Enable automated backups (RDS snapshot retention) and configure point-in-time recovery windows.
- Configure read replicas for scale and a failover strategy for high availability.

6) Troubleshooting

- If `prisma generate` fails, ensure `@prisma/client` is installed and Prisma CLI matches the schema version.
- If the DB check fails, confirm `DATABASE_URL` is reachable from your network and the DB security group/firewall allows your IP.

If you'd like, I can add a small `next.config.js` snippet to show setting headers at build-time, or create a short PowerShell script that runs the same DB-check on Windows.







