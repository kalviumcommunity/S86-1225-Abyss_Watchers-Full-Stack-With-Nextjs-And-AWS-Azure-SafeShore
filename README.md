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
