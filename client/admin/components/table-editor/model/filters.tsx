import { filters, Table } from "./data";

export interface DataTableToolbarFilter {
    columnId: string
    title: string
    options: { label: string; value: string; icon: any }[]
  }

export function getFilters(name: string): DataTableToolbarFilter [] | undefined {
  const list = [];

  switch(name) {
     case Table.CampaignTasks:
      list.push(filters.status)
  }

  return list;
}