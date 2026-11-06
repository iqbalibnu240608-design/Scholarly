import * as React from "react"
import { cn } from "../../lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
    const [currentValue, setCurrentValue] = React.useState<string>(value || defaultValue || "")

    React.useEffect(() => {
      if (value !== undefined) {
        setCurrentValue(value)
      }
    }, [value])

    const handleValueChange = (val: string) => {
      if (value === undefined) {
        setCurrentValue(val)
      }
      onValueChange?.(val)
    }

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100/90 p-1 text-slate-500 border border-slate-200/60",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")

    const isActive = context.value === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => context.onValueChange(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-white text-blue-600 shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")

    if (context.value !== value) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn("mt-4 ring-offset-white focus-visible:outline-none", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"
