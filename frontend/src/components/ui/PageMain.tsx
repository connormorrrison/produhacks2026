import { cn } from "@/lib/utils"

export function PageMain({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main className={cn("mx-auto max-w-7xl px-6 pt-24 pb-6 space-y-10", className)}>
      {children}
    </main>
  )
}
