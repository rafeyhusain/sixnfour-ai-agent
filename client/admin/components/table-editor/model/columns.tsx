import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@radix-ui/react-checkbox"
import { EditableCell } from "../components/editable-cell"
import { RowActions } from "../components/row-actions"
import { ColumnHeader } from "../components/column-header";
import { update } from "./actions";
import { SaveDataType } from "../hooks/useData";

export function getColumns<T>(data: T[], saveData: SaveDataType) {
    const columns: ColumnDef<T>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        ...generateColumns(data) ?? [],
        {
            id: "actions",
            cell: ({ row }) => <RowActions<T> row={row} data={data} saveData={saveData} />,
        }
    ];

    return columns;
}

function generateColumns<T>(data: T[]): ColumnDef<T>[] {
    data = data ?? [];

    if (!data.length) return [];

    const cols = Object.keys(data[0] as object).map((key) => getColumn(key, data));

    return cols as ColumnDef<T>[];
}

function getColumn<T>(key: string, data: T[]): ColumnDef<T> {
    console.log("data", data);
    return {
        accessorKey: key,
        header: ({ column }) => (
            <ColumnHeader column={column} title={key} />
        ),
        cell: ({ row }) => {
            const val = row.original[key as keyof typeof row.original];
            
            const value =
                typeof val === "string" || typeof val === "number"
                    ? String(val)
                    : JSON.stringify(val, null, 2)

            const editable = key !== "id";
           
            return (
                <EditableCell
                    editable={editable}
                    value={value}
                    onBlur={(newValue) => {
                        update(key, newValue, row.original);
                    }}
                />
            )

        }
    }
}