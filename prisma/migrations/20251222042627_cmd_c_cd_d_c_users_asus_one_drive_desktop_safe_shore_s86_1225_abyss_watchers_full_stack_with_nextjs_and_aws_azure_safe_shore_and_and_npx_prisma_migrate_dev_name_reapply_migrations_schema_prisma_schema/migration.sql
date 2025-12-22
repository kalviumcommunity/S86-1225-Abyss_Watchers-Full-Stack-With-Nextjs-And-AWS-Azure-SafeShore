-- CreateIndex
CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");

-- CreateIndex
CREATE INDEX "Appointment_queueId_idx" ON "Appointment"("queueId");

-- CreateIndex
CREATE INDEX "Queue_doctorId_idx" ON "Queue"("doctorId");

-- CreateIndex
CREATE INDEX "Queue_date_idx" ON "Queue"("date");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
