"use client"

import { useState, forwardRef, useImperativeHandle } from "react"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Media } from "./types/media"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone'
import { X, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { DashboardService } from "@/sdk/services/dashboard-service"
import Image from "next/image"

type FileUploadProps = {
  maxFiles?: number
  maxFileSizeMB?: number
  allowedMimeTypes?: string[]
  onUploadSuccess: (uploaded: Media[]) => void
  onUploadComplete?: (uploaded: Media[], failed: number) => void
}

type FileUploadState = {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  media?: Media
}

export const FileUpload = forwardRef<{ getUploadState: () => any }, FileUploadProps>(({
  maxFiles = 5,
  maxFileSizeMB = 10,
  allowedMimeTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime"
  ],
  onUploadSuccess,
  onUploadComplete,
}, ref) => {
  const [files, setFiles] = useState<File[] | undefined>()
  const [filePreviews, setFilePreviews] = useState<string[]>([])
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([])

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getUploadState
  }))

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          resolve(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const updateFileProgress = (fileIndex: number, progress: number, status: FileUploadState['status'], error?: string, media?: Media) => {
    setUploadStates(prev => prev.map((state, index) => 
      index === fileIndex 
        ? { ...state, progress, status, error, media }
        : state
    ))
  }

  const uploadFile = async (file: File, fileIndex: number): Promise<Media | null> => {
    let progressInterval: NodeJS.Timeout | null = null
    
    try {
      // Update status to uploading
      updateFileProgress(fileIndex, 0, 'uploading')

      // Simulate progress updates since we can't track actual upload progress with the service
      let currentProgress = 0
      progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 5, 85) // Slower progress, max 85%
        updateFileProgress(fileIndex, currentProgress, 'uploading')
      }, 300)

      // Upload using dashboard service
      const media = await DashboardService.uploadMedia(file)
      
      // Clear interval and complete the progress
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      
      // Complete the progress to 100%
      updateFileProgress(fileIndex, 100, 'completed', undefined, media)
      return media

    } catch (error) {
      // Clear interval on error
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      updateFileProgress(fileIndex, 0, 'error', errorMessage)
      toast(`Upload failed for ${file.name}: ${errorMessage}`)
      return null
    }
  }

  const handleDrop = async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      const sizeMB = file.size / (1024 * 1024)
      return allowedMimeTypes.includes(file.type) && sizeMB <= maxFileSizeMB
    })

    if (validFiles.length === 0) {
      toast("No valid files to upload.")
      return
    }

    // Limit files to maxFiles
    const filesToProcess = validFiles.slice(0, maxFiles)
    setFiles(filesToProcess)

    // Create previews for all files
    const previews = await Promise.all(
      filesToProcess.map(file => createFilePreview(file))
    )
    setFilePreviews(previews)

    // Initialize upload states
    const initialStates: FileUploadState[] = filesToProcess.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    setUploadStates(initialStates)

    // Upload all files
    const uploadPromises = filesToProcess.map((file, index) => 
      uploadFile(file, index)
    )

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter((result): result is Media => result !== null)
    const failedCount = results.filter(result => result === null).length

    // Only call onUploadSuccess if there are successful uploads
    if (successfulUploads.length > 0) {
      onUploadSuccess(successfulUploads)
    }

    // Call onUploadComplete to notify parent of final state
    onUploadComplete?.(successfulUploads, failedCount)
  }

  const retryUpload = async (fileIndex: number) => {
    const uploadState = uploadStates[fileIndex]
    if (!uploadState) return

    const media = await uploadFile(uploadState.file, fileIndex)
    if (media) {
      // Update the success callback with the new media
      const successfulUploads = uploadStates
        .filter(state => state.status === 'completed' && state.media)
        .map(state => state.media!)
      
      onUploadSuccess(successfulUploads)
      
      // Notify parent of updated state
      const failedCount = uploadStates.filter(state => state.status === 'error').length
      onUploadComplete?.(successfulUploads, failedCount)
    }
  }

  const removeFile = (fileIndex: number) => {
    setFiles(prev => prev?.filter((_, index) => index !== fileIndex))
    setFilePreviews(prev => prev.filter((_, index) => index !== fileIndex))
    setUploadStates(prev => prev.filter((_, index) => index !== fileIndex))
  }

  const clearAll = () => {
    setFiles(undefined)
    setFilePreviews([])
    setUploadStates([])
  }

  // Method to get current upload state for parent components
  const getUploadState = () => {
    return {
      files: files || [],
      uploadStates,
      hasCompleted: uploadStates.some(state => state.status === 'completed'),
      hasErrors: uploadStates.some(state => state.status === 'error'),
      hasPending: uploadStates.some(state => state.status === 'pending' || state.status === 'uploading'),
      successfulUploads: uploadStates
        .filter(state => state.status === 'completed' && state.media)
        .map(state => state.media!)
    }
  }

  const isImage = (mimeType: string) => mimeType.startsWith('image/')
  const isVideo = (mimeType: string) => mimeType.startsWith('video/')

  const getStatusIcon = (status: FileUploadState['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      default: return null
    }
  }

  const getStatusText = (status: FileUploadState['status']) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'error': return 'Error'
      case 'uploading': return 'Uploading...'
      default: return 'Pending'
    }
  }

  const hasCompletedUploads = uploadStates.some(state => state.status === 'completed')
  const hasErrors = uploadStates.some(state => state.status === 'error')

  return (
    <div className="space-y-4">
      <Dropzone
        accept={Object.fromEntries(
          allowedMimeTypes.map((mimeType) => [mimeType, []])
        )}
        maxSize={maxFileSizeMB * 1024 * 1024}
        maxFiles={maxFiles}
        onDrop={handleDrop}
        onError={(error) => toast(error.message)}
        src={files}
        disabled={uploadStates.some(state => state.status === 'uploading')}
      >
        <DropzoneEmptyState />
        <DropzoneContent>
          {files && files.length > 0 && (
            <div className="space-y-4 w-full">
                             {/* Action buttons */}
               {(hasCompletedUploads || hasErrors) && (
                 <div className="flex gap-2">
                   {hasErrors && (
                     <div
                       role="button"
                       tabIndex={0}
                       className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                       onClick={() => {
                         uploadStates.forEach((state, index) => {
                           if (state.status === 'error') {
                             retryUpload(index)
                           }
                         })
                       }}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                           e.preventDefault()
                           uploadStates.forEach((state, index) => {
                             if (state.status === 'error') {
                               retryUpload(index)
                             }
                           })
                         }
                       }}
                       aria-label="Retry failed uploads"
                     >
                       <RefreshCw className="w-4 h-4 mr-2" />
                       Retry Failed
                     </div>
                   )}
                   <div
                     role="button"
                     tabIndex={0}
                     className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                     onClick={clearAll}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault()
                         clearAll()
                       }
                     }}
                     aria-label="Clear all files"
                   >
                     <X className="w-4 h-4 mr-2" />
                     Clear All
                   </div>
                 </div>
               )}

              {/* File grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => {
                  const uploadState = uploadStates[index]
                  return (
                    <div key={index} className="relative border rounded-lg overflow-hidden bg-background">
                      {/* File Preview */}
                      <div className="relative h-32 w-full">
                        {isImage(file.type) && filePreviews[index] && (
                          <Image
                            alt={`Preview of ${file.name}`}
                            className="h-full w-full object-cover"
                            src={filePreviews[index]}
                            width={400}
                            height={256}
                          />
                        )}
                        {isVideo(file.type) && filePreviews[index] && (
                          <video
                            className="h-full w-full object-cover"
                            src={filePreviews[index]}
                            muted
                            onLoadedMetadata={(e) => {
                              const video = e.target as HTMLVideoElement
                              video.play().catch(() => {
                                // Ignore autoplay errors
                              })
                            }}
                          />
                        )}
                        
                        {/* Status indicator */}
                        {uploadState && (
                          <div className="absolute top-2 right-2">
                            {getStatusIcon(uploadState.status)}
                          </div>
                        )}

                        {/* Remove button */}
                        <div
                          role="button"
                          tabIndex={0}
                          className="absolute top-2 left-2 w-6 h-6 p-0 bg-white/80 hover:bg-white/90 text-gray-500 hover:text-gray-700 rounded-sm flex items-center justify-center cursor-pointer transition-colors"
                          onClick={() => removeFile(index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              removeFile(index)
                            }
                          }}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="w-3 h-3" />
                        </div>
                      </div>

                      {/* File Info and Progress */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate flex-1">
                            {file.name}
                          </p>
                          {uploadState && (
                            <span className="text-xs text-muted-foreground">
                              {uploadState.progress}%
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {uploadState && (
                          <div className="space-y-1">
                            <Progress 
                              value={uploadState.progress} 
                              className="h-2"
                            />
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {getStatusText(uploadState.status)}
                              </span>
                              <span className="text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                        )}

                                                 {/* Error Message and Retry Button */}
                         {uploadState?.status === 'error' && (
                           <div className="space-y-2">
                             <p className="text-xs text-red-500 truncate">
                               {uploadState.error}
                             </p>
                             <div
                               role="button"
                               tabIndex={0}
                               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full"
                               onClick={() => retryUpload(index)}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter' || e.key === ' ') {
                                   e.preventDefault()
                                   retryUpload(index)
                                 }
                               }}
                               aria-label={`Retry upload for ${file.name}`}
                             >
                               <RefreshCw className="w-3 h-3 mr-1" />
                               Retry
                             </div>
                           </div>
                         )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DropzoneContent>
      </Dropzone>
    </div>
  )
})

FileUpload.displayName = 'FileUpload'