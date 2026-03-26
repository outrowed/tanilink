import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"
import styles from "@/components/ui/separator.module.css"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        styles.root,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        className
      )}
      decorative={decorative}
      orientation={orientation}
      {...props}
    />
  )
}

export { Separator }
