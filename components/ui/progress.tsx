"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  indicatorColor,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props & { indicatorColor?: string }) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className="w-full"
      {...props}
    >
      {children}
      <ProgressTrack className={className}>
        <ProgressIndicator 
          className={indicatorColor} 
          style={{ width: `${value || 0}%` }} 
        />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-3 w-full items-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300/50 dark:border-zinc-700/50",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full bg-primary rounded-full transition-all duration-500 ease-out", className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
