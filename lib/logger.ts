export const logger = {
  info: (message: string, meta?: any) => {
    try {
      console.log(JSON.stringify({ level: "info", message, meta: meta ?? null, timestamp: new Date().toISOString() }));
    } catch (e) {
      // fallback
      console.log("INFO:", message, meta);
    }
  },
  error: (message: string, meta?: any) => {
    try {
      console.error(JSON.stringify({ level: "error", message, meta: meta ?? null, timestamp: new Date().toISOString() }));
    } catch (e) {
      // fallback
      console.error("ERROR:", message, meta);
    }
  },
};
