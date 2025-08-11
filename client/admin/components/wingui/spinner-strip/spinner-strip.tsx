import { Spinner } from "@/components/ui/spinner"

interface SpinnerStripProps {
  show?: boolean
  text?: string
  size?: "small" | "medium" | "large" | null
  className?: string
}

export function SpinnerStrip({
  show = true,
  text = "Loading...",
  size = "medium",
  className = "",
}: SpinnerStripProps) {
  if (!show) return null

  return (
    <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
      <Spinner show={true} size={size} />
      <span>{text}</span>
    </div>
  )
}
