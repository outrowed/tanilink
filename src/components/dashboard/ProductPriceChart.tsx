import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { formatRupiah, type PriceHistoryPoint } from "@/lib/data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import styles from "@/components/dashboard/dashboard.module.css"

interface ProductPriceChartProps {
  compact?: boolean
  description?: string
  history: PriceHistoryPoint[]
  label: string
  priceChange: number
  subtitle?: string
  title?: string
  tone: string
}

function ProductPriceChart({
  compact = false,
  description,
  history,
  label,
  priceChange,
  subtitle,
  title,
  tone,
}: ProductPriceChartProps) {
  const chartId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const chartConfig = {
    price: {
      label,
      color: tone,
    },
  } satisfies ChartConfig

  if (compact) {
    return (
      <ChartContainer className={styles.priceChartCompact} config={chartConfig}>
        <AreaChart accessibilityLayer data={history} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id={`fill-${chartId}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.45} />
              <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <Area
            dataKey="price"
            fill={`url(#fill-${chartId})`}
            fillOpacity={1}
            stroke="var(--color-price)"
            strokeWidth={2.5}
            type="linear"
          />
        </AreaChart>
      </ChartContainer>
    )
  }

  const firstMonth = history[0]?.month
  const lastMonth = history[history.length - 1]?.month
  const trendCopy = priceChange >= 0 ? `up ${Math.abs(priceChange)}%` : `down ${Math.abs(priceChange)}%`

  return (
    <Card className={styles.priceChartCard}>
      <CardHeader className={styles.priceChartHeader}>
        <CardTitle className={styles.priceChartTitle}>
          {title ?? "Price history"}
        </CardTitle>
        {description ? (
          <CardDescription className={styles.priceChartDescription}>
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={styles.priceChartContent}>
        <ChartContainer className={styles.priceChartExpanded} config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={history}
            margin={{
              left: 12,
              right: 12,
              top: 8,
            }}
          >
            <defs>
              <linearGradient id={`fill-${chartId}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              minTickGap={24}
              tickLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatValue={(value) => formatRupiah(Number(value))}
                  indicator="dot"
                />
              }
              cursor={false}
            />
            <Area
              dataKey="price"
              fill={`url(#fill-${chartId})`}
              fillOpacity={1}
              stroke="var(--color-price)"
              strokeWidth={2.5}
              type="linear"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className={styles.priceChartFooter}>
        <div className={styles.priceChartFooterText}>
          Trending {trendCopy} across the latest monthly sample.
        </div>
        <div className={styles.priceChartFooterSubtle}>
          {subtitle ?? `${firstMonth} - ${lastMonth}`}
        </div>
      </CardFooter>
    </Card>
  )
}

export default ProductPriceChart
