import { cn } from "@/lib/utils"
import styles from "@/components/ui/badge.module.css"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info" | "muted"
}) {
  const variantClass = {
    default: styles.default,
    secondary: styles.secondary,
    outline: styles.outline,
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
    info: styles.info,
    muted: styles.muted,
  }[variant]

  return <span className={cn(styles.root, variantClass, className)} {...props} />
}

export { Badge }
