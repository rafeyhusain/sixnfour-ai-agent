import { Badge } from "@/components/ui/badge"

export function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <Badge key={i} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  )
}
