import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "~/server/db/schemas/organization";
import { user } from "~/server/db/schemas/user";

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});
