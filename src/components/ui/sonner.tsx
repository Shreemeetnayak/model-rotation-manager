import * as React from "react"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps
>(({ className, id, title, description, action, ...props }, ref) => (
  <div
    ref={ref}
    id={id}
    className={`
      flex w-full items-center gap-2 p-4 rounded-lg border bg-background
      shadow-lg
      ${className || ""}
    `}
    {...props}
  >
    <div className="grid gap-1">
      {title && <div className="font-semibold">{title}</div>}
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
    </div>
    {action && <div className="ml-auto">{action}</div>}
  </div>
))
Toast.displayName = "Toast"

export const Toaster = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed bottom-0 right-0 flex flex-col gap-2 p-4 z-50">
    {children}
  </div>
)
Toaster.displayName = "Toaster"