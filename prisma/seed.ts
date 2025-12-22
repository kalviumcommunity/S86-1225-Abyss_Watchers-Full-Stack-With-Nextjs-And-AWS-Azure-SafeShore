import { PrismaClient, Role, Status } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ---- Users (idempotent via upsert on unique email) ----
  const users = [
    { name: "Alice", email: "alice@example.com", role: Role.PATIENT },
    { name: "Bob", email: "bob@example.com", role: Role.PATIENT },
    { name: "Admin", email: "admin@example.com", role: Role.ADMIN },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: u,
    });
  }

  // ---- Doctors (idempotent via findFirst by name+specialty) ----
  const doctorsData = [
    { name: "Dr. Smith", specialty: "Cardiology", roomNo: "101A" },
    { name: "Dr. Lee", specialty: "Pediatrics", roomNo: "202B" },
  ];

  const doctors = [] as { id: number; name: string }[];
  for (const d of doctorsData) {
    let doc = await prisma.doctor.findFirst({
      where: { name: d.name, specialty: d.specialty },
    });
    if (!doc) doc = await prisma.doctor.create({ data: d });
    doctors.push(doc);
  }

  // ---- Queues (one per doctor for today at 00:00 UTC) ----
  const today = new Date();
  const dateOnly = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  const queues = [] as { id: number; doctorId: number }[];
  for (const doc of doctors) {
    let q = await prisma.queue.findFirst({
      where: { doctorId: doc.id, date: dateOnly },
    });
    if (!q)
      q = await prisma.queue.create({
        data: { doctorId: doc.id, date: dateOnly },
      });
    queues.push(q);
  }

  // ---- Appointments (idempotent via compound unique on [queueId, tokenNo]) ----
  // Make one sample appointment for Alice (tokenNo 1) on the first doctor's queue
  const alice = await prisma.user.findUnique({
    where: { email: "alice@example.com" },
  });
  if (!alice) throw new Error("Expected seeded user Alice to exist");

  if (queues.length > 0) {
    const q = queues[0];
    await prisma.appointment.upsert({
      where: { queueId_tokenNo: { queueId: q.id, tokenNo: 1 } },
      update: { status: Status.PENDING, userId: alice.id },
      create: {
        tokenNo: 1,
        status: Status.PENDING,
        userId: alice.id,
        queueId: q.id,
      },
    });
  }

  console.log("✅ Seed data inserted/updated successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
