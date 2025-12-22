import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Decide on a safe default engine type and warn if the environment is misconfigured.
const _determineEngineType = () => {
  const current = process.env.PRISMA_CLIENT_ENGINE_TYPE;
  const hasAdapter = !!process.env.PRISMA_CLIENT_ENGINE_ADAPTER;
  const hasAccelerateUrl = !!process.env.PRISMA_CLIENT_ACCELERATE_URL;

  if (current === "client" && !hasAdapter && !hasAccelerateUrl) {
    // If someone set engine to 'client' but didn't provide the required adapter/accelerateUrl,
    // fall back to 'binary' to avoid PrismaClientConstructorValidationError during local dev.
    // Log a clear message so the developer can fix the env if they intended to use 'client'.
     
    console.warn(
      'Warning: PRISMA_CLIENT_ENGINE_TYPE="client" requires PRISMA_CLIENT_ENGINE_ADAPTER or PRISMA_CLIENT_ACCELERATE_URL. Falling back to "binary" for compatibility.'
    );
    return "binary";
  }

  return current || "binary";
};

// Apply the resolved engine type.
process.env.PRISMA_CLIENT_ENGINE_TYPE = _determineEngineType();

let _prisma: PrismaClient;
try {
  _prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
} catch (err) {
   
  console.error("PrismaClient initialization failed:", err);
  throw err;
}

export const prisma = _prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
