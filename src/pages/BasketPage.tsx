import { Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useBasket } from "@/context/basket"
import { formatRupiah } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import styles from "@/pages/BasketPage.module.css"

function BasketPage() {
  const { basketLines, clearBasket, itemCount, lineCount, removeItem, sellerCount, subtotal, updateQuantity } =
    useBasket()

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/" label="Back" />}
          description="Review basket lines, adjust quantities, and compare the sellers you picked across the marketplace."
          label="Basket"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{lineCount} lines</Badge>
              <Badge variant="outline">{itemCount} total items</Badge>
            </div>
          }
          title="Basket review"
        />

        {basketLines.length ? (
          <main className={styles.layout}>
            <section className={styles.lineList}>
              {basketLines.map((line) => (
                <Card key={line.id} className={styles.lineCard}>
                  <CardContent className={styles.lineBody}>
                    <div className={styles.linePrimary}>
                      <div className={styles.iconBadge}>{line.productIcon}</div>
                      <div className={styles.lineCopy}>
                        <p className={styles.lineTitle}>{line.productName}</p>
                        <p className={styles.lineMeta}>
                          {line.sellerName} · {line.unit}
                        </p>
                      </div>
                    </div>

                    <div className={styles.lineControls}>
                      <label className={styles.quantityGroup}>
                        <span className={styles.fieldLabel}>Quantity</span>
                        <Input
                          className={styles.quantityInput}
                          min="1"
                          onChange={(event) => updateQuantity(line.id, Number(event.target.value))}
                          type="number"
                          value={line.quantity}
                        />
                      </label>

                      <div className={styles.priceGroup}>
                        <div>
                          <p className={styles.fieldLabel}>Unit price</p>
                          <p className={styles.valueText}>{formatRupiah(line.sellerPrice)}</p>
                        </div>
                        <div>
                          <p className={styles.fieldLabel}>Line subtotal</p>
                          <p className={styles.valueText}>{formatRupiah(line.quantity * line.sellerPrice)}</p>
                        </div>
                      </div>

                      <Button onClick={() => removeItem(line.id)} type="button" variant="outline">
                        <Trash2 className={styles.icon} />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <aside className={styles.summaryColumn}>
              <Card className={styles.summaryCard}>
                <CardHeader className={styles.summaryHeader}>
                  <CardTitle className={styles.summaryTitle}>Basket summary</CardTitle>
                </CardHeader>
                <CardContent className={styles.summaryBody}>
                  <Card className={styles.metricCard} size="sm">
                    <CardContent className={styles.metricBody}>
                      <p className={styles.fieldLabel}>Subtotal</p>
                      <p className={styles.summaryValue}>{formatRupiah(subtotal)}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricCard} size="sm">
                    <CardContent className={styles.metricBody}>
                      <p className={styles.fieldLabel}>Basket lines</p>
                      <p className={styles.summaryValue}>{lineCount}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricCard} size="sm">
                    <CardContent className={styles.metricBody}>
                      <p className={styles.fieldLabel}>Unique sellers</p>
                      <p className={styles.summaryValue}>{sellerCount}</p>
                    </CardContent>
                  </Card>

                  <div className={styles.actionStack}>
                    <Button onClick={clearBasket} type="button" variant="outline">
                      Clear basket
                    </Button>
                    <Button asChild type="button" variant="secondary">
                      <Link to="/marketplace">Browse ingredient marketplace</Link>
                    </Button>
                    <Button asChild type="button">
                      <Link to="/">Return to homepage</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </main>
        ) : (
          <Card className={styles.emptyStateCard}>
            <CardContent className={styles.emptyStateBody}>
              <p className={styles.emptyStateTitle}>Your basket is empty.</p>
              <p className={styles.emptyStateCopy}>
                Add ingredients from the product page or the AI planner seller panel to start building a purchase basket.
              </p>
              <div className={styles.emptyActions}>
                <Button asChild type="button">
                  <Link to="/marketplace">Browse marketplace</Link>
                </Button>
                <Button asChild type="button" variant="secondary">
                  <Link to="/">Open homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default BasketPage
