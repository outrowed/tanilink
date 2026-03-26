import { type PriceHistoryPoint, type PriceHistoryRange } from "@/lib/data"

export interface BaselineForecast {
  delta: number
  points: PriceHistoryPoint[]
}

export interface PriceForecast {
  baseline: BaselineForecast
  horizonLabel: string
}

const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function clampPrice(value: number, anchor: number) {
  return Math.max(Math.round(anchor * 0.55), Math.round(value / 100) * 100)
}

function average(values: number[]) {
  if (!values.length) {
    return 0
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function standardDeviation(values: number[]) {
  if (values.length <= 1) {
    return 0
  }

  const mean = average(values)
  const variance = average(values.map((value) => (value - mean) ** 2))

  return Math.sqrt(variance)
}

function buildFutureLabels(history: PriceHistoryPoint[], range: PriceHistoryRange) {
  const lastLabel = history[history.length - 1]?.month ?? ""

  switch (range) {
    case "24h":
      return ["+1h", "+3h", "+6h", "+12h"]
    case "1m":
      return ["+2d", "+5d", "+10d", "+20d"]
    case "6m":
    case "1y": {
      const normalizedLastLabel = lastLabel.slice(0, 3)
      const lastIndex = shortMonths.indexOf(normalizedLastLabel)

      if (lastIndex === -1) {
        return ["F+1", "F+2", "F+3", "F+4"]
      }

      return Array.from({ length: 4 }, (_, index) => shortMonths[(lastIndex + index + 1) % shortMonths.length])
    }
  }
}

function getRangeTuning(range: PriceHistoryRange) {
  switch (range) {
    case "24h":
      return { driftWeight: 0.5, horizonLabel: "Next 12 hours", reversionWeight: 0.1, volatilityWeight: 0.55 }
    case "1m":
      return { driftWeight: 0.72, horizonLabel: "Next 20 days", reversionWeight: 0.16, volatilityWeight: 0.72 }
    case "6m":
      return { driftWeight: 0.92, horizonLabel: "Next 4 months", reversionWeight: 0.22, volatilityWeight: 0.9 }
    case "1y":
      return { driftWeight: 1, horizonLabel: "Next 4 months", reversionWeight: 0.26, volatilityWeight: 1 }
  }
}

export function buildPriceForecast(
  history: PriceHistoryPoint[],
  range: PriceHistoryRange,
  priceChange: number
): PriceForecast {
  const safeHistory = history.length ? history : [{ month: "Now", price: 0 }]
  const prices = safeHistory.map((point) => point.price)
  const latestPrice = prices[prices.length - 1] ?? 0
  const diffs = prices.slice(1).map((price, index) => price - prices[index])
  const recentDiffs = diffs.slice(-Math.min(4, diffs.length))
  const meanPrice = average(prices) || latestPrice
  const longMomentum = average(diffs)
  const recentMomentum = average(recentDiffs)
  const acceleration = recentMomentum - longMomentum
  const volatility = standardDeviation(diffs)
  const deviationFromMean = meanPrice ? (latestPrice - meanPrice) / meanPrice : 0
  const trendBias = latestPrice * (priceChange / 100) * 0.06
  const tuning = getRangeTuning(range)
  const baseStep =
    recentMomentum * 0.52 +
    longMomentum * 0.28 +
    acceleration * 0.2 +
    trendBias * tuning.driftWeight
  const reversionStep = -deviationFromMean * latestPrice * tuning.reversionWeight
  const labels = buildFutureLabels(safeHistory, range)

  let currentPrice = latestPrice
  const baselinePoints = labels.map((futureLabel, index) => {
    const damping = 1 - index * 0.09
    const volatilityAdjustment = volatility * tuning.volatilityWeight * 0.18 * (0.85 + index * 0.1)
    const step = baseStep * damping + reversionStep + volatilityAdjustment
    currentPrice = clampPrice(currentPrice + step, latestPrice || meanPrice || 1)

    return {
      month: futureLabel,
      price: currentPrice,
    }
  })

  return {
    baseline: {
      delta: (baselinePoints[baselinePoints.length - 1]?.price ?? latestPrice) - latestPrice,
      points: baselinePoints,
    },
    horizonLabel: tuning.horizonLabel,
  }
}
