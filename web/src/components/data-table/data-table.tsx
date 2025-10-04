import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";
import { DataTablePagination } from "~/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getCommonPinningStyles } from "~/lib/data-table";
import { cn } from "~/lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  contentClassName?: string;
  notFoundChildren?: React.ReactNode;
  notFoundClassName?: string;
  withPagination?: boolean;
  paginationClassName?: string;
}

export function DataTable<TData>({
  className,
  table,
  actionBar,
  contentClassName,
  notFoundChildren,
  notFoundClassName,
  withPagination = true,
  paginationClassName,
  children,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div
        className={cn("overflow-hidden rounded-md border", contentClassName)}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...getCommonPinningStyles({ column: header.column }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...getCommonPinningStyles({ column: cell.column }),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : notFoundChildren ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className={cn(notFoundClassName)}
                >
                  {notFoundChildren}
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {(withPagination || actionBar) && (
        <div className="flex flex-col gap-2.5">
          {withPagination && (
            <DataTablePagination
              table={table}
              className={paginationClassName}
            />
          )}
          {actionBar &&
            table.getFilteredSelectedRowModel().rows.length > 0 &&
            actionBar}
        </div>
      )}
    </div>
  );
}
