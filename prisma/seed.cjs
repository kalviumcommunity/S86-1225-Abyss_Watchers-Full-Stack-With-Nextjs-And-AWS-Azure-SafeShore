require("dotenv").config();
const { Pool } = require("pg");
// Normalize DATABASE_URL: strip surrounding quotes if present
const rawDbUrl = process.env.DATABASE_URL || "";
const connectionString = rawDbUrl.replace(/^"(.*)"$/, "$1");
const pool = new Pool({ connectionString });

async function upsertUser(client, name, email, role) {
  const res = await client.query(
    `INSERT INTO "User" (name, email, role) VALUES ($1, $2, $3)
     ON CONFLICT ("email") DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
     RETURNING id`,
    [name, email, role]
  );
  return res.rows[0];
}

async function findOrCreateDoctor(client, d) {
  const found = await client.query(
    `SELECT id, name FROM "Doctor" WHERE name = $1 AND specialty = $2 LIMIT 1`,
    [d.name, d.specialty]
  );
  if (found.rows.length) return found.rows[0];
  const res = await client.query(
    `INSERT INTO "Doctor" ("name", "specialty", "roomNo") VALUES ($1, $2, $3) RETURNING id, name`,
    [d.name, d.specialty, d.roomNo]
  );
  return res.rows[0];
}

async function findOrCreateQueue(client, doctorId, dateOnly) {
  const found = await client.query(
    `SELECT id, "doctorId" FROM "Queue" WHERE "doctorId" = $1 AND "date" = $2 LIMIT 1`,
    [doctorId, dateOnly]
  );
  if (found.rows.length) return found.rows[0];
  const res = await client.query(
    `INSERT INTO "Queue" ("doctorId", "date") VALUES ($1, $2) RETURNING id, "doctorId"`,
    [doctorId, dateOnly]
  );
  return res.rows[0];
}

async function upsertAppointment(client, queueId, tokenNo, status, userId) {
  await client.query(
    `INSERT INTO "Appointment" ("tokenNo", "status", "userId", "queueId")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("queueId", "tokenNo") DO UPDATE SET "status" = EXCLUDED."status", "userId" = EXCLUDED."userId"`,
    [tokenNo, status, userId, queueId]
  );
}

async function main() {
  const client = await pool.connect();
  try {
    // ---- Users ----
    const users = [
      { name: "Alice", email: "alice@example.com", role: "PATIENT" },
      { name: "Bob", email: "bob@example.com", role: "PATIENT" },
      { name: "Admin", email: "admin@example.com", role: "ADMIN" },
    ];

    for (const u of users) {
      await upsertUser(client, u.name, u.email, u.role);
    }

    // ---- Doctors ----
    const doctorsData = [
      { name: "Dr. Smith", specialty: "Cardiology", roomNo: "101A" },
      { name: "Dr. Lee", specialty: "Pediatrics", roomNo: "202B" },
    ];

    const doctors = [];
    for (const d of doctorsData) {
      const doc = await findOrCreateDoctor(client, d);
      doctors.push(doc);
    }

    // ---- Queues ----
    const today = new Date();
    const dateOnly = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    const queues = [];
    for (const doc of doctors) {
      const q = await findOrCreateQueue(client, doc.id, dateOnly);
      queues.push(q);
    }

    // ---- Appointment ----
    const aliceRes = await client.query(
      `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
      ["alice@example.com"]
    );
    if (!aliceRes.rows.length)
      throw new Error("Expected seeded user Alice to exist");
    const aliceId = aliceRes.rows[0].id;

    if (queues.length > 0) {
      const q = queues[0];
      await upsertAppointment(client, q.id, 1, "PENDING", aliceId);
    }

    console.log("✅ Seed data inserted/updated successfully");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
