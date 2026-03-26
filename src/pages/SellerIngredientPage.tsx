import { type ChangeEvent } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"

import ProductSalesChart from "@/components/dashboard/ProductSalesChart"
import SellerRatingChart from "@/components/dashboard/SellerRatingChart"
import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useMarketplace, useSellerStore } from "@/context/seller"
import { formatRupiah, type Product } from "@/lib/data"
import { getListingRatingSummary, getListingSalesSummary } from "@/lib/seller"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import styles from "@/pages/Seller.module.css"

function SellerIngredientPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: Product["slug"] }>()
  const {
    currentSellerListings,
    currentStoreProfile,
    removeListing,
    toggleListing,
    updateListing,
  } = useSellerStore()
  const { getProductBySlug } = useMarketplace()

  const listing = currentSellerListings.find((entry) => entry.productSlug === slug)
  const product = slug ? getProductBySlug(slug) : undefined

  if (!currentStoreProfile || !listing || !product) {
    return <Navigate replace to="/seller" />
  }

  const salesSummary = getListingSalesSummary(listing)
  const ratingSummary = getListingRatingSummary(listing)

  const handleDeliveryOptionChange = (deliveryOptionId: string, event: ChangeEvent<HTMLInputElement>) => {
    updateListing(listing.id, {
      deliveryOptionIds: event.target.checked
        ? [...new Set([...listing.deliveryOptionIds, deliveryOptionId])]
        : listing.deliveryOptionIds.filter((optionId) => optionId !== deliveryOptionId),
    })
  }

  const handleRemoveListing = () => {
    removeListing(listing.id)
    navigate("/seller")
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/seller" label="Back" />}
          description="Inspect the ingredient’s sales curve, compare fulfillment metrics, and update the public listing configuration used across the marketplace."
          label="Seller ingredient"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant={listing.isActive ? "success" : "outline"}>
                {listing.isActive ? "Active listing" : "Inactive listing"}
              </Badge>
              {listing.stockQuantity <= 20 ? <Badge variant="warning">Low stock</Badge> : null}
            </div>
          }
          title={`${product.name} listing detail`}
        />

        <main className={styles.gridLayout}>
          <section className={styles.mainColumn}>
            <ProductSalesChart
              availableRanges={listing.salesHistoryByRange}
              description="Completed sales for this listing only. Use the sales curve to compare realized buyer sale price and fulfillment volume before you update the live listing."
              history={listing.salesHistory}
              label={product.name}
              subtitle={`${product.category} listing performance`}
              title="Listing sales analytics"
              tone={product.chartColor}
            />

            <SellerRatingChart
              availableRanges={listing.ratingHistoryByRange}
              description="Rating trend and review volume for this ingredient listing. Use the review pattern to judge how pricing and fulfillment changes are affecting buyer sentiment."
              history={listing.ratingHistory}
              label={product.name}
              subtitle={`${product.category} buyer sentiment`}
              title="Listing rating analytics"
              tone="#f59e0b"
            />

            <Card className={styles.surfaceCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.surfaceTitle}>Listing controls</CardTitle>
                <CardDescription>
                  Adjust live pricing, stock, warehouse routing, and delivery configuration for this ingredient.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <div className={styles.formGrid}>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Price</span>
                    <Input
                      onChange={(event) => updateListing(listing.id, { price: Number(event.target.value) || 0 })}
                      type="number"
                      value={listing.price}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Stock quantity</span>
                    <Input
                      onChange={(event) =>
                        updateListing(listing.id, { stockQuantity: Number(event.target.value) || 0 })
                      }
                      type="number"
                      value={listing.stockQuantity}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Stock label</span>
                    <Input
                      onChange={(event) => updateListing(listing.id, { stockLabel: event.target.value })}
                      type="text"
                      value={listing.stockLabel}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Handling time</span>
                    <Input
                      onChange={(event) => updateListing(listing.id, { handlingTime: event.target.value })}
                      type="text"
                      value={listing.handlingTime}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Warehouse location</span>
                    <select
                      className={styles.select}
                      onChange={(event) => updateListing(listing.id, { warehouseLocationId: event.target.value })}
                      value={listing.warehouseLocationId}
                    >
                      {currentStoreProfile.locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.label} · {location.city}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Delivery options</span>
                  <div className={styles.checkboxGrid}>
                    {currentStoreProfile.deliveryOptions.map((option) => (
                      <label key={option.id} className={styles.checkboxOption}>
                        <input
                          checked={listing.deliveryOptionIds.includes(option.id)}
                          onChange={(event) => handleDeliveryOptionChange(option.id, event)}
                          type="checkbox"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.inlineActions}>
                  <Button onClick={() => toggleListing(listing.id)} type="button" variant="outline">
                    {listing.isActive ? "Pause listing" : "Activate listing"}
                  </Button>
                  <Button onClick={handleRemoveListing} type="button" variant="destructive">
                    Remove listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className={styles.sideColumn}>
            <Card className={styles.surfaceCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.surfaceTitle}>Ingredient snapshot</CardTitle>
                <CardDescription>Current live metrics for this listing.</CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <div className={styles.analyticsIdentity}>
                  <div className={styles.iconBadge}>{product.icon}</div>
                  <div>
                    <p className={styles.storeName}>{product.name}</p>
                    <p className={styles.supportingCopy}>
                      {product.category} · {product.unit}
                    </p>
                  </div>
                </div>
                <div className={styles.inlineSummary}>
                  <Card className={styles.metricTile} size="sm">
                    <CardContent className={styles.metricTileBody}>
                      <p className={styles.fieldLabel}>Units sold</p>
                      <p className={styles.metricTileValue}>{salesSummary.totalUnitsSold}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricTile} size="sm">
                    <CardContent className={styles.metricTileBody}>
                      <p className={styles.fieldLabel}>Orders</p>
                      <p className={styles.metricTileValue}>{salesSummary.totalOrders}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricTile} size="sm">
                    <CardContent className={styles.metricTileBody}>
                      <p className={styles.fieldLabel}>Revenue</p>
                      <p className={styles.metricTileValue}>{formatRupiah(salesSummary.totalRevenue)}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricTile} size="sm">
                    <CardContent className={styles.metricTileBody}>
                      <p className={styles.fieldLabel}>Average sale price</p>
                      <p className={styles.metricTileValue}>{formatRupiah(salesSummary.averageSalePrice)}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricTile} size="sm">
                    <CardContent className={styles.metricTileBody}>
                      <p className={styles.fieldLabel}>Latest rating</p>
                      <p className={styles.metricTileValue}>{ratingSummary.latestRating.toFixed(1)} / 5</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricTile} size="sm">
                    <CardContent className={styles.metricTileBody}>
                      <p className={styles.fieldLabel}>Total reviews</p>
                      <p className={styles.metricTileValue}>{ratingSummary.totalReviews}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricTile} size="sm">
                    <CardContent className={styles.metricTileBody}>
                      <p className={styles.fieldLabel}>Strongest period</p>
                      <p className={styles.metricTileValue}>{ratingSummary.strongestPeriod}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className={styles.surfaceCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.surfaceTitle}>Store routing</CardTitle>
                <CardDescription>Store-level settings still live in the store setup page.</CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <p className={styles.supportingCopy}>
                  Update store profile, warehouse locations, delivery options, or register another ingredient from the store setup workflow.
                </p>
                <div className={styles.inlineActions}>
                  <Button asChild type="button" variant="outline">
                    <Link to="/seller/store">Open store setup</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default SellerIngredientPage
