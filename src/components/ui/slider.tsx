import * as React from "react"

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  min?: number
  max?: number
  step?: number
  value?: number
  onValueChange?: (value: number) => void
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        relative flex h-2 w-full items-center
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </div>
  )
)
Slider.displayName = "Slider"

interface SliderTrackProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SliderTrack = React.forwardRef<HTMLDivElement, SliderTrackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        relative h-2 w-full grow overflow-hidden rounded-full bg-secondary
        ${className || ""}
      `}
      {...props}
    >
      <SliderRange />
    </div>
  )
)
SliderTrack.displayName = "SliderTrack"

interface SliderRangeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SliderRange = React.forwardRef<HTMLDivElement, SliderRangeProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        absolute h-full bg-primary
        ${className || ""}
      `}
      {...props}
    />
  )
)
SliderRange.displayName = "SliderRange"

interface SliderThumbProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SliderThumb = React.forwardRef<HTMLButtonElement, SliderThumbProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        block h-5 w-5 rounded-full border-2 border-primary bg-background
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${className || ""}
      `}
      {...props}
    />
  )
)
SliderThumb.displayName = "SliderThumb"

export const SliderValueLabel = () => null