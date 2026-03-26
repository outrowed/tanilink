import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { accountTransactions, type TransactionStatus } from "@/lib/account"
import { formatRupiah } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/pages/Account.module.css"

type TransactionFilter = "All" | TransactionStatus

const transactionFilters: TransactionFilter[] = [
  "All",
  "Awaiting confirmation",
  "Packed",
  "In transit",
  "Delivered",
  "Issue reported",
]

function getStatusVariant(status: TransactionStatus) {
  switch (status) {
    case "Delivered":
      return "success"
    case "Issue reported":
      return "danger"
    case "In transit":
      return "info"
    case "Packed":
    case "Awaiting confirmation":
      return "warning"
    default:
      return "outline"
  }
}

function AccountTransactionsPage() {
  const [filter, setFilter] = useState<TransactionFilter>("All")
  const [selectedTransactionId, setSelectedTransactionId] = useState(accountTransactions[0]?.id ?? "")

  const filteredTransactions = useMemo(
    () =>
      filter === "All"
        ? accountTransactions
        : accountTransactions.filter((transaction) => transaction.status === filter),
    [filter]
  )

  const activeSelectedTransactionId = filteredTransactions.some(
    (transaction) => transaction.id === selectedTransactionId
  )
    ? selectedTransactionId
    : filteredTransactions[0]?.id ?? ""

  const selectedTransaction =
    filteredTransactions.find((transaction) => transaction.id === activeSelectedTransactionId) ?? null

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/account" label="Back" />}
          description="Review your ingredient purchases, compare totals, and follow every delivery step from seller confirmation to handoff."
          label="Transactions"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{filteredTransactions.length} visible orders</Badge>
              {selectedTransaction ? <Badge variant="outline">Selected {selectedTransaction.id}</Badge> : null}
            </div>
          }
          title="Order history and delivery status"
        />

        <main className={styles.splitLayout}>
          <section className={styles.listColumn}>
            <Card className={styles.panelCard}>
              <CardHeader className={styles.panelHeader}>
                <CardTitle className={styles.panelTitle}>Transaction list</CardTitle>
                <CardDescription>Filter by current order status and open any order to inspect the full detail.</CardDescription>
              </CardHeader>
              <CardContent className={styles.panelBody}>
                <div className={styles.filterRow}>
                  {transactionFilters.map((option) => (
                    <Button
                      key={option}
                      onClick={() => setFilter(option)}
                      type="button"
                      variant={option === filter ? "default" : "outline"}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                <div className={styles.listStack}>
                  {filteredTransactions.map((transaction) => (
                    <button
                      key={transaction.id}
                      className={cn(
                        styles.selectionCard,
                        activeSelectedTransactionId === transaction.id && styles.selectionCardActive
                      )}
                      onClick={() => setSelectedTransactionId(transaction.id)}
                      type="button"
                    >
                      <div className={styles.selectionHeader}>
                        <div>
                          <p className={styles.selectionTitle}>{transaction.id}</p>
                          <p className={styles.selectionMeta}>{transaction.placedAt}</p>
                        </div>
                        <Badge variant={getStatusVariant(transaction.status)}>{transaction.status}</Badge>
                      </div>
                      <p className={styles.selectionCopy}>{transaction.deliveryStatus}</p>
                      <div className={styles.selectionFooter}>
                        <span>{transaction.items.length} items</span>
                        <span>{formatRupiah(transaction.total)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className={styles.detailColumn}>
            {selectedTransaction ? (
              <Card className={styles.panelCard}>
                <CardHeader className={styles.panelHeader}>
                  <div className={styles.detailHeaderRow}>
                    <div>
                      <CardTitle className={styles.panelTitle}>{selectedTransaction.id}</CardTitle>
                      <CardDescription>{selectedTransaction.deliveryStatus}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className={styles.panelBody}>
                  <div className={styles.summaryGrid}>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.metricLabel}>ETA</p>
                        <p className={styles.metricValue}>{selectedTransaction.eta}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.metricLabel}>Tracking code</p>
                        <p className={styles.metricValue}>{selectedTransaction.trackingCode}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className={styles.sectionBlock}>
                    <p className={styles.metricLabel}>Sellers</p>
                    <div className={styles.badgeRow}>
                      {selectedTransaction.sellerNames.map((sellerName) => (
                        <Badge key={sellerName} variant="outline">
                          {sellerName}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className={styles.sectionBlock}>
                    <p className={styles.metricLabel}>Items in this order</p>
                    <div className={styles.itemList}>
                      {selectedTransaction.items.map((item) => (
                        <Card key={`${selectedTransaction.id}-${item.productSlug}`} className={styles.listSurface} size="sm">
                          <CardContent className={styles.listSurfaceBody}>
                            <div className={styles.itemPrimary}>
                              <div className={styles.itemIcon}>{item.productIcon}</div>
                              <div>
                                <p className={styles.selectionTitle}>{item.productName}</p>
                                <p className={styles.selectionMeta}>
                                  {item.quantity} x {item.unit} · {item.sellerName}
                                </p>
                              </div>
                            </div>
                            <div className={styles.itemActions}>
                              <p className={styles.selectionTitle}>{formatRupiah(item.lineTotal)}</p>
                              <Button asChild type="button" variant="outline">
                                <Link to={`/products/${item.productSlug}`}>View product</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className={styles.sectionBlock}>
                    <p className={styles.metricLabel}>Totals</p>
                    <div className={styles.summaryGrid}>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Subtotal</p>
                          <p className={styles.metricValue}>{formatRupiah(selectedTransaction.subtotal)}</p>
                        </CardContent>
                      </Card>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Delivery fee</p>
                          <p className={styles.metricValue}>{formatRupiah(selectedTransaction.deliveryFee)}</p>
                        </CardContent>
                      </Card>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Total</p>
                          <p className={styles.metricValue}>{formatRupiah(selectedTransaction.total)}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className={styles.sectionBlock}>
                    <p className={styles.metricLabel}>Delivery timeline</p>
                    <div className={styles.timelineList}>
                      {selectedTransaction.timeline.map((step) => (
                        <div key={`${selectedTransaction.id}-${step.label}`} className={styles.timelineItem}>
                          <div
                            className={cn(
                              styles.timelineDot,
                              step.state === "done" && styles.timelineDotDone,
                              step.state === "current" && styles.timelineDotCurrent,
                              step.state === "pending" && styles.timelineDotPending,
                              step.state === "issue" && styles.timelineDotIssue
                            )}
                          />
                          <div className={styles.timelineCopy}>
                            <div className={styles.selectionHeader}>
                              <p className={styles.selectionTitle}>{step.label}</p>
                              <span className={styles.selectionMeta}>{step.timestamp}</span>
                            </div>
                            <p className={styles.selectionCopy}>{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className={styles.emptyStateCard}>
                <CardContent className={styles.emptyStateBody}>
                  <p className={styles.emptyStateTitle}>No transactions found for this filter.</p>
                  <p className={styles.emptyStateCopy}>Choose another status to inspect your orders and delivery progress.</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </main>
      </div>
    </div>
  )
}

export default AccountTransactionsPage
