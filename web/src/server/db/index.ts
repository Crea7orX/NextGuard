import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";

import * as account from "~/server/db/schemas/account";
import * as hubs from "~/server/db/schemas/hubs";
import * as invitation from "~/server/db/schemas/invitation";
import * as member from "~/server/db/schemas/member";
import * as organization from "~/server/db/schemas/organization";
import * as pendingDevices from "~/server/db/schemas/pending-devices";
import * as session from "~/server/db/schemas/session";
import * as user from "~/server/db/schemas/user";
import * as verification from "~/server/db/schemas/verification";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, {
  schema: {
    ...account,
    ...hubs,
    ...invitation,
    ...member,
    ...organization,
    ...pendingDevices,
    ...session,
    ...user,
    ...verification,
  },
});
