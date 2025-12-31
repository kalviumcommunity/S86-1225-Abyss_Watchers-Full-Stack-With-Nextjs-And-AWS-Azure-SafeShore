Logging & Monitoring — CloudWatch (AWS) and Azure Monitor

This document shows recommended steps to emit structured logs from the application, collect them in your cloud provider, create dashboards and alerts, and set retention/archival policies.

1) Application logging (structured JSON)

- Use the `lib/logger.ts` helper which emits JSON to stdout/stderr.
- Include a correlation id per request (`x-request-id`) so logs can be traced end-to-end.

Example log structure (already used by `lib/logger`):

```json
{ "level": "info", "message": "incoming_request", "meta": { "requestId": "...", "method": "GET", "pathname": "/api/users" }, "timestamp": "..." }
```

2) Propagate request id

- `app/middleware.ts` now generates or forwards `x-request-id` and attaches it to responses for easier tracing.
- Ensure backend API handlers read `x-request-id` and include it in all logs.

3) AWS CloudWatch (ECS)

- In your ECS task definition, enable the `awslogs` driver:

```json
"logConfiguration": {
  "logDriver": "awslogs",
  "options": {
    "awslogs-group": "/ecs/nextjs-app",
    "awslogs-region": "ap-south-1",
    "awslogs-stream-prefix": "ecs"
  }
}
```

- Create the CloudWatch Log Group `/ecs/nextjs-app` and set retention (e.g., 14 days).
- Create a metric filter to count errors (pattern matches `$.level = "error"`):
  - Filter pattern: `{ $.level = "error" }`
  - Metric namespace: `NextJS/App`
  - Metric name: `ErrorCount`

- Create CloudWatch Alarms on the metric (e.g., ErrorCount > 10 for 5 minutes) and attach SNS topic for notifications.
- Build CloudWatch Dashboards showing:
  - ErrorCount (by service)
  - Average request latency (custom metric)
  - Container CPU / memory utilization

4) Emitting custom metrics (optional)

- Use CloudWatch PutMetricData to emit metrics like request latency, success rate, or queue lengths.
- Example: emit `RequestDurationMs` with `aws-sdk` on server-side handlers.

5) Archive logs

- Export CloudWatch logs to S3 for long-term archival if required.
- Configure lifecycle rules on the S3 bucket to transition to Glacier.

6) Azure Monitor / App Service

- Enable Diagnostic settings on App Service and route logs to a Log Analytics Workspace.
- Use Kusto Query Language (KQL) to build queries, for example:

```
AppServiceConsoleLogs
| where Level == "Error"
| summarize count() by bin(TimeGenerated, 1h)
```

- Create Alerts based on query results: e.g., error count over threshold.
- Create dashboards with metrics: CPU, memory, request failures, response time.

7) Log retention & cost

- Recommended: operational logs 7–14 days; audit logs 90+ days.
- Monitor ingestion and storage costs; tune log verbosity in production (avoid debug-level logs).

8) On-call & alerts

- Configure escalation via SNS (AWS) or Action Groups (Azure).
- Add runbook links to alerts for first-response steps (check logs, restart service, scale tasks).

9) Quick verification steps

- Deploy app to ECS / App Service with logging enabled.
- Trigger an error (invalid request) and confirm structured log appears in CloudWatch / Log Analytics.
- Verify `x-request-id` is present in response headers and log entries.

10) Deliverables & files added

- `app/middleware.ts` — adds `x-request-id` propagation and structured request log.
- `lib/logger.ts` — JSON logger used across the app.
- This `MONITORING.md` — instructions, metric filter examples, and verification steps.

If you'd like, I can:
- Add a small example that emits a custom CloudWatch metric for request duration, or
- Create an ECS task-definition JSON template with `awslogs` configured and add a GitHub Action step to register it.
