import { prisma } from "../src/lib/prisma";

async function showCounts() {
  const users = await prisma.user.count();
  const appointments = await prisma.appointment.count();
  const queue = await prisma.queue.findFirst({ orderBy: { id: "asc" } });
  console.log(
    `Counts => users: ${users}, appointments: ${appointments}, queueId:${queue?.id}, currentNo:${queue?.currentNo}`
  );
}

async function successfulTransaction() {
  console.log("\n--- Running successful transaction ---");
  const queue = await prisma.queue.findFirst({ orderBy: { id: "asc" } });
  if (!queue) throw new Error("No queue found");

  const tokenNo = queue.currentNo + 1;

  const [appointment, updatedQueue] = await prisma.$transaction([
    prisma.appointment.create({
      data: { tokenNo, status: "PENDING", userId: 1, queueId: queue.id },
    }),
    prisma.queue.update({
      where: { id: queue.id },
      data: { currentNo: tokenNo },
    }),
  ]);

  console.log("Transaction success:", {
    appointmentId: appointment.id,
    updatedQueueCurrentNo: updatedQueue.currentNo,
  });
}

async function failingTransaction() {
  console.log("\n--- Running failing transaction (expected rollback) ---");
  const queue = await prisma.queue.findFirst({ orderBy: { id: "asc" } });
  if (!queue) throw new Error("No queue found");

  // Intentionally attempt to create a duplicate tokenNo to trigger unique-constraint error
  const duplicateTokenNo = 1; // likely exists from seed

  try {
    await prisma.$transaction(async (tx) => {
      await tx.queue.update({
        where: { id: queue.id },
        data: { currentNo: duplicateTokenNo },
      });
      await tx.appointment.create({
        data: {
          tokenNo: duplicateTokenNo,
          status: "PENDING",
          userId: 1,
          queueId: queue.id,
        },
      });
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Transaction failed as expected:", err.message);
    } else {
      console.error("Transaction failed as expected:", err);
    }
  }
}

async function main() {
  await showCounts();
  await successfulTransaction();
  await showCounts();
  await failingTransaction();
  await showCounts();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
