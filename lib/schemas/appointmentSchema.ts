import { z } from "zod";

export const appointmentSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  scheduledAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Invalid date",
  }),
  notes: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
