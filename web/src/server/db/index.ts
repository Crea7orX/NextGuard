import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";

import * as account from "~/server/db/schemas/account";
import * as session from "~/server/db/schemas/session";
import * as user from "~/server/db/schemas/user";
import * as verification from "~/server/db/schemas/verification";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, {
  schema: { ...account, ...session, ...user, ...verification },
});
