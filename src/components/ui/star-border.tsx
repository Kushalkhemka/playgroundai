import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "#3b82f6"

  return (
    <Component 
      className={cn(
        "relative inline-block overflow-hidden rounded-lg p-[2px] animate-border-spin",
        className
      )}
      style={{
        background: `conic-gradient(from var(--angle, 0deg), transparent 20%, ${defaultColor} 50%, transparent 80%)`,
        '--speed': speed,
      } as React.CSSProperties}
      {...props}
    >
      <div className="relative z-10 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors rounded-lg flex items-center justify-center h-full w-full">
        {children}
      </div>
    </Component>
  )
}