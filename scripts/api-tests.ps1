$Base = 'http://localhost:3000'

Write-Output "GET /api/users"
Invoke-RestMethod -Uri "$Base/api/users" -Method Get | ConvertTo-Json -Depth 4

Write-Output "POST /api/users"
$user = Invoke-RestMethod -Uri "$Base/api/users" -Method Post -Body (@{name='Test User'; email='test@example.com'; role='PATIENT'} | ConvertTo-Json) -ContentType 'application/json'
$user | ConvertTo-Json -Depth 4
$userId = $user.id

if ($null -ne $userId) {
    Write-Output "GET /api/users/$userId"
    Invoke-RestMethod -Uri "$Base/api/users/$userId" -Method Get | ConvertTo-Json -Depth 4

    Write-Output "PUT /api/users/$userId"
    Invoke-RestMethod -Uri "$Base/api/users/$userId" -Method Put -Body (@{name='Updated PS User'} | ConvertTo-Json) -ContentType 'application/json' | ConvertTo-Json -Depth 4

    Write-Output "DELETE /api/users/$userId"
    Invoke-RestMethod -Uri "$Base/api/users/$userId" -Method Delete | ConvertTo-Json -Depth 4
}

# Queues
Write-Output "POST /api/queues"
$queue = Invoke-RestMethod -Uri "$Base/api/queues" -Method Post -Body (@{doctorId=1; date='2025-12-31T09:00:00Z'} | ConvertTo-Json) -ContentType 'application/json'
$queue | ConvertTo-Json -Depth 4
$queueId = $queue.id

if ($null -ne $queueId) {
    Write-Output "GET /api/queues/$queueId"
    Invoke-RestMethod -Uri "$Base/api/queues/$queueId" -Method Get | ConvertTo-Json -Depth 4

    Write-Output "PUT /api/queues/$queueId"
    Invoke-RestMethod -Uri "$Base/api/queues/$queueId" -Method Put -Body (@{currentNo=2} | ConvertTo-Json) -ContentType 'application/json' | ConvertTo-Json -Depth 4

    Write-Output "DELETE /api/queues/$queueId"
    Invoke-RestMethod -Uri "$Base/api/queues/$queueId" -Method Delete | ConvertTo-Json -Depth 4
}

# Appointments
Write-Output "POST /api/appointments"
if (-not $userId -or -not $queueId) {
    Write-Output "Missing userId or queueId; falling back to 1"
    $appt = Invoke-RestMethod -Uri "$Base/api/appointments" -Method Post -Body (@{tokenNo=1; userId=1; queueId=1; status='PENDING'} | ConvertTo-Json) -ContentType 'application/json'
} else {
    $appt = Invoke-RestMethod -Uri "$Base/api/appointments" -Method Post -Body (@{tokenNo=1; userId=$userId; queueId=$queueId; status='PENDING'} | ConvertTo-Json) -ContentType 'application/json'
}
$appt | ConvertTo-Json -Depth 4
$apptId = $appt.id

if ($null -ne $apptId) {
    Write-Output "GET /api/appointments/$apptId"
    Invoke-RestMethod -Uri "$Base/api/appointments/$apptId" -Method Get | ConvertTo-Json -Depth 4

    Write-Output "PUT /api/appointments/$apptId"
    Invoke-RestMethod -Uri "$Base/api/appointments/$apptId" -Method Put -Body (@{status='COMPLETED'} | ConvertTo-Json) -ContentType 'application/json' | ConvertTo-Json -Depth 4

    Write-Output "DELETE /api/appointments/$apptId"
    Invoke-RestMethod -Uri "$Base/api/appointments/$apptId" -Method Delete | ConvertTo-Json -Depth 4
}

Write-Output "Done"
