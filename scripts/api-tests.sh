#!/usr/bin/env bash
BASE=http://localhost:3000
set -e

echo "GET /api/users"
curl -s "$BASE/api/users" | jq

echo "POST /api/users"
user_json=$(curl -s -X POST "$BASE/api/users" -H 'Content-Type: application/json' -d '{"name":"Test User","email":"test@example.com","role":"PATIENT"}')
echo "$user_json" | jq
user_id=$(echo "$user_json" | jq -r '.id')

echo "GET /api/users?page=1&limit=5"
curl -s "$BASE/api/users?page=1&limit=5" | jq

if [ "$user_id" = "null" ] || [ -z "$user_id" ]; then
  echo "No user id returned; skipping dependent tests"
else
  echo "GET /api/users/$user_id"
  curl -s "$BASE/api/users/$user_id" | jq || true

  echo "PUT /api/users/$user_id"
  curl -s -X PUT "$BASE/api/users/$user_id" -H 'Content-Type: application/json' -d '{"name":"Test Updated"}' | jq || true

  echo "DELETE /api/users/$user_id"
  curl -s -X DELETE "$BASE/api/users/$user_id" | jq || true
fi

# Queues
echo "POST /api/queues"
queue_json=$(curl -s -X POST "$BASE/api/queues" -H 'Content-Type: application/json' -d '{"doctorId":1,"date":"2025-12-31T09:00:00Z"}')
echo "$queue_json" | jq
queue_id=$(echo "$queue_json" | jq -r '.id')

echo "GET /api/queues"
curl -s "$BASE/api/queues" | jq

if [ "$queue_id" = "null" ] || [ -z "$queue_id" ]; then
  echo "No queue id returned; skipping queue dependent tests"
else
  echo "GET /api/queues/$queue_id"
  curl -s "$BASE/api/queues/$queue_id" | jq || true

  echo "PUT /api/queues/$queue_id"
  curl -s -X PUT "$BASE/api/queues/$queue_id" -H 'Content-Type: application/json' -d '{"currentNo":2}' | jq || true

  echo "DELETE /api/queues/$queue_id"
  curl -s -X DELETE "$BASE/api/queues/$queue_id" | jq || true
fi

# Appointments (requires a user id and queue id)
echo "POST /api/appointments"
if [ -z "$user_id" ] || [ -z "$queue_id" ]; then
  echo "Missing user_id or queue_id; will attempt using 1 as fallback"
  fallback_user=1
  fallback_queue=1
  appt_json=$(curl -s -X POST "$BASE/api/appointments" -H 'Content-Type: application/json' -d '{"tokenNo":1,"userId":'$fallback_user',"queueId":'$fallback_queue',"status":"PENDING"}')
else
  appt_json=$(curl -s -X POST "$BASE/api/appointments" -H 'Content-Type: application/json' -d '{"tokenNo":1,"userId":'$user_id',"queueId":'$queue_id',"status":"PENDING"}')
fi

echo "$appt_json" | jq
appt_id=$(echo "$appt_json" | jq -r '.id')

echo "GET /api/appointments"
curl -s "$BASE/api/appointments" | jq

if [ "$appt_id" = "null" ] || [ -z "$appt_id" ]; then
  echo "No appointment id returned; skipping appointment dependent tests"
else
  echo "GET /api/appointments/$appt_id"
  curl -s "$BASE/api/appointments/$appt_id" | jq || true

  echo "PUT /api/appointments/$appt_id"
  curl -s -X PUT "$BASE/api/appointments/$appt_id" -H 'Content-Type: application/json' -d '{"status":"COMPLETED"}' | jq || true

  echo "DELETE /api/appointments/$appt_id"
  curl -s -X DELETE "$BASE/api/appointments/$appt_id" | jq || true
fi

echo "Done"
