import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import { RelativeTimeCard } from "~/components/ui/relative-time-card";
import type { DeviceResponse } from "~/lib/validation/devices";
import { deviceTypeEnum } from "~/server/db/schemas/pending-devices";

export function getDevicesColumns(): ColumnDef<DeviceResponse>[] {
  return [
    {
      id: "type",
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
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
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
      meta: {
        label: "Name",
        placeholder: "Search name...",
        variant: "text",
      },
      enableColumnFilter: true,
      enableHiding: false,
    },
    {
      id: "description",
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => <div>{row.getValue("description")}</div>,
      enableSorting: false,
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Added at" />
      ),
      cell: ({ row }) => (
        <RelativeTimeCard date={new Date(row.original.createdAt * 1000)} />
      ),
      enableSorting: false,
    },
  ];
}
