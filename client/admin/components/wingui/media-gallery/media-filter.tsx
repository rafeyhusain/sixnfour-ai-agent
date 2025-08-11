"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Video as VideoIcon } from "lucide-react"

type MediaFilterProps = {
  filterType: "all" | "image" | "video"
  onFilterTypeChange: (type: "all" | "image" | "video") => void
  filterTags: string[]
  onFilterTagsChange: (tags: string[]) => void
}

export function MediaFilter({
  filterType,
  onFilterTypeChange,
  filterTags,
  onFilterTagsChange,
}: MediaFilterProps) {
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.includes(",")) {
      const newTag = value.replace(",", "").trim()
      if (newTag && !filterTags.includes(newTag)) {
        onFilterTagsChange([...filterTags, newTag])
        e.target.value = ""
      }
    }
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = e.currentTarget.value.trim()
      if (value && !filterTags.includes(value)) {
        onFilterTagsChange([...filterTags, value])
        e.currentTarget.value = ""
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    onFilterTagsChange(filterTags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterTypeChange("all")}
        >
          All
        </Button>
        <Button
          variant={filterType === "image" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterTypeChange("image")}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Images
        </Button>
        <Button
          variant={filterType === "video" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterTypeChange("video")}
        >
          <VideoIcon className="w-4 h-4 mr-2" />
          Videos
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">Tags:</span>
        <div className="flex items-center gap-2 border rounded-md px-3 py-2 min-h-[32px] bg-background">
          {filterTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
          <Input
            placeholder="Filter by tag..."
            className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-auto flex-1 min-w-[120px] h-6 text-sm"
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
          />
        </div>
      </div>
    </div>
  )
} 