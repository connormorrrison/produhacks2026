import * as React from "react"
import { cn } from "@/lib/utils"

function CustomButton1({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 py-2",
        "text-base font-normal text-white antialiased",
        "bg-emerald-600 hover:bg-emerald-700 transition-colors",
        "disabled:cursor-not-allowed disabled:bg-zinc-800/55 disabled:text-zinc-300",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

export { CustomButton1 }
