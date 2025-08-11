"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Media } from "./types/media"
import { Tags } from "./tags"
import { MediaFilter } from "./media-filter"
import { MediaDialog } from "./media-dialog"
import { Trash2, Check, Grid3X3, List, Square, SquareStack, LayoutGrid } from "lucide-react"
import Image from "next/image"

type ViewMode = "list" | "small" | "medium" | "large" | "very-large"

type MediaGridProps = {
  medias: Media[]
  onDelete: (media: Media) => void
  multiSelect?: boolean
  showFilters?: boolean
  onSelectionChange?: (selectedMediaIds: string[]) => void
}

export function MediaGrid({ 
  medias, 
  onDelete, 
  multiSelect = false,
  showFilters = true,
  onSelectionChange
}: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>("medium")

  // Sort media by created date (most recent first)
  const sortedMedias = [...medias].sort((a, b) => 
    new Date(b.created).getTime() - new Date(a.created).getTime()
  )

  const filteredMedias = sortedMedias.filter((media) => {
    // Filter by type
    const typeMatch = filterType === "all" || media.type === filterType
    
    // Filter by tags
    const tagMatch = filterTags.length === 0 || 
      filterTags.some(tag => media.tags.includes(tag))
    
    return typeMatch && tagMatch
  })

  const filteredMediaIds = new Set(filteredMedias.map(media => media.id));
  console.log("filteredMedias", filteredMediaIds);

  const allFilteredSelected = filteredMedias.length > 0 && 
    filteredMedias.every(media => selectedMediaIds.has(media.id))
  const someFilteredSelected = filteredMedias.some(media => selectedMediaIds.has(media.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedMediaIds)
      filteredMedias.forEach(media => newSelected.add(media.id))
      setSelectedMediaIds(newSelected);
      console.log("selectedMedia", selectedMedia);
    } else {
      const newSelected = new Set(selectedMediaIds)
      filteredMedias.forEach(media => newSelected.delete(media.id))
      setSelectedMediaIds(newSelected)
    }
  }

  const handleSelectMedia = (mediaId: string, checked: boolean) => {
    const newSelected = new Set(selectedMediaIds)
    if (checked) {
      newSelected.add(mediaId)
    } else {
      newSelected.delete(mediaId)
    }
    setSelectedMediaIds(newSelected)
  }



  const isMediaSelected = (mediaId: string) => selectedMediaIds.has(mediaId)

  // Call onSelectionChange whenever selectedMediaIds changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedMediaIds))
    }
  }, [selectedMediaIds, onSelectionChange])

  const getMediaTooltip = (media: Media) => {
    return `ID: ${media.id}
Type: ${media.type}
Created: ${new Date(media.created).toLocaleString()}
Tags: ${media.tags.join(", ")}
URL: ${media.url}`
  }

  const getGridClasses = () => {
    switch (viewMode) {
      case "list":
        return "grid-cols-1"
      case "small":
        return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
      case "medium":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      case "large":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      case "very-large":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
    }
  }

  const getImageHeight = () => {
    switch (viewMode) {
      case "list":
        return "h-full"
      case "small":
        return "h-24"
      case "medium":
        return "h-40"
      case "large":
        return "h-48"
      case "very-large":
        return "h-64"
      default:
        return "h-40"
    }
  }

  return (
    <>
      {showFilters && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MediaFilter
                filterType={filterType}
                onFilterTypeChange={setFilterType}
                filterTags={filterTags}
                onFilterTagsChange={setFilterTags}
              />
              {(filterType !== "all" || filterTags.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterType("all")
                    setFilterTags([])
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <div className="text-sm text-gray-600">
                {filteredMedias.length} of {medias.length} media
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "small" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("small")}
              title="Small Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("medium")}
              title="Medium Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "large" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("large")}
              title="Large Grid"
            >
              <SquareStack className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "very-large" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("very-large")}
              title="Very Large Grid"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

             {multiSelect && (
         <div className="mb-4 flex items-center justify-between">
           <div className="flex items-center space-x-2">
             <Checkbox
               checked={allFilteredSelected}
               onCheckedChange={handleSelectAll}
             />
             <span className="text-sm text-gray-600">
               {selectedMediaIds.size} of {medias.length} selected
             </span>
           </div>
         </div>
       )}

      {filteredMedias.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <p className="text-lg font-medium mb-2">No matching media found</p>
            <p className="text-sm">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      ) : (
        <div className={`${showFilters ? 'h-full' : 'max-h-[200px]'} overflow-y-auto`}>
          <div className={`grid ${getGridClasses()} gap-4`}>
            {filteredMedias.map((media, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden group ${
              multiSelect && isMediaSelected(media.id) 
                ? 'ring-2 ring-blue-500 ring-opacity-50' 
                : ''
            } ${viewMode === "list" ? "flex" : ""}`}
          >
            <CardContent className={`p-2 ${viewMode === "list" ? "flex flex-col gap-3 w-full" : ""}`}>
              {multiSelect && (
                <div className="absolute top-2 left-2 z-20">
                  <Checkbox
                    checked={isMediaSelected(media.id)}
                    onCheckedChange={(checked) => handleSelectMedia(media.id, checked as boolean)}
                    className="bg-white/90 border-gray-300"
                  />
                </div>
              )}

              <MediaDialog media={media}>
                {media.type === "image" ? (
                  <Image
                    src={media.url}
                    alt="media"
                    width={800}
                    height={600}
                    className={`w-full ${getImageHeight()} object-cover rounded cursor-pointer`}
                    onClick={() => setSelectedMedia(media)}
                    title={getMediaTooltip(media)}
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className={`w-full ${getImageHeight()} object-cover rounded cursor-pointer`}
                    onClick={() => setSelectedMedia(media)}
                    title={getMediaTooltip(media)}
                  />
                )}
              </MediaDialog>

              {!multiSelect && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                  onClick={() => onDelete(media)}
                >
                  <Trash2 className="w-4 h-4 text-gray-600" />
                </Button>
              )}

              {multiSelect && isMediaSelected(media.id) && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className={`${viewMode === "list" ? "w-full" : "mt-2"}`}>
                {viewMode === "list" && (
                  <Tags tags={media.tags} />
                )}
                {viewMode !== "list" && <Tags tags={media.tags} />}
              </div>
            </CardContent>
          </Card>
        ))}
          </div>
        </div>
      )}
    </>
  )
}
