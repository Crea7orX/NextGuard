"use client";

import type { Row } from "@tanstack/react-table";
import { PlusCircle } from "lucide-react";
import type { SearchParams } from "nuqs";
import * as React from "react";
import { DataTable } from "~/components/data-table/data-table";
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar";
import { getDevicesColumns } from "~/components/devices/data-table/devices-columns";
import { DevicesEmpty } from "~/components/devices/data-table/devices-empty";
import { DevicesSheetBody } from "~/components/devices/sheet/devices-sheet-body";
import { PendingDevicesDataTable } from "~/components/pending-devices/data-table/pending-devices-data-table";
import { PendingDevicesCreateDialog } from "~/components/pending-devices/pending-devices-create-dialog";
import { Button } from "~/components/ui/button";
import { useGetAllDevicesQuery } from "~/hooks/api/devices/use-get-all-devices-query";
import { useDataTable } from "~/hooks/use-data-table";
import { sheet } from "~/lib/sheet-store";
import { cn } from "~/lib/utils";
import type { DeviceResponse } from "~/lib/validation/devices";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default function DevicesPage({ searchParams }: Props) {
  const search = React.use(searchParams);
  const { data, isLoading, isPlaceholderData } = useGetAllDevicesQuery({
    searchParams: search,
    refetchInterval: 1000,
  });

  // TODO: add skeletons

  const columns = React.useMemo(() => getDevicesColumns(), []);
  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pageCount ?? 0,
    enableMultiRowSelection: false,
    getRowId: (row) => row.id,
  });

  function handleRowClick(row: Row<DeviceResponse>) {
    if (sheet.getId() === row.id) {
      sheet.close();
      return;
    }

    sheet.open({
      id: row.id,
      title: row.original.name,
      body: <DevicesSheetBody id={row.id} />,
      onClose: () => {
        row.toggleSelected(false);
      },
    });
  }

  return (
    <div className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:p-4">
      <div className="flex flex-col gap-2 md:gap-4">
        <DataTableToolbar
          table={table}
          className="bg-card/30 rounded-md border p-4"
        >
          <PendingDevicesCreateDialog>
            <Button className="h-8">
              <PlusCircle className="size-4" />
              Add
            </Button>
          </PendingDevicesCreateDialog>
        </DataTableToolbar>
        <div className="bg-card/30 rounded-md border p-4">
          <PendingDevicesDataTable className="pb-2" />
          <DataTable
            table={table}
            className={cn(isPlaceholderData && "opacity-50")}
            notFoundChildren={<DevicesEmpty />}
            paginationClassName="px-0"
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
}
