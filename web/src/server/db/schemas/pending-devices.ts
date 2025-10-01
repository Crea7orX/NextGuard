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

export const deviceTypeEnum = pgEnum("device_types", ["hub"]);
export const pendingDeviceState = pgEnum("pending_device_states", [
  "pending_introduce",
  "pending_acknowledgement",
]);

export const pendingDevices = pgTable("pending_devices", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => generateId(IdPrefix.PENDING_DEVICE)),
  serialId: uuid("serial_id").notNull(),
  type: deviceTypeEnum("type").notNull(),
  publicKeyPem: text("public_key_pem"),
  ownerId: text("owner_id").notNull(),
  createdAt: integer("created_at")
    .default(sql`(EXTRACT(EPOCH FROM NOW()))`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(
    () => sql`(EXTRACT(EPOCH FROM NOW()))`,
  ),
});
