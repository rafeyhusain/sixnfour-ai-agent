"use client"

import { useEffect, useState } from "react"
import { Media } from "./types/media"
import { FileUpload } from "./file-upload"
import { MediaGrid } from "./media-grid"
import { DashboardService } from "@/sdk/services/dashboard-service"

type MediaGalleryProps = {
    maxFiles?: number
    maxFileSizeMB?: number
    allowedMimeTypes?: string[]
}

export function MediaGallery({
    maxFiles = 5,
    maxFileSizeMB = 5,
    allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "video/mp4"],
}: MediaGalleryProps) {
    const [medias, setMedias] = useState<Media[]>([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        loadMedia()
    }, [])

    const loadMedia = async () => {
        try {
            setLoading(true)
            const mediaList = await DashboardService.getMedia()
            setMedias(mediaList)
        } catch (err) {
            console.error("Failed to load media", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUploadSuccess = async (uploaded: Media[]) => {
        setMedias((prev) => [...prev, ...uploaded])
    }

    const handleDelete = async (media: Media) => {
        try {
            await DashboardService.deleteMedia(media.id)
            setMedias((prev) => prev.filter((m) => m.id !== media.id))
        } catch (err) {
            console.error("Delete failed", err)
        }
    }

    return (
        <div className="space-y-4">
            {loading && <div>Loading media...</div>}
            <FileUpload
                maxFiles={maxFiles}
                maxFileSizeMB={maxFileSizeMB}
                allowedMimeTypes={allowedMimeTypes}
                onUploadSuccess={handleUploadSuccess}
            />
            <MediaGrid
                medias={medias}
                onDelete={handleDelete}
                multiSelect={true}
            />
        </div>
    )
}
