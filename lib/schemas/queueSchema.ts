import { z } from "zod";

export const queueSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  capacity: z.number().int().min(1, "Capacity must be at least 1").optional(),
});

export type QueueInput = z.infer<typeof queueSchema>;
