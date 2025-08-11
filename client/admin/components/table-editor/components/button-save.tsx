"use client"

import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner";


interface ButtonSaveProps {
  onSave: () => Promise<void>;
  saving: boolean;
}

export function ButtonSave({
  onSave,
  saving
}: ButtonSaveProps) {
  return (
    <Button
      variant="default"
      size="sm"
      className="ml-auto hidden h-8 lg:flex"
      onClick={onSave} disabled={saving}
    >
      {saving ? <Spinner /> : <Save />}
      Save
    </Button>
  )
}
