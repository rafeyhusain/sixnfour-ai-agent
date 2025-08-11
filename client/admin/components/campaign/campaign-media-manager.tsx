"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MediaGrid } from "@/components/wingui/media-gallery/media-grid"
import { FileUpload } from "@/components/wingui/media-gallery/file-upload"
import { Media } from "@/components/wingui/media-gallery/types/media"
import { Plus, Upload, FolderOpen } from "lucide-react"

interface CampaignMediaManagerProps {
  selectedMediaIds: string[]
  onMediaChange: (mediaIds: string[]) => void
  allMedia: Media[]
  onMediaUpload?: (newMedia: Media[]) => void
  uploadUrl?: string
  showFilters?: boolean
}

export function CampaignMediaManager({
  selectedMediaIds,
  onMediaChange,
  allMedia,
  onMediaUpload,
  uploadUrl = "/api/media/upload",
  showFilters = true
}: CampaignMediaManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([])
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>([])
  const [gridSelectedMediaIds, setGridSelectedMediaIds] = useState<string[]>([])

  // Initialize selected media from IDs
  useEffect(() => {
    const media = allMedia.filter(m => selectedMediaIds.includes(m.id))
    setSelectedMedia(media)
  }, [selectedMediaIds, allMedia])

  // const handleMediaSelection = (medias: Media[]) => {
  //   setSelectedMedia(medias)
  // }

  const handleMediaUpload = (newMedia: Media[]) => {
    setUploadedMedia(prev => [...prev, ...newMedia])
    if (onMediaUpload) {
      onMediaUpload(newMedia)
    }
  }

  const handleSelectMedia = () => {
    // Get current media IDs from props to append to existing
    const currentMediaIds = selectedMediaIds || []
    
    // Get selected media IDs from MediaGrid and uploaded media
    const gridSelectedIds = gridSelectedMediaIds || []
    const uploadedIds = uploadedMedia.map(m => m.id)
    
    // Combine all new media IDs (from grid selection and uploads)
    const allNewMediaIds = [...gridSelectedIds, ...uploadedIds]
    const newMediaIds = allNewMediaIds.filter(id => !currentMediaIds.includes(id))
    
    // Append new media IDs to existing ones
    const finalMediaIds = [...currentMediaIds, ...newMediaIds]
    
    onMediaChange(finalMediaIds)
    setIsDialogOpen(false)
    setUploadedMedia([]) // Clear uploaded media after saving
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setUploadedMedia([]) // Clear uploaded media on cancel
    // Reset selected media to original state
    const media = allMedia.filter(m => selectedMediaIds.includes(m.id))
    setSelectedMedia(media)
  }

  // const handleMultiSelectDone = (medias: Media[]) => {
  //   // Append newly selected media to existing selected media
  //   setSelectedMedia(prev => {
  //     const existingIds = new Set(prev.map(m => m.id))
  //     const newMedia = medias.filter(m => !existingIds.has(m.id))
  //     return [...prev, ...newMedia]
  //   })
  //   setIsDialogOpen(false)
  // }

  // const handleMultiSelectCancel = () => {
  //   const media = allMedia.filter(m => selectedMediaIds.includes(m.id))
  //   setSelectedMedia(media)
  //   setIsDialogOpen(false)
  // }

  const handleDeleteMedia = (media: Media) => {
    setSelectedMedia(prev => prev.filter(m => m.id !== media.id))
  }

  const handleDeleteUploadedMedia = (media: Media) => {
    setUploadedMedia(prev => prev.filter(m => m.id !== media.id))
  }

  // Combine all available media (existing + uploaded)
  // const availableMedia = [...allMedia, ...uploadedMedia]

  // Get currently selected media (both existing and newly uploaded)
  const currentSelectedMedia = [...selectedMedia, ...uploadedMedia]

  return (
    <div className="space-y-4">
      {/* Current Media Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Campaign Media</h3>
          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Manage Media
          </Button>
        </div>

        {currentSelectedMedia.length > 0 ? (
          <div className="border rounded-lg p-4">
            <MediaGrid
              medias={currentSelectedMedia}
              onDelete={handleDeleteMedia}
              multiSelect={false}
              showFilters={showFilters}
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">No media selected for this campaign</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
            >
              Add Media
            </Button>
          </div>
        )}
      </div>

      {/* Media Management Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Manage Campaign Media</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full">
            <Tabs defaultValue="select" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="select" className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Select Existing
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="select" className="flex-1 overflow-hidden">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Select from {allMedia.length} available media items
                    </p>
                    <div className="text-sm text-gray-600">
                      {selectedMedia.length} selected
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                                         <MediaGrid
                       medias={allMedia}
                       onDelete={() => { }} // Disable delete in selection mode
                       multiSelect={true}
                       showFilters={showFilters}
                       onSelectionChange={setGridSelectedMediaIds}
                     />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="flex-1 overflow-hidden">
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Upload new media files
                    </p>
                    <div className="text-sm text-gray-600">
                      {uploadedMedia.length} uploaded
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <FileUpload
                      uploadUrl={uploadUrl}
                      maxFiles={10}
                      maxFileSizeMB={50}
                      onUploadSuccess={handleMediaUpload}
                    />

                    {uploadedMedia.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-3">Uploaded Media</h4>
                        <MediaGrid
                          medias={uploadedMedia}
                          onDelete={handleDeleteUploadedMedia}
                          multiSelect={false}
                          showFilters={showFilters}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSelectMedia}>
              Select Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 