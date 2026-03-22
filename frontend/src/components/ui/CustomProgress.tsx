import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface CustomProgressProps {
  value: number
  className?: string
}

export function CustomProgress({ value, className }: CustomProgressProps) {
  return (
    <Progress
      value={value}
      className={cn("h-1.5 bg-muted [&>[data-slot=progress-indicator]]:bg-emerald-600", className)}
    />
  )
}
