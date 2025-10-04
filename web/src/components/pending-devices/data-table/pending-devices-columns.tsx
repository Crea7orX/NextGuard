import type { ColumnDef } from "@tanstack/react-table";
import type React from "react";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { PendingDevicesActions } from "~/components/pending-devices/data-table/pending-devices-actions";
import { Badge } from "~/components/ui/badge";
import { RelativeTimeCard } from "~/components/ui/relative-time-card";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";
import {
  deviceTypeEnum,
  pendingDeviceState,
} from "~/server/db/schemas/pending-devices";

interface Props {
  setAdoptDevice: React.Dispatch<
    React.SetStateAction<PendingDeviceResponse | undefined>
  >;
  setAdoptDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function getPendingDevicesColumns({
  setAdoptDevice,
  setAdoptDialogOpen,
}: Props): ColumnDef<PendingDeviceResponse>[] {
  return [
    {
      id: "type",
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{row.getValue("type")}</Badge>
          {row.original.state === pendingDeviceState.enumValues[0] ? (
            <Badge>Auto discovered</Badge>
          ) : (
            <Badge>Adopting</Badge>
          )}
        </div>
      ),
      size: 0,
      meta: {
        label: "Type",
        variant: "multiSelect",
        options: deviceTypeEnum.enumValues.map((type) => ({
          value: type,
          label: type,
        })),
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "serialId",
      accessorKey: "serialId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Serial #" />
      ),
      cell: ({ row }) => <div>{row.getValue("serialId")}</div>,
      meta: {
        label: "Serial #",
        placeholder: "Search serial #...",
        variant: "text",
      },
      enableColumnFilter: true,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created at" />
      ),
      cell: ({ row }) => (
        <RelativeTimeCard date={new Date(row.original.createdAt * 1000)} />
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <PendingDevicesActions
          key={row.original.id}
          pendingDevice={row.original}
          setAdoptDevice={setAdoptDevice}
          setAdoptDialogOpen={setAdoptDialogOpen}
        />
      ),
      size: 40,
    },
  ];
}
