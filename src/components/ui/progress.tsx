
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { valueBuffer?: number, isLive?: boolean }
>(({ className, value, valueBuffer, isLive, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="absolute h-full w-full flex-1 bg-muted transition-all"
      style={{ transform: `translateX(-${100 - (valueBuffer || 0)}%)` }}
    />
     <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-primary transition-all")}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
    {isLive && (
      <div 
        className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary ring-2 ring-background live-pulse-beam"
        style={{ left: `calc(${value || 0}% - 8px)`}}
      />
    )}
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
