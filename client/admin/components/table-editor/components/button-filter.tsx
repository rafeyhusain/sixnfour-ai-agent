"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { FacetedFilter } from "./faceted-filter"
import { DataTableToolbarFilter } from "../model/filters"

interface ButtonFilterProps<TData> {
  table: Table<TData>;
  filters?: DataTableToolbarFilter[];
}

export function ButtonFilter<TData>({
  table,
  filters
}: ButtonFilterProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-1 items-center space-x-2">
      <Input
        placeholder="Filter by id..."
        value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("id")?.setFilterValue(event.target.value)
        }
        className="h-8 w-[150px] lg:w-[250px]"
      />
      {filters?.map((filter) => {
        const column = table.getColumn(filter.columnId)
        return column ? (
          <FacetedFilter
            key={filter.columnId}
            column={table.getColumn(filter.columnId)!}
            title={filter.title}
            options={filter.options}
          />
        ) : null
      })}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <X />
        </Button>
      )}
    </div>
  )
}
