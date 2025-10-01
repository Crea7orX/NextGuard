import { sql } from "drizzle-orm";
import { integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import IdPrefix, { generateId } from "~/lib/ids";

export const hubs = pgTable("hubs", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => generateId(IdPrefix.HUB)),
  serialId: uuid("serial_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  publicKeyPem: text("public_key_pem"),
  ownerId: text("owner_id").notNull(),
  createdAt: integer("created_at")
    .default(sql`(EXTRACT(EPOCH FROM NOW()))`)
    .notNull(),
  updatedAt: integer("updated_at").$onUpdate(
    () => sql`(EXTRACT(EPOCH FROM NOW()))`,
  ),
});
