import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, CheckCircle2Icon, X } from "lucide-react"

interface AlertStripProps {
  type: "error" | "success"
  title: string
  message: string | null
  fullscreen?: boolean
}

export function AlertStrip({
  type = "success",
  title,
  message,
  fullscreen = false,
}: AlertStripProps) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  const isError = type === "error"
  const variant = isError ? "destructive" : "default"

  const bgColor = isError ? "bg-red-50" : "bg-green-50"
  const color = isError ? "text-red-500" : "text-green-500"

  return (
    <div className={fullscreen ? "fixed inset-0 z-50 p-4" : "w-full"}>
      <Alert
        variant={variant}
        className={`w-full h-full flex items-center justify-between p-6 ${bgColor}`}
      >
        <div className="flex items-start gap-4">
          {isError ? (
            <AlertCircleIcon className={`h-5 w-5 mt-1 ${color}`} />
          ) : (
            <CheckCircle2Icon className={`h-5 w-5 mt-1 ${color}`} />
          )}
          <div>
            <AlertTitle><span className={`${color}`}>{title}</span></AlertTitle>
            <AlertDescription><span className={`${color}`}>{message}</span></AlertDescription>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </Alert>
    </div>
  )
}
