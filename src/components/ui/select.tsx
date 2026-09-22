import * as React from "react"

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className="relative" {...props}>
      {children}
    </div>
  )
)
Select.displayName = "Select"

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        flex h-10 w-full items-center justify-between rounded-md border border-input
        bg-background px-3 py-2 text-sm ring-offset-background
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        [&>span]:line-clamp-1
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </button>
  )
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ children }: { children: React.ReactNode }) => (
  <span className="text-sm">{children}</span>
)

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        relative z-50 max-h-96 min-w-[8rem] overflow-hidden
        rounded-md border bg-popover text-popover-foreground shadow-md
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </div>
  )
)
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        relative flex w-full cursor-default select-none items-center rounded-sm
        py-1.5 pl-8 pr-2 text-sm outline-none
        focus:bg-accent focus:text-accent-foreground
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"