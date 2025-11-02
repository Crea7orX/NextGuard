import { deviceTypes } from "@repo/validations/websockets/devices";
import { sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import IdPrefix, { generateId } from "~/lib/ids";

export const deviceTypeEnum = pgEnum("device_types", deviceTypes);
export const pendingDeviceState = pgEnum("pending_device_states", [
  "auto_discovered",
  "pending_introduce",
  "pending_acknowledgement",
  "waiting_user_confirmation",
]);

export const pendingDevices = pgTable("pending_devices", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => generateId(IdPrefix.PENDING_DEVICE)),
  serialId: uuid("serial_id").notNull(),
  type: deviceTypeEnum("type").notNull(),
  state: pendingDeviceState("state").notNull().default("pending_introduce"),
  publicKeyPem: text("public_key_pem"),
  ownerId: text("owner_id").notNull(),
  createdAt: integer("created_at")
    .default(sql`(EXTRACT(EPOCH FROM NOW()))`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(
    () => sql`(EXTRACT(EPOCH FROM NOW()))`,
  ),
});
