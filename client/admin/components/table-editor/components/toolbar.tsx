"use client"

import { Table } from "@tanstack/react-table"
import { ButtonViewOptions } from "./button-view-options"

import { DataTableToolbarFilter } from "../model/filters"
import { ButtonSave } from "./button-save"
import { ButtonFilter } from "./button-filter"

interface ToolbarProps<TData> {
  table?: Table<TData>;
  filters?: DataTableToolbarFilter[];
  onSave: () => Promise<void>;
  loading: boolean;
}

export function Toolbar<TData>({
  table,
  filters,
  onSave,
  loading: saving
}: ToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      {table && <ButtonFilter table={table} filters={filters}/>}
      <div className="flex items-center space-x-2">
      {table && <ButtonViewOptions table={table} />}
        <ButtonSave onSave={onSave} saving={saving} />
      </div>
    </div>
  )
}
