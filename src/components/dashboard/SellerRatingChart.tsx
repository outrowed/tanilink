import { useMemo, useState } from "react"
import { Bar, ComposedChart, CartesianGrid, Line, ReferenceLine, XAxis, YAxis } from "recharts"

import { priceHistoryRangeLabels, type PriceHistoryRange } from "@/lib/data"
import { summarizeRatingHistory, type RatingHistoryPoint } from "@/lib/seller"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import styles from "@/components/dashboard/dashboard.module.css"

interface SellerRatingChartProps {
  availableRanges?: Partial<Record<PriceHistoryRange, RatingHistoryPoint[]>>
  defaultRange?: PriceHistoryRange
  description?: string
  history: RatingHistoryPoint[]
  label: string
  showRangeControls?: boolean
  subtitle?: string
  title?: string
  tone: string
}

const rangeOrder: PriceHistoryRange[] = ["1y", "6m", "1m", "1w", "24h"]

interface RatingTooltipProps {
  active?: boolean
  label?: string
  payload?: Array<{
    dataKey?: string | number
    payload?: RatingHistoryPoint
    value?: number | string
  }>
}

function RatingTooltip({ active, label, payload }: RatingTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const dataPoint = payload[0]?.payload
  const rating = Number(dataPoint?.rating ?? payload.find((item) => item.dataKey === "rating")?.value ?? 0)
  const reviewCount = Number(
    dataPoint?.reviewCount ?? payload.find((item) => item.dataKey === "reviewCount")?.value ?? 0
  )

  return (
    <div className={styles.salesTooltip}>
      <div className={styles.salesTooltipLabel}>{label}</div>
      <div className={styles.salesTooltipGrid}>
        <div className={styles.salesTooltipItem}>
          <span className={styles.salesTooltipItemLabel}>Average rating</span>
          <span className={styles.salesTooltipItemValue}>{rating.toFixed(1)} / 5</span>
        </div>
        <div className={styles.salesTooltipItem}>
          <span className={styles.salesTooltipItemLabel}>Reviews</span>
          <span className={styles.salesTooltipItemValue}>{reviewCount}</span>
        </div>
      </div>
    </div>
  )
}

function SellerRatingChart({
  availableRanges,
  defaultRange = "6m",
  description,
  history,
  label,
  showRangeControls = true,
  subtitle,
  title = "Rating analytics",
  tone,
}: SellerRatingChartProps) {
  const selectableRanges = useMemo(
    () => rangeOrder.filter((range) => availableRanges?.[range]?.length),
    [availableRanges]
  )
  const [selectedRange, setSelectedRange] = useState<PriceHistoryRange>(
    selectableRanges.includes(defaultRange) ? defaultRange : selectableRanges[0] ?? "6m"
  )

  const effectiveRange = selectableRanges.includes(selectedRange)
    ? selectedRange
    : selectableRanges.includes(defaultRange)
      ? defaultRange
      : selectableRanges[0] ?? "6m"
  const activeHistory =
    showRangeControls && availableRanges?.[effectiveRange]?.length
      ? availableRanges[effectiveRange]
      : history
  const summary = summarizeRatingHistory(activeHistory)
  const firstPeriod = activeHistory[0]?.period
  const lastPeriod = activeHistory[activeHistory.length - 1]?.period
  const chartConfig = {
    rating: {
      label: "Average rating",
      color: tone,
    },
    reviewCount: {
      label: "Review count",
      color: "#1c1917",
    },
  } satisfies ChartConfig

  return (
    <Card className={styles.priceChartCard}>
      <CardHeader className={styles.priceChartHeader}>
        <div className={styles.priceChartHeaderTop}>
          <div>
            <CardTitle className={styles.priceChartTitle}>{title}</CardTitle>
            {description ? (
              <CardDescription className={styles.priceChartDescription}>{description}</CardDescription>
            ) : null}
          </div>
          {showRangeControls && selectableRanges.length > 1 ? (
            <label className={styles.priceRangeSelectWrap}>
              <span className={styles.priceRangeSelectLabel}>Range</span>
              <select
                className={styles.priceRangeSelect}
                onChange={(event) => setSelectedRange(event.target.value as PriceHistoryRange)}
                value={effectiveRange}
              >
                {selectableRanges.map((range) => (
                  <option key={range} value={range}>
                    {priceHistoryRangeLabels[range]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className={styles.priceChartLegend}>
          <span className={styles.priceChartLegendItem}>
            <span className={styles.priceChartLegendSwatch} style={{ backgroundColor: tone }} />
            Average rating
          </span>
          <span className={styles.priceChartLegendItem}>
            <span className={styles.salesChartLegendBar} />
            Review count
          </span>
          <span className={styles.priceChartLegendItem}>
            <span className={styles.priceChartLegendLine} />
            Average line
          </span>
        </div>
      </CardHeader>
      <CardContent className={styles.priceChartContent}>
        <ChartContainer className={styles.priceChartExpanded} config={chartConfig}>
          <ComposedChart
            accessibilityLayer
            data={activeHistory}
            margin={{
              left: 12,
              right: 12,
              top: 8,
            }}
          >
            <CartesianGrid strokeDasharray="4 4" vertical />
            <XAxis axisLine={false} dataKey="period" minTickGap={20} tickLine={false} tickMargin={8} />
            <YAxis
              axisLine={false}
              domain={[1, 5]}
              tickFormatter={(value) => `${value.toFixed(1)}`}
              tickLine={false}
              tickMargin={10}
              width={52}
              yAxisId="rating"
            />
            <YAxis
              axisLine={false}
              orientation="right"
              tickLine={false}
              tickMargin={10}
              width={52}
              yAxisId="reviews"
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke="#57534e"
              strokeDasharray="6 6"
              strokeOpacity={0.72}
              y={summary.averageRating}
              yAxisId="rating"
            />
            <ChartTooltip content={<RatingTooltip />} cursor={{ fill: "rgba(28, 25, 23, 0.05)" }} />
            <Bar
              barSize={18}
              dataKey="reviewCount"
              fill="var(--color-reviewCount)"
              fillOpacity={0.18}
              radius={[6, 6, 0, 0]}
              yAxisId="reviews"
            />
            <Line
              activeDot={{ r: 5, strokeWidth: 0, fill: "var(--color-rating)" }}
              dataKey="rating"
              dot={false}
              stroke="var(--color-rating)"
              strokeWidth={2.6}
              type="monotone"
              yAxisId="rating"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className={styles.salesChartFooter}>
        <div className={styles.priceChartFooterCopy}>
          <div className={styles.priceChartFooterText}>
            {label} rating trend across the latest {priceHistoryRangeLabels[effectiveRange]} window.
          </div>
          <div className={styles.priceChartFooterSubtle}>{subtitle ?? `${firstPeriod} - ${lastPeriod}`}</div>
        </div>
        <div className={styles.salesChartMetrics}>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Latest rating</p>
            <p className={styles.salesChartMetricValue}>{summary.latestRating.toFixed(1)} / 5</p>
          </div>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Average rating</p>
            <p className={styles.salesChartMetricValue}>{summary.averageRating.toFixed(1)} / 5</p>
          </div>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Total reviews</p>
            <p className={styles.salesChartMetricValue}>{summary.totalReviews}</p>
          </div>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Strongest period</p>
            <p className={styles.salesChartMetricValue}>
              {summary.strongestPeriod}
              <br />
              <span className={styles.priceChartFooterSubtle}>{summary.strongestPeriodRating.toFixed(1)} / 5</span>
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default SellerRatingChart
