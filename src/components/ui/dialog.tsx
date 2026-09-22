import * as React from "react"

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, children, open, onOpenChange, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        fixed z-50 gap-4 inset-0
        ${className || ""}
      `}
      {...props}
    >
      {open && (
        <>
          <DialogOverlay className="fixed inset-0 z-40 bg-black/25" />
          <div className="fixed z-50 inset-0 flex items-center justify-center">
            <DialogContent className={`
              --ring-offset-background: var(--popover)
              --ring: var(--ring)
              --ring-offset-width: 2px
              max-h-[85vh]
              w-full max-w-lg
              overflow-y-auto
              pointer-events-auto
              bg-popover
              text-popover-foreground
              shadow-xl
              ring ring-black/20
              rounded-lg
              border
            `}>
              {children}
            </DialogContent>
          </div>
        </>
      )}
    </div>
  )
)
Dialog.displayName = "Dialog"

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, asChild = false, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50
        ${className || ""}
      `}
      aria-haspopup="dialog"
      {...props}
    >
      {children}
    </button>
  )
)
DialogTrigger.displayName = "DialogTrigger"

export const DialogPortal = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
)
DialogPortal.displayName = "DialogPortal"

export const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        fixed inset-0 z-40 bg-black/25
        ${className || ""}
      `}
      {...props}
    />
  )
)
DialogOverlay.displayName = "DialogOverlay"

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        bg-popover text-popover-foreground rounded-lg border p-6
        shadow-lg
        outline-none
        focus-visible:outline-none
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </div>
  )
)
DialogContent.displayName = "DialogContent"

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        flex flex-col space-y-2
        pb-4
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </div>
  )
)
DialogHeader.displayName = "DialogHeader"

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={`
        text-lg font-semibold leading-tight
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </h2>
  )
)
DialogTitle.displayName = "DialogTitle"

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={`
        text-sm text-muted-foreground
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </p>
  )
)
DialogDescription.displayName = "DialogDescription"

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        flex flex-col-reverse sm:flex-row sm:flex-wrap sm:gap-2
        sm:justify-end sm:items-start pt-4
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </div>
  )
)
DialogFooter.displayName = "DialogFooter"