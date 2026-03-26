import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  PackageCheck,
  Sparkles,
  Star,
  Store,
  Truck,
} from "lucide-react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom"

import ProductCard from "@/components/dashboard/ProductCard"
import ProductPriceChart from "@/components/dashboard/ProductPriceChart"
import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useBasket } from "@/context/basket"
import { useLocationPreference } from "@/context/location"
import { useMarketplace } from "@/context/seller"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { formatRupiah, recentAiSearches, type Product } from "@/lib/data"
import {
  buildSearchPlan,
  describeUserLocation,
  findBundleMatch,
  rankSellers,
  type SellerSortMode,
} from "@/lib/planner"
import { matchesProductQuery } from "@/lib/search"
import { cn } from "@/lib/utils"
import styles from "@/pages/SearchPlanner.module.css"

const sortModes: Array<{ label: string; value: SellerSortMode }> = [
  { label: "Smart match", value: "smart" },
  { label: "Closest", value: "location" },
  { label: "Lowest price", value: "price" },
  { label: "Highest rating", value: "rating" },
]

function SearchPlanner() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { marketplaceProducts } = useMarketplace()
  const { currentLocation } = useLocationPreference()
  const seedQuery = searchParams.get("q")?.trim() ?? ""
  const resultMode = searchParams.get("mode") === "ai" ? "ai" : "marketplace"
  const selectedProductSlug = searchParams.get("preview") as Product["slug"] | null
  const [sortMode, setSortMode] = useState<SellerSortMode>("smart")
  const [sellerQuantities, setSellerQuantities] = useState<Record<number, number>>({})
  const { addItem } = useBasket()

  const matchedProducts = useMemo(
    () => marketplaceProducts.filter((product) => matchesProductQuery(product, seedQuery)),
    [marketplaceProducts, seedQuery]
  )
  const aiMatch = useMemo(() => findBundleMatch(seedQuery), [seedQuery])
  const hasAiResult = Boolean(seedQuery) && aiMatch.matchType !== "fallback"
  const plannerView = useMemo(
    () =>
      resultMode === "ai" && hasAiResult
        ? buildSearchPlan(seedQuery, marketplaceProducts, currentLocation)
        : null,
    [currentLocation, hasAiResult, marketplaceProducts, resultMode, seedQuery]
  )
  const activeIngredient =
    plannerView?.ingredients.find((ingredient) => ingredient.product.slug === selectedProductSlug) ?? null
  const activeIngredientSlug = activeIngredient?.product.slug ?? null
  const smartBestSeller = useMemo(
    () => (activeIngredient ? rankSellers(activeIngredient.product, "smart", currentLocation)[0] : null),
    [activeIngredient, currentLocation]
  )
  const visibleSellers = useMemo(
    () => (activeIngredient ? rankSellers(activeIngredient.product, sortMode, currentLocation) : []),
    [activeIngredient, currentLocation, sortMode]
  )
  const detailState =
    activeIngredient && smartBestSeller
      ? { ingredient: activeIngredient, bestSeller: smartBestSeller }
      : null
  const isDetailOpen = Boolean(detailState)

  const handlePreviewChange = (nextSlug: Product["slug"] | null) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextSlug) {
      nextSearchParams.set("preview", nextSlug)
    } else {
      nextSearchParams.delete("preview")
    }

    setSearchParams(nextSearchParams, { replace: true })
  }

  const getSellerQuantity = (sellerId: number) => sellerQuantities[sellerId] ?? 1

  if (!seedQuery) {
    return <Navigate replace to="/" />
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <main className={cn(styles.layout, isDetailOpen && styles.layoutExpanded)}>
          <section className={styles.mainColumn}>
            <PageHeader
              action={<BackButton fallbackTo="/" label="Back" />}
              description={
                hasAiResult
                  ? resultMode === "ai"
                    ? `TaniLink matched "${seedQuery}" to an AI planning bundle, then stacked direct ingredient results underneath for regular product browsing.`
                    : `"${seedQuery}" can be expanded into an AI bundle, but marketplace results stay primary until you activate the planner.`
                  : `"${seedQuery}" looks like a direct ingredient search, so TaniLink shows normal marketplace matches and keeps AI bundle suggestions collapsed by default.`
              }
              label="Search results"
              meta={
                <div className={styles.resultsMeta}>
                  <Badge variant="outline">{plannerView ? "AI plan active" : "AI hidden by default"}</Badge>
                  <Badge variant="outline">{matchedProducts.length} marketplace matches</Badge>
                </div>
              }
              title={`Results for "${seedQuery}"`}
            />

            {plannerView ? (
              <>
                <Card className={styles.summaryCard}>
                  <CardHeader className={styles.compactHeader}>
                    <div className={styles.summaryTop}>
                      <div>
                        <div className={styles.summaryBadgeRow}>
                          <Badge variant="secondary">{plannerView.bundle.type}</Badge>
                          <Badge variant="outline">
                            Matched from "{plannerView.match.matchedAlias}"
                          </Badge>
                        </div>
                        <CardTitle className={styles.summaryTitle}>{plannerView.bundle.name}</CardTitle>
                        <CardDescription>
                          {plannerView.bundle.description} This planner is based on the current search:
                          <strong> "{seedQuery}"</strong>.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <Separator />

                  <CardContent className={styles.summaryStats}>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.metricLabel}>Output</p>
                        <p className={styles.metricValue}>{plannerView.bundle.outputLabel}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.metricLabel}>Servings</p>
                        <p className={styles.metricValue}>{plannerView.bundle.servings}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.metricLabel}>Estimated buy-in</p>
                        <p className={styles.metricValue}>{formatRupiah(plannerView.totalEstimatedCost)}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.metricLabel}>Estimated savings</p>
                        <p className={styles.metricValue}>{formatRupiah(plannerView.totalSavings)}</p>
                      </CardContent>
                    </Card>
                  </CardContent>

                  <Separator />

                  <CardContent className={styles.summaryIngredientList}>
                    <div>
                      <p className={styles.metricLabel}>Included ingredients</p>
                      <div className={styles.summaryIngredientChips}>
                        {plannerView.ingredients.map((ingredient) => (
                          <Badge key={ingredient.product.slug} variant="outline">
                            {ingredient.product.name} · {ingredient.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className={styles.summaryFooter}>
                    <Sparkles className={styles.footerIcon} />
                    <p className={styles.summaryFootnote}>{plannerView.marketPressure}</p>
                  </CardFooter>
                </Card>

                <section className={styles.ingredientSection}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.sectionLabel}>AI planner</p>
                      <h2 className={styles.sectionTitle}>Recommended sourcing per ingredient</h2>
                      <p className={styles.sectionNote}>
                        Click an ingredient card to expand its market and seller detail from the right.
                      </p>
                    </div>
                  </div>

                  <div className={styles.aiIngredientList}>
                    {plannerView.ingredients.map((ingredient) => {
                      const isActive = ingredient.product.slug === activeIngredientSlug

                      return (
                        <div key={ingredient.product.slug} className={styles.aiIngredientItem}>
                          <ProductCard
                            detailMeta={`${ingredient.recommendedSeller.name} · ${ingredient.recommendedSeller.distanceKm} km away`}
                            detailReason={ingredient.sourcingReason}
                            detailRole={ingredient.role}
                            isActive={isActive}
                            metricLabel="Recommended offer"
                            metricValue={formatRupiah(ingredient.recommendedSeller.price)}
                            onSelect={() =>
                              handlePreviewChange(
                                selectedProductSlug === ingredient.product.slug ? null : ingredient.product.slug
                              )
                            }
                            product={ingredient.product}
                            showChart={false}
                            subtitle={ingredient.quantity}
                          />
                        </div>
                      )
                    })}
                  </div>
                </section>
              </>
            ) : (
              <Card className={styles.aiSuggestionCard}>
                <CardHeader className={styles.compactHeader}>
                  <div className={styles.summaryBadgeRow}>
                    <Badge variant="outline">
                      <Sparkles className={styles.badgeIcon} />
                      AI suggestion
                    </Badge>
                    {resultMode === "ai" && !hasAiResult ? <Badge variant="warning">No direct bundle match</Badge> : null}
                  </div>
                  <CardTitle className={styles.summaryTitle}>
                    {hasAiResult ? "AI planner available for this search" : "Try the AI planner with a dish or supply bundle"}
                  </CardTitle>
                  <CardDescription>
                    {hasAiResult
                      ? `"${seedQuery}" can be expanded into a multi-ingredient sourcing plan. Activate AI on this page to show the bundle above the marketplace results.`
                      : `"${seedQuery}" behaves more like a direct ingredient query. The AI planner is hidden by default, so instead TaniLink suggests a few scripted prompts that produce multi-ingredient bundles.`}
                  </CardDescription>
                </CardHeader>
                <CardContent className={styles.aiSuggestionBody}>
                  {hasAiResult ? (
                    <div className={styles.activateRow}>
                      <Button
                        onClick={() => navigate(`/search?q=${encodeURIComponent(seedQuery)}&mode=ai`)}
                        type="button"
                      >
                        <Sparkles className={styles.buttonIcon} />
                        Activate AI planner on this page
                      </Button>
                    </div>
                  ) : null}
                  <div className={styles.promptList}>
                    {recentAiSearches.slice(0, 4).map((search) => (
                      <button
                        key={search}
                        className={styles.promptButton}
                        onClick={() => navigate(`/search?q=${encodeURIComponent(search)}&mode=ai`)}
                        type="button"
                      >
                        <Sparkles className={styles.badgeIcon} />
                        {search}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <section className={styles.catalogSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionLabel}>Marketplace results</p>
                  <h2 className={styles.sectionTitle}>Direct ingredient and supply matches</h2>
                  <p className={styles.sectionNote}>
                    Open any product to inspect the full market curve, seller ranking, and delivery lanes.
                  </p>
                </div>
                <Badge variant="outline">{matchedProducts.length} matches</Badge>
              </div>

              {matchedProducts.length ? (
                <div className={styles.catalogList}>
                  {matchedProducts.map((product) => (
                    <div key={product.id} className={styles.catalogItem}>
                      <ProductCard
                        isActive={false}
                        onSelect={() => navigate(`/products/${product.slug}`)}
                        product={product}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className={styles.emptyStateCard}>
                  <CardContent className={styles.emptyStateBody}>
                    <p className={styles.emptyStateTitle}>No direct product matches for this query.</p>
                    <p className={styles.emptyStateCopy}>
                      Try another ingredient name, seller location, or switch to one of the scripted AI prompts above.
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </section>

          <aside className={cn(styles.sidebar, isDetailOpen ? styles.sidebarExpanded : styles.sidebarCollapsed)}>
            {detailState ? (
              <Card className={styles.sidebarCard}>
                <CardHeader className={styles.compactHeader}>
                  <div className={styles.sidebarHeaderTop}>
                    <div>
                      <p className={styles.sectionLabel}>Live seller routing</p>
                      <CardTitle className={styles.sidebarTitle}>{detailState.ingredient.product.name}</CardTitle>
                    </div>
                    <Badge variant="warning">{detailState.ingredient.quantity}</Badge>
                  </div>
                  <CardDescription>
                    Best seller is chosen from price history, local delivery fit, rating, and current handling load.
                  </CardDescription>
                </CardHeader>

                <CardContent className={styles.sidebarBody}>
                  <Card className={styles.bestSellerCard} size="sm">
                    <CardContent className={styles.bestSellerBody}>
                      <div>
                        <p className={styles.bestSellerLabel}>Best match for {currentLocation.area}</p>
                        <p className={styles.bestSellerName}>{detailState.bestSeller.name}</p>
                      </div>
                      <div className={styles.bestSellerMeta}>
                        <Badge variant="success">{detailState.bestSeller.smartScore} smart score</Badge>
                        <Badge variant="outline">{detailState.bestSeller.marketDeltaLabel}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <div className={styles.detailActions}>
                    <Button asChild variant="outline">
                      <Link to={`/products/${detailState.ingredient.product.slug}`}>
                        <ArrowUpRight className={styles.buttonIcon} />
                        Open full product page
                      </Link>
                    </Button>
                  </div>

                  <ProductPriceChart
                    description={`${detailState.ingredient.product.marketStatus}. Seller ranking prefers below-market offers when price pressure rises for ${describeUserLocation(currentLocation, "short")}.`}
                    history={detailState.ingredient.product.priceHistory}
                    label={detailState.ingredient.product.name}
                    priceChange={detailState.ingredient.product.priceChange}
                    subtitle={`${detailState.ingredient.product.unit} market movement`}
                    title="Market price history"
                    tone={detailState.ingredient.product.chartColor}
                  />

                  <div className={styles.sortSection}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <p className={styles.sectionLabel}>Seller sorter</p>
                        <h3 className={styles.sortTitle}>Sort by location, price, rating, or smart match</h3>
                      </div>
                    </div>
                    <div className={styles.sortRow}>
                      {sortModes.map((mode) => (
                        <Button
                          key={mode.value}
                          className={styles.sortButton}
                          onClick={() => setSortMode(mode.value)}
                          type="button"
                          variant={mode.value === sortMode ? "default" : "outline"}
                        >
                          {mode.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.sellerList}>
                    {visibleSellers.map((seller) => {
                      const isSmartRecommendation = seller.id === detailState.bestSeller.id

                      return (
                        <Card key={seller.id} className={styles.sellerCard}>
                          <CardHeader className={styles.compactHeader}>
                            <div className={styles.sellerHeaderRow}>
                              <div>
                                <div className={styles.sellerNameRow}>
                                  <CardTitle className={styles.sellerName}>{seller.name}</CardTitle>
                                  {isSmartRecommendation ? <Badge variant="success">Recommended</Badge> : null}
                                </div>
                                <CardDescription>{seller.stockLabel}</CardDescription>
                              </div>
                              <div className={styles.priceWrap}>
                                <p className={styles.metricLabel}>Seller price</p>
                                <p className={styles.sellerPrice}>{formatRupiah(seller.price)}</p>
                              </div>
                            </div>
                          </CardHeader>

                          <Separator />

                          <CardContent className={styles.sellerBody}>
                            <div className={styles.sellerInfoGrid}>
                              <div className={styles.infoPill}>
                                <MapPin className={styles.infoIcon} />
                                <div>
                                  <p className={styles.infoLabel}>Location</p>
                                  <p className={styles.infoValue}>
                                    {seller.location} · {seller.distanceKm} km
                                  </p>
                                </div>
                              </div>
                              <div className={styles.infoPill}>
                                <Store className={styles.infoIcon} />
                                <div>
                                  <p className={styles.infoLabel}>Warehouse</p>
                                  <p className={styles.infoValue}>{seller.warehouse}</p>
                                </div>
                              </div>
                              <div className={styles.infoPill}>
                                <Truck className={styles.infoIcon} />
                                <div>
                                  <p className={styles.infoLabel}>Delivery</p>
                                  <p className={styles.infoValue}>{seller.delivery}</p>
                                </div>
                              </div>
                              <div className={styles.infoPill}>
                                <Star className={styles.infoIcon} />
                                <div>
                                  <p className={styles.infoLabel}>Rating</p>
                                  <p className={styles.infoValue}>{seller.rating.toFixed(1)} / 5</p>
                                </div>
                              </div>
                            </div>

                            <div className={styles.sellerMetrics}>
                              <Badge variant="outline">
                                <PackageCheck className={styles.badgeIcon} />
                                {seller.marketDeltaLabel}
                              </Badge>
                              <Badge
                                variant={
                                  seller.busyLevel === "High"
                                    ? "danger"
                                    : seller.busyLevel === "Moderate"
                                      ? "warning"
                                      : "success"
                                }
                              >
                                <Clock3 className={styles.badgeIcon} />
                                {seller.busyLevel} load
                              </Badge>
                              <Badge variant="secondary">{seller.activeOrders} active orders</Badge>
                              <Badge variant="muted">{seller.handlingTime}</Badge>
                            </div>

                            <div className={styles.basketControls}>
                              <label className={styles.quantityGroup}>
                                <span className={styles.metricLabel}>Quantity</span>
                                <Input
                                  className={styles.quantityInput}
                                  min="1"
                                  onChange={(event) =>
                                    setSellerQuantities((current) => ({
                                      ...current,
                                      [seller.id]: Math.max(1, Number(event.target.value) || 1),
                                    }))
                                  }
                                  type="number"
                                  value={getSellerQuantity(seller.id)}
                                />
                              </label>
                              <Button
                                onClick={() => addItem(detailState.ingredient.product, seller, getSellerQuantity(seller.id))}
                                type="button"
                              >
                                Add to basket
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </aside>
        </main>
      </div>
    </div>
  )
}

export default SearchPlanner
