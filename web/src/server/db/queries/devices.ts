import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import type { DeviceSearchParams } from "~/lib/validation/devices";
import { db } from "~/server/db";
import { devices } from "~/server/db/schemas/devices";

interface getDevicesProps {
  searchParams: DeviceSearchParams;
  ownerId: string;
}

export async function getDevices({ searchParams, ownerId }: getDevicesProps) {
  try {
    const offset = (searchParams.page - 1) * searchParams.perPage;

    const where = and(
      searchParams.serialId
        ? ilike(sql`${devices.serialId}::text`, `%${searchParams.serialId}%`)
        : undefined,
      searchParams.type && searchParams.type.length > 0
        ? inArray(devices.type, searchParams.type)
        : undefined,
      searchParams.name
        ? ilike(devices.name, `%${searchParams.name}%`)
        : undefined,
      eq(devices.ownerId, ownerId), // ownership
    );

    const orderBy =
      searchParams.sort.length > 0
        ? searchParams.sort.map((item) =>
            item.desc ? desc(devices[item.id]) : asc(devices[item.id]),
          )
        : [asc(devices.createdAt)];

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(devices)
        .limit(searchParams.perPage)
        .offset(offset)
        .where(where)
        .orderBy(...orderBy);

      const total = await tx
        .select({
          count: count(),
        })
        .from(devices)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return {
        data,
        total,
      };
    });

    const pageCount = Math.ceil(total / searchParams.perPage);
    return { data, pageCount };
  } catch {
    return { data: [], pageCount: 0 };
  }
}
