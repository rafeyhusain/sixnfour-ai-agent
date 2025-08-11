"use client"

import { useState, KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

type TagInputProps = {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("")

  const addTag = () => {
    const newTag = input.trim()
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag])
    }
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const clearAllTags = () => {
    onChange([])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && input === "") {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="relative flex flex-wrap items-center gap-2 border rounded-md p-2 group">
      {value.length > 0 && (
        <button
          onClick={clearAllTags}
          type="button"
          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 z-50 shadow-sm"
          title="Clear all tags"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {value.map((tag, i) => (
        <Badge key={i} variant="outline" className="flex items-center gap-1">
          {tag}
          <button onClick={() => removeTag(tag)} type="button">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Filter by tag..."}
        className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-auto flex-1 min-w-[100px]"
      />
    </div>
  )
}
