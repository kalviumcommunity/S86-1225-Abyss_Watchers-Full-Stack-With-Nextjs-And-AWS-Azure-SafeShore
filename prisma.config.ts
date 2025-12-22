import { defineConfig } from "@prisma/config";

export default defineConfig({
  migrations: {
    // Use a small CommonJS seed script to avoid ESM loader issues
    seed: "node prisma/seed.cjs",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:password@localhost:5432/mydb",
  },
});
