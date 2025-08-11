"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { labels } from "../model/data"
import { clone, copy, edit, favorite, del } from "../model/actions"
import { SaveDataType } from "../hooks/useData"
import { CampaignEditor } from "@/components/campaign/campaign-editor"
import { useState } from "react"
import { Campaign } from "@/sdk/model/campaign"

interface RowActionsProps<T> {
  row: Row<T>
  data: T[]
  saveData: SaveDataType
}

export function RowActions<T>({
  row,
  data,
  saveData
}: RowActionsProps<T>) {
  const item = row.original
  const id = String((item as any)?.id ?? "");
  const [showEditor, setShowEditor] = useState(false);

  const handleCampaignSaved = async (campaign: Campaign) => {
    if (!campaign) {
      console.error('campaign is undefined')
    }

    await saveData();
    setShowEditor(false);
  };

  if (showEditor) {
    return <CampaignEditor eventId={id} onSaved={handleCampaignSaved} onCancelled={() => setShowEditor(false)} />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => copy<T>(item)}>Copy</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {setShowEditor(true)}}>Show in Editor</DropdownMenuItem>
        <DropdownMenuItem onClick={() => edit<T>(item)}>Edit</DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            clone<T>(data, item);
            await saveData();
          }}
        >
          Make a copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => favorite<T>(item)}>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={id}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => {
            del<T>(data, item);
            await saveData();
          }}
        >
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
