"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { useCallback, useState } from "react"

interface EditableCellProps {
  editable: boolean
  value: string
  onBlur: (newValue: string) => void
}

export function EditableCell({ editable, value, onBlur }: EditableCellProps) {
  const [val, setVal] = useState(value)

  const handleBlur = useCallback(() => {
    onBlur(val);
  }, [val, onBlur])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
  }, [])

  if (editable)
    return (
      <div className="whitespace-pre-wrap break-words">
        <Textarea
          className="border border-gray-300 px-2 py-1 rounded text-sm resize-none overflow-y-auto whitespace-pre-wrap break-words inline-block align-top"
          value={val}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    )
  else
    return (
      <div className="whitespace-pre-wrap break-words">
        {value}
      </div>
    )
}
