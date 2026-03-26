import { useMemo, useState } from "react"
import { Bar, ComposedChart, CartesianGrid, Line, ReferenceLine, XAxis, YAxis } from "recharts"

import {
  formatRupiah,
  priceHistoryRangeLabels,
  summarizeSalesHistory,
  type PriceHistoryRange,
  type SalesHistoryPoint,
} from "@/lib/data"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import styles from "@/components/dashboard/dashboard.module.css"

interface ProductSalesChartProps {
  availableRanges?: Partial<Record<PriceHistoryRange, SalesHistoryPoint[]>>
  defaultRange?: PriceHistoryRange
  description?: string
  history: SalesHistoryPoint[]
  label: string
  showRangeControls?: boolean
  subtitle?: string
  title?: string
  tone: string
}

const rangeOrder: PriceHistoryRange[] = ["1y", "6m", "1m", "1w", "24h"]

interface SalesTooltipProps {
  active?: boolean
  label?: string
  payload?: Array<{
    dataKey?: string | number
    payload?: SalesHistoryPoint
    value?: number | string
  }>
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

function formatCompactCount(value: number) {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`
  }

  return `${value}`
}

function SalesHistoryTooltip({ active, label, payload }: SalesTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const dataPoint = payload[0]?.payload
  const salePrice = Number(dataPoint?.salePrice ?? payload.find((item) => item.dataKey === "salePrice")?.value ?? 0)
  const unitsSold = Number(dataPoint?.unitsSold ?? payload.find((item) => item.dataKey === "unitsSold")?.value ?? 0)
  const orders = Number(dataPoint?.orders ?? 0)
  const revenue = Number(dataPoint?.revenue ?? salePrice * unitsSold)

  return (
    <div className={styles.salesTooltip}>
      <div className={styles.salesTooltipLabel}>{label}</div>
      <div className={styles.salesTooltipGrid}>
        <div className={styles.salesTooltipItem}>
          <span className={styles.salesTooltipItemLabel}>Buyer sale price</span>
          <span className={styles.salesTooltipItemValue}>{formatRupiah(salePrice)}</span>
        </div>
        <div className={styles.salesTooltipItem}>
          <span className={styles.salesTooltipItemLabel}>Units sold</span>
          <span className={styles.salesTooltipItemValue}>{unitsSold}</span>
        </div>
        <div className={styles.salesTooltipItem}>
          <span className={styles.salesTooltipItemLabel}>Orders</span>
          <span className={styles.salesTooltipItemValue}>{orders}</span>
        </div>
        <div className={styles.salesTooltipItem}>
          <span className={styles.salesTooltipItemLabel}>Revenue</span>
          <span className={styles.salesTooltipItemValue}>{formatRupiah(revenue)}</span>
        </div>
      </div>
    </div>
  )
}

function ProductSalesChart({
  availableRanges,
  defaultRange = "6m",
  description,
  history,
  label,
  showRangeControls = true,
  subtitle,
  title = "Sales history",
  tone,
}: ProductSalesChartProps) {
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
  const summary = summarizeSalesHistory(activeHistory)
  const firstPeriod = activeHistory[0]?.period
  const lastPeriod = activeHistory[activeHistory.length - 1]?.period
  const chartConfig = {
    salePrice: {
      label: "Buyer sale price",
      color: tone,
    },
    unitsSold: {
      label: "Units sold",
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
            Buyer sale price
          </span>
          <span className={styles.priceChartLegendItem}>
            <span className={styles.salesChartLegendBar} />
            Units sold
          </span>
          <span className={styles.priceChartLegendItem}>
            <span className={styles.priceChartLegendLine} />
            Average sale price
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
              tickFormatter={formatCompactRupiah}
              tickLine={false}
              tickMargin={10}
              width={68}
              yAxisId="price"
            />
            <YAxis
              axisLine={false}
              orientation="right"
              tickFormatter={formatCompactCount}
              tickLine={false}
              tickMargin={10}
              width={52}
              yAxisId="volume"
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke="#57534e"
              strokeDasharray="6 6"
              strokeOpacity={0.72}
              y={summary.averageSalePrice}
              yAxisId="price"
            />
            <ChartTooltip content={<SalesHistoryTooltip />} cursor={{ fill: "rgba(28, 25, 23, 0.05)" }} />
            <Bar
              barSize={18}
              dataKey="unitsSold"
              fill="var(--color-unitsSold)"
              fillOpacity={0.18}
              radius={[6, 6, 0, 0]}
              yAxisId="volume"
            />
            <Line
              activeDot={{ r: 5, strokeWidth: 0, fill: "var(--color-salePrice)" }}
              dataKey="salePrice"
              dot={false}
              stroke="var(--color-salePrice)"
              strokeWidth={2.6}
              type="monotone"
              yAxisId="price"
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className={styles.salesChartFooter}>
        <div className={styles.priceChartFooterCopy}>
          <div className={styles.priceChartFooterText}>
            {label} sales across the latest {priceHistoryRangeLabels[effectiveRange]} window.
          </div>
          <div className={styles.priceChartFooterSubtle}>{subtitle ?? `${firstPeriod} - ${lastPeriod}`}</div>
        </div>
        <div className={styles.salesChartMetrics}>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Latest buyer price</p>
            <p className={styles.salesChartMetricValue}>{formatRupiah(summary.latestSalePrice)}</p>
          </div>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Units sold</p>
            <p className={styles.salesChartMetricValue}>{summary.totalUnitsSold}</p>
          </div>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Orders</p>
            <p className={styles.salesChartMetricValue}>{summary.totalOrders}</p>
          </div>
          <div className={styles.salesChartMetric}>
            <p className={styles.salesChartMetricLabel}>Revenue</p>
            <p className={styles.salesChartMetricValue}>{formatCompactRupiah(summary.totalRevenue)}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ProductSalesChart
