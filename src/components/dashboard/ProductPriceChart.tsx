import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, Line, ReferenceLine, XAxis, YAxis } from "recharts"

import {
  formatRupiah,
  priceHistoryRangeLabels,
  type PriceHistoryPoint,
  type PriceHistoryRange,
} from "@/lib/data"
import { buildPriceForecast } from "@/lib/forecast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import styles from "@/components/dashboard/dashboard.module.css"

interface ProductPriceChartProps {
  availableRanges?: Partial<Record<PriceHistoryRange, PriceHistoryPoint[]>>
  compact?: boolean
  defaultRange?: PriceHistoryRange
  description?: string
  history: PriceHistoryPoint[]
  label: string
  priceChange: number
  referencePrice?: number
  showForecast?: boolean
  showRangeControls?: boolean
  subtitle?: string
  title?: string
  tone: string
}

const rangeOrder: PriceHistoryRange[] = ["1y", "6m", "1m", "24h"]

interface PriceChartRow {
  average: number
  baseline: number | null
  label: string
  price: number | null
}

function formatCompactRupiah(value: number) {
  if (value >= 1_000_000) {
    return `Rp${(value / 1_000_000).toFixed(1)}m`
  }

  if (value >= 1_000) {
    return `Rp${(value / 1_000).toFixed(0)}k`
  }

  return formatRupiah(value)
}

function ProductPriceChart({
  availableRanges,
  compact = false,
  defaultRange = "1y",
  description,
  history,
  label,
  priceChange,
  referencePrice,
  showForecast = false,
  showRangeControls = false,
  subtitle,
  title,
  tone,
}: ProductPriceChartProps) {
  const chartId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const selectableRanges = useMemo(
    () => rangeOrder.filter((range) => availableRanges?.[range]?.length),
    [availableRanges]
  )
  const [selectedRange, setSelectedRange] = useState<PriceHistoryRange>(
    selectableRanges.includes(defaultRange) ? defaultRange : selectableRanges[0] ?? "1y"
  )

  const effectiveRange = selectableRanges.includes(selectedRange)
    ? selectedRange
    : selectableRanges.includes(defaultRange)
      ? defaultRange
      : selectableRanges[0] ?? "1y"
  const activeHistory =
    showRangeControls && availableRanges?.[effectiveRange]?.length
      ? availableRanges[effectiveRange]
      : history
  const chartConfig = {
    price: {
      label,
      color: tone,
    },
    average: {
      label: "Average line",
      color: "#57534e",
    },
    baseline: {
      label: "Baseline forecast",
      color: "#2563eb",
    },
  } satisfies ChartConfig
  const averageLine =
    referencePrice ?? Math.round(activeHistory.reduce((sum, point) => sum + point.price, 0) / activeHistory.length)
  const latestPoint = activeHistory[activeHistory.length - 1]
  const forecast = showForecast ? buildPriceForecast(activeHistory, effectiveRange, priceChange) : null
  const chartData: PriceChartRow[] = activeHistory.map((point, index) => ({
    average: averageLine,
    baseline: index === activeHistory.length - 1 ? point.price : null,
    label: point.month,
    price: point.price,
  }))

  if (forecast) {
    forecast.baseline.points.forEach((point) => {
      chartData.push({
        average: averageLine,
        baseline: point.price,
        label: point.month,
        price: null,
      })
    })
  }

  if (compact) {
    return (
      <ChartContainer className={styles.priceChartCompact} config={chartConfig}>
        <AreaChart accessibilityLayer data={chartData} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
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

  const firstMonth = activeHistory[0]?.month
  const lastMonth = latestPoint?.month
  const trendCopy = priceChange >= 0 ? `up ${Math.abs(priceChange)}%` : `down ${Math.abs(priceChange)}%`
  const activeRangeLabel = showRangeControls ? priceHistoryRangeLabels[effectiveRange] : `${firstMonth} - ${lastMonth}`

  return (
    <Card className={styles.priceChartCard}>
      <CardHeader className={styles.priceChartHeader}>
        <div className={styles.priceChartHeaderTop}>
          <div>
            <CardTitle className={styles.priceChartTitle}>
              {title ?? "Price history"}
            </CardTitle>
            {description ? (
              <CardDescription className={styles.priceChartDescription}>
                {description}
              </CardDescription>
            ) : null}
          </div>
          {showRangeControls && selectableRanges.length > 1 ? (
            <div className={styles.priceRangeControls}>
              {selectableRanges.map((range) => (
                <Button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  size="sm"
                  type="button"
                  variant={effectiveRange === range ? "default" : "outline"}
                >
                  {priceHistoryRangeLabels[range]}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        <div className={styles.priceChartLegend}>
          <span className={styles.priceChartLegendItem}>
            <span className={styles.priceChartLegendSwatch} style={{ backgroundColor: tone }} />
            Market price
          </span>
          <span className={styles.priceChartLegendItem}>
            <span className={styles.priceChartLegendLine} />
            Average line
          </span>
          {forecast ? (
            <span className={styles.priceChartLegendItem}>
              <span className={styles.priceChartLegendForecast} />
              Baseline forecast
            </span>
          ) : null}
          <span className={styles.priceChartLegendItem}>
            <span className={styles.priceChartLegendGuide} />
            Latest guide
          </span>
        </div>
      </CardHeader>
      <CardContent className={styles.priceChartContent}>
        <ChartContainer className={styles.priceChartExpanded} config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
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
            <CartesianGrid strokeDasharray="4 4" vertical />
            <Legend content={() => null} />
            <XAxis
              axisLine={false}
              dataKey="label"
              minTickGap={24}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickFormatter={formatCompactRupiah}
              tickLine={false}
              tickMargin={10}
              width={68}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke="#57534e"
              strokeDasharray="6 6"
              strokeOpacity={0.7}
              y={averageLine}
            />
            {latestPoint ? (
              <ReferenceLine
                ifOverflow="visible"
                stroke="#15803d"
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                x={latestPoint.month}
              />
            ) : null}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatValue={(value) => formatRupiah(Number(value))}
                  indicator="dot"
                />
              }
            />
            <Area
              activeDot={{ r: 5, strokeWidth: 0, fill: "var(--color-price)" }}
              dataKey="price"
              fill={`url(#fill-${chartId})`}
              fillOpacity={1}
              stroke="var(--color-price)"
              strokeWidth={2.5}
              type="monotone"
            />
            {forecast ? (
              <Line
                connectNulls
                dataKey="baseline"
                dot={false}
                isAnimationActive={false}
                stroke="var(--color-baseline)"
                strokeDasharray="7 5"
                strokeWidth={2.4}
                type="monotone"
              />
            ) : null}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className={styles.priceChartFooter}>
        <div className={styles.priceChartFooterCopy}>
          <div className={styles.priceChartFooterText}>
            Trending {trendCopy} across the latest {activeRangeLabel} window.
          </div>
          <div className={styles.priceChartFooterSubtle}>
            {subtitle ?? `${firstMonth} - ${lastMonth}`}
          </div>
        </div>
        {forecast ? (
          <div className={styles.priceForecastSummary}>
            <div className={styles.priceForecastCard}>
              <p className={styles.priceForecastLabel}>Baseline forecast</p>
              <p className={styles.priceForecastValue}>
                {formatRupiah(
                  forecast.baseline.points[forecast.baseline.points.length - 1]?.price ??
                    latestPoint?.price ??
                    0
                )}
              </p>
            </div>
            <p className={styles.priceForecastHorizon}>{forecast.horizonLabel}</p>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  )
}

export default ProductPriceChart
