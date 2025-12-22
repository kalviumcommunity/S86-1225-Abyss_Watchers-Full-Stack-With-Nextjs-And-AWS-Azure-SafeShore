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

### Rollbacks & Production safety

- Test every migration on staging before applying in production.
- Keep frequent backups of production databases and use backup restore testing to verify restore points.
- Use `prisma migrate reset` only on development/staging environments, never directly in production.

### Example output (local)

```
$ npx prisma migrate dev --name add_some_changes
✔ Generated migration SQL
✔ Applied migration to database

$ npx prisma db seed
✅ Seed data inserted/updated successfully
```

If you want me to run these commands locally and capture logs, tell me which environment (local Postgres connection string) to use and I'll run them and paste the outputs here.


