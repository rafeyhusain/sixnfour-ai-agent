"use client"

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Media } from "./types/media"
import Image from "next/image"
  
type MediaDialogProps = {
  media: Media
  children: React.ReactNode
}

export function MediaDialog({ media, children }: MediaDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl pt-10 bg-gray-100">
        <DialogTitle className="sr-only">Media Preview</DialogTitle>
        {media.type === "image" ? (
          <Image 
            src={media.url} 
            alt="Media preview" 
            width={1600}
            height={1200}
            className="w-full max-h-[80vh] object-contain" 
          />
        ) : (
          <video 
            src={media.url} 
            controls 
            className="w-full max-h-[80vh]" 
          />
        )}
      </DialogContent>
    </Dialog>
  )
} 