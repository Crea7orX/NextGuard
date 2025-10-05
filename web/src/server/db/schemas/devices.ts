import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import IdPrefix, { generateId } from "~/lib/ids";
import { deviceTypeEnum } from "~/server/db/schemas/pending-devices";

export const devices = pgTable("devices", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => generateId(IdPrefix.DEVICE)),
  serialId: uuid("serial_id").notNull(),
  type: deviceTypeEnum("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  publicKeyPem: text("public_key_pem"),
  metadata: jsonb("metadata").notNull().default({}),
  ownerId: text("owner_id").notNull(),
  createdAt: integer("created_at")
    .default(sql`(EXTRACT(EPOCH FROM NOW()))`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(
    () => sql`(EXTRACT(EPOCH FROM NOW()))`,
  ),
});
