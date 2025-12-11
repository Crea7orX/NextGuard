import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import IdPrefix, { generateId } from "~/lib/ids";

export const events = pgTable("events", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => generateId(IdPrefix.EVENT)),
  action: varchar("action", { length: 256 }).notNull(),
  actorName: varchar("actor_name", { length: 1024 }),
  actorId: varchar("actor_id", { length: 256 }).notNull(),
  objectId: varchar("object_id", { length: 256 }),
  reference: jsonb("reference"),
  title: varchar("title", { length: 256 }).notNull(),
  description: varchar("description", { length: 256 }).notNull(),
  ownerId: varchar("owner_id", { length: 256 }).notNull(),
  createdAt: integer("created_at")
    .default(sql`(EXTRACT(EPOCH FROM NOW()))`)
    .notNull(),
});
