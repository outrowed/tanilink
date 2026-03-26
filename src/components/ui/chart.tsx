import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"
import styles from "@/components/ui/chart.module.css"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: {
      light: string
      dark: string
    }
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  children,
  className,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const style = React.useMemo(() => {
    return Object.entries(config).reduce((acc, [key, value]) => {
      const chartColor = value.color ?? value.theme?.light

      if (chartColor) {
        acc[`--color-${key}`] = chartColor
      }

      return acc
    }, {} as Record<string, string>) as React.CSSProperties
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(styles.container, className)}
        style={style}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    color?: string
    dataKey?: string | number
    name?: string
    value?: number | string
  }>
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "dot" | "line"
  formatValue?: (value: number | string) => React.ReactNode
}

function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
  formatValue,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={styles.tooltip}>
      {!hideLabel ? (
        <div className={styles.tooltipLabel}>
          {label}
        </div>
      ) : null}
      <div className={styles.tooltipItems}>
        {payload.map((item) => {
          const dataKey = String(item.dataKey ?? item.name ?? "value")
          const itemConfig = config[dataKey]

          return (
            <div key={dataKey} className={styles.tooltipItem}>
              <div className={styles.tooltipItemLeft}>
                {!hideIndicator ? (
                  indicator === "dot" ? (
                    <span
                      className={styles.tooltipDot}
                      style={{ backgroundColor: item.color }}
                    />
                  ) : (
                    <span
                      className={styles.tooltipLine}
                      style={{ backgroundColor: item.color }}
                    />
                  )
                ) : null}
                <span className={styles.tooltipItemLabel}>
                  {itemConfig?.label ?? item.name ?? dataKey}
                </span>
              </div>
              <span className={styles.tooltipValue}>
                {item.value !== undefined
                  ? formatValue
                    ? formatValue(item.value)
                    : item.value
                  : null}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
