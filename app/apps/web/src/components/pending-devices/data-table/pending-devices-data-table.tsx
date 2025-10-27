"use client";

import { ShieldPlus } from "lucide-react";
import React from "react";
import { AnimatedContainer } from "~/components/common/animated-container";
import { DataTable } from "~/components/data-table/data-table";
import { getPendingDevicesColumns } from "~/components/pending-devices/data-table/pending-devices-columns";
import { PendingDevicesAdoptDialog } from "~/components/pending-devices/pending-devices-adopt-dialog";
import { Item, ItemContent, ItemMedia, ItemTitle } from "~/components/ui/item";
import { useGetAllPendingDevicesQuery } from "~/hooks/api/pending-devices/use-get-all-pending-devices-query";
import { useDataTable } from "~/hooks/use-data-table";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";

export function PendingDevicesDataTable({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { data } = useGetAllPendingDevicesQuery({
    searchParams: {},
  });

  const [adoptDevice, setAdoptDevice] = React.useState<PendingDeviceResponse>();
  const [adoptDialogOpen, setAdoptDialogOpen] = React.useState(false);

  const [knownIds, setKnownIds] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!data) return;

    // if new id appears, open dialog
    const newIds = data.data.map((device) => device.id);
    const newIdsToOpen = newIds.filter((id) => !knownIds.includes(id));
    if (newIdsToOpen.length > 0 && knownIds.length > 0) {
      setAdoptDevice(data.data.find((device) => device.id === newIdsToOpen[0]));
      setAdoptDialogOpen(true);
    }

    setKnownIds(data.data.map((device) => device.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const columns = React.useMemo(
    () => getPendingDevicesColumns({ setAdoptDevice, setAdoptDialogOpen }),
    [],
  );
  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? 0,
    getRowId: (row) => row.id,
  });

  const rows = table.getRowModel().rows?.length;

  return (
    <AnimatedContainer uniqueKey={rows > 0 ? "pending-devices" : "empty"}>
      {rows > 0 && (
        <>
          <div className={className} {...props}>
            <Item
              variant="outline"
              className="bg-card rounded-b-none border-b-0 px-2 py-3"
            >
              <ItemMedia variant="icon">
                <ShieldPlus />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>New devices pending adoption!</ItemTitle>
              </ItemContent>
            </Item>
            <DataTable
              table={table}
              contentClassName="rounded-t-none"
              withPagination={false}
            />
          </div>
          <PendingDevicesAdoptDialog
            open={adoptDialogOpen}
            onOpenChange={setAdoptDialogOpen}
            pendingDevice={adoptDevice}
          />
        </>
      )}
    </AnimatedContainer>
  );
}
