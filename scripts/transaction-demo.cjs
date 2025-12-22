/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: (process.env.DATABASE_URL || "").replace(
    /^\"(.*)\"$/,
    "$1"
  ),
});

async function showCounts(client) {
  const users = (await client.query('SELECT count(*) FROM "User"')).rows[0]
    .count;
  const appointments = (
    await client.query('SELECT count(*) FROM "Appointment"')
  ).rows[0].count;
  const qres = await client.query(
    'SELECT id, "currentNo" as "currentNo" FROM "Queue" ORDER BY id ASC LIMIT 1'
  );
  const queue = qres.rows[0];
  console.log(
    `Counts => users: ${users}, appointments: ${appointments}, queueId:${queue?.id}, currentNo:${queue?.currentNo}`
  );
}

async function successfulTransaction() {
  console.log("\n--- Running successful transaction (SQL) ---");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const qres = await client.query(
      'SELECT id, "currentNo" as "currentNo" FROM "Queue" ORDER BY id ASC LIMIT 1'
    );
    if (!qres.rows.length) throw new Error("No queue found");
    const queue = qres.rows[0];
    // compute next free tokenNo for this queue
    const maxRes = await client.query(
      'SELECT MAX("tokenNo") as max_token FROM "Appointment" WHERE "queueId" = $1',
      [queue.id]
    );
    const maxToken = Number(maxRes.rows[0].max_token) || 0;
    const tokenNo = Math.max(Number(queue.currentNo) || 0, maxToken) + 1;

    await client.query(
      'INSERT INTO "Appointment" ("tokenNo","status","userId","queueId") VALUES ($1,$2,$3,$4)',
      [tokenNo, "PENDING", 1, queue.id]
    );
    await client.query('UPDATE "Queue" SET "currentNo" = $1 WHERE id = $2', [
      tokenNo,
      queue.id,
    ]);

    await client.query("COMMIT");

    console.log("SQL Transaction committed, inserted tokenNo", tokenNo);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function failingTransaction() {
  console.log("\n--- Running failing transaction (SQL) expected rollback) ---");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const qres = await client.query(
      'SELECT id, "currentNo" FROM "Queue" ORDER BY id ASC LIMIT 1'
    );
    if (!qres.rows.length) throw new Error("No queue found");
    const queue = qres.rows[0];

    // Intentionally insert duplicate tokenNo = 1 to violate unique constraint on (queueId, tokenNo)
    await client.query('UPDATE "Queue" SET "currentNo" = $1 WHERE id = $2', [
      1,
      queue.id,
    ]);
    await client.query(
      'INSERT INTO "Appointment" ("tokenNo","status","userId","queueId") VALUES ($1,$2,$3,$4)',
      [1, "PENDING", 1, queue.id]
    );

    await client.query("COMMIT");
  } catch (e) {
    console.error("SQL Transaction failed and rolled back:", e.message || e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await showCounts(client);
    client.release();

    await successfulTransaction();

    const client2 = await pool.connect();
    await showCounts(client2);
    client2.release();

    await failingTransaction();

    const client3 = await pool.connect();
    await showCounts(client3);
    client3.release();

    console.log("Done.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
