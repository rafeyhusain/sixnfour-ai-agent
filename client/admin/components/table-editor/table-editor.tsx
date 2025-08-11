"use client"

import * as React from "react"
import {
  flexRender
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getColumns } from "./model/columns"
import { useTable } from "./model/table"
import { useData } from "./hooks/useData"
import { Toolbar } from "./components/toolbar"
import { Pagination } from "./components/pagination"
import { getFilters } from "./model/filters"
import { AlertStrip } from "@/components/wingui/alert-strip/alert-strip"
import { SpinnerStrip } from "../wingui/spinner-strip/spinner-strip"

export interface TableEditorProps<T extends object> {
  name: string;
  test: T;
}

export function TableEditor<T extends object>({ name }: TableEditorProps<T>) {
  const { data, loading, error, message, saveData } = useData<T>(name);

  const columns = getColumns<T>(data, saveData);
  const table = useTable(data, columns);
  const filters = getFilters(name);

  if (loading) return <SpinnerStrip show={loading} size="medium" text="Loading..." />
  if (!table) return null;

  return (
    <div className="space-y-4">

      {error && <AlertStrip type="error" title="Error" message={message} />}
      {!error && <AlertStrip type="success" title="Success" message={message} />}

      <Toolbar table={table} filters={filters} onSave={saveData} loading={loading} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
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
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination table={table} />
    </div>
  )
}
