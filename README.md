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
- Store event logs or use provider webhooks for bounces and delivery notifications.






