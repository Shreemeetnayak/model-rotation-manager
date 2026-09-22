import * as React from "react"

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, checked = false, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      className={`
        h-4 w-4 shrink-0
        rounded border-gray-300 bg-[var(--checkbox-bg,background)]
        checked:bg-primary checked:border-primary
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${className || ""}
      `}
      {...props}
    />
  )
)
Checkbox.displayName = "Checkbox"