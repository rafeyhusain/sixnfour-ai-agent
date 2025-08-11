import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  Timer,
} from "lucide-react"

export const labels = [
  {
    value: "critical",
    label: "Critical",
  },
  {
    value: "important",
    label: "Important",
  },
  {
    value: "normal",
    label: "Normal",
  },
]

export const filters = {
  priority: {
    columnId: "priority",
    title: "Priority",
    options: [
      {
        label: "Low",
        value: "low",
        icon: ArrowDown,
      },
      {
        label: "Medium",
        value: "medium",
        icon: ArrowRight,
      },
      {
        label: "High",
        value: "high",
        icon: ArrowUp,
      },
    ]
  },
  status:
  {
    columnId: "status",
    title: "Status",
    options: [
      {
        value: "scheduled",
        label: "Scheduled",
        icon: Timer,
      },
      {
        value: "generated",
        label: "Generated",
        icon: Circle,
      },
      {
        value: "published",
        label: "Published",
        icon: CheckCircle,
      },
      {
        value: "canceled",
        label: "Canceled",
        icon: CircleOff,
      },
    ]
  }
}

export enum Table {
  Campaigns = "campaigns",
  CampaignTypes = "campaign-types",
  CampaignTasks = "campaign-tasks",
  Settings = "settings",
  Schedules = "schedules",
  ExampleTable = "example-table",
  Prompts = "prompts"
}