import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
  armed: boolean("armed").default(false).notNull(),
  sirenActive: boolean("siren_active").default(false).notNull(),
});
