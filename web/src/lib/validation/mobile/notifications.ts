import { de } from "date-fns/locale";
import z from "zod";

export const notificationRequestSchema = z.object({
    expoToken: z.string().min(21).max(255).regex(/^ExponentPushToken\[/, { message: "Invalid Expo token format" }),
});

export type NotificationRequest = z.infer<typeof notificationRequestSchema>;