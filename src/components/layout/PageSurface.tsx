import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

import styles from "@/components/layout/PageSurface.module.css"

type PageSurfaceTone = "default" | "cool"
type PageSurfaceWidth = "default" | "search"
type SectionTag = "aside" | "div" | "main" | "section"

interface PageSurfaceProps {
  children: ReactNode
  className?: string
  innerClassName?: string
  tone?: PageSurfaceTone
  width?: PageSurfaceWidth
}

interface SurfaceSectionProps extends HTMLAttributes<HTMLElement> {
  as?: SectionTag
}

function PageSurface({
  children,
  className,
  innerClassName,
  tone = "default",
  width = "default",
}: PageSurfaceProps) {
  return (
    <div
      className={cn(
        styles.page,
        tone === "cool" && styles.toneCool,
        width === "search" && styles.widthSearch,
        className
      )}
    >
      <div className={cn(styles.inner, innerClassName)}>{children}</div>
    </div>
  )
}

function PageSection({ as: Comp = "main", className, ...props }: SurfaceSectionProps) {
  return <Comp className={cn(styles.section, className)} {...props} />
}

function StickySidebar({ as: Comp = "aside", className, ...props }: SurfaceSectionProps) {
  return <Comp className={cn(styles.stickySidebar, className)} {...props} />
}

export { PageSection, StickySidebar }
export default PageSurface
