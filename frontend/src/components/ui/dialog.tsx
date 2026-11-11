import * as React from "react"
import { cn } from "../../lib/utils"
import { FiX } from "react-icons/fi"

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  className,
  bodyClassName,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200",
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close dialog"
        >
          <FiX className="w-5 h-5" />
        </button>

        {title && (
          <div className="mb-4 shrink-0 pr-12">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>
        )}

        <div className={cn(bodyClassName)}>{children}</div>
      </div>
    </div>
  )
}
