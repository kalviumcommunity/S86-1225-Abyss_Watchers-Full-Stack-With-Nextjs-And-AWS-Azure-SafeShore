# S86-1225-Abyss_Watchers

## Full-Stack Early Flood Warning System

**Tech Stack:** Next.js · AWS · SafeShoreAzure  
**Focus:** Real-Time Flood-Risk Visualization and Alerts

---

## Project Overview

Abyss Watchers is a full-stack early flood-warning platform designed to support districts vulnerable to seasonal flooding. The application uses open meteorological data to provide real-time flood-risk visualization and early alerts, helping residents and authorities prepare and respond proactively.

---

## Why This Project Matters

Flood-related disasters often cause severe loss of life and property due to delayed or unclear warnings. By presenting real-time weather insights in a simple and accessible format, Abyss Watchers enables communities to take preventive action and improve disaster readiness.

---

## Key Features (Planned)

- Real-time rainfall and river-level monitoring using open meteorological APIs
- Interactive dashboards with maps, heatmaps, and rainfall intensity graphs
- Automated alerts via SMS, email, WhatsApp, and in-app notifications
- Predictive flood-risk insights using historical data
- Secure and scalable full-stack architecture

---

## Tech Stack

### Frontend

- Next.js
- TailwindCSS
- Leaflet / Mapbox

### Backend

- Node.js / Express
- Next.js API Routes

### Cloud & Services (Planned)

- AWS (S3, DynamoDB / RDS, Lambda)
- Azure services via SafeShoreAzure
- Notification services (SNS, SES, WhatsApp API)

---

## Project Structure

src/
├── app/ # Routes, layouts, and pages using Next.js App Router
├── components/ # Reusable UI components
├── lib/ # Utility functions, helpers, and configurations

### Structure Rationale

This structure separates routing, UI components, and shared utilities, making the codebase easier to maintain and scale in future sprints as more features are added.

---

## Getting Started

### Installation & Local Setup

```bash
npm install
npm run dev
```

Sprint-1 Focus

The current sprint focuses on:

Project initialization

Clean folder structure

Documentation and setup clarity

Feature development and cloud integrations will be implemented in later sprints.

Reflection

Establishing a clean and well-documented project structure early helps the team collaborate effectively and reduces technical debt. This foundation will allow the application to scale smoothly as real-time data, alerts, and cloud services are added.
