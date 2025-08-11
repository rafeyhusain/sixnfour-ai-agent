"use client"
import { MediaGallery } from "@/components/wingui/media-gallery/media-gallery"

export default function MediaPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Media Library</h1>
      <MediaGallery
        maxFiles={10}
        maxFileSizeMB={10}
        allowedMimeTypes={["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"]}
      />
    </div>
  )
}