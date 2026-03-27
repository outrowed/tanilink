import { ArrowRight, LayoutDashboard, Mail, ReceiptText, Settings2, Truck, UserRound } from "lucide-react"
import { Link } from "react-router-dom"

import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useAuth } from "@/context/auth"
import { useBuyerOrders } from "@/context/buyer-orders"
import { useMockData } from "@/context/mock-data"
import { useSellerStore } from "@/context/seller"
import { formatRupiah } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/pages/Account.module.css"

function AccountPage() {
  const { user } = useAuth()
  const { accountTransactions } = useBuyerOrders()
  const { inboxThreads } = useMockData()
  const { currentSellerListings, currentStoreProfile, sellerSummary } = useSellerStore()

  if (!user) {
    return null
  }

  const activeDeliveries = accountTransactions.filter((transaction) => transaction.status !== "Delivered").length
  const unreadThreads = inboxThreads.filter((thread) => thread.unread).length

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/" label="Back" />}
          description="Manage your account, monitor deliveries, and keep up with seller and support conversations."
          label="Account"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{accountTransactions.length} orders</Badge>
              <Badge variant="outline">{activeDeliveries} active deliveries</Badge>
              <Badge variant="outline">{unreadThreads} unread threads</Badge>
            </div>
          }
          title={`Hello, ${user.name}`}
        />

        <main className={styles.dashboardLayout}>
          <section className={styles.mainColumn}>
            <Card className={styles.panelCard}>
              <CardHeader className={styles.panelHeader}>
                <div className={styles.identityRow}>
                  <div className={styles.avatarBadge}>{user.avatarInitials}</div>
                  <div>
                    <CardTitle className={styles.panelTitle}>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={styles.panelBody}>
                <div className={styles.identityMetaGrid}>
                  <Card className={styles.metricCard} size="sm">
                    <CardContent className={styles.metricBody}>
                      <p className={styles.metricLabel}>Phone</p>
                      <p className={styles.metricValue}>{user.phone || "Not set"}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricCard} size="sm">
                    <CardContent className={styles.metricBody}>
                      <p className={styles.metricLabel}>Most recent order</p>
                      <p className={styles.metricValue}>{accountTransactions[0]?.id}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricCard} size="sm">
                    <CardContent className={styles.metricBody}>
                      <p className={styles.metricLabel}>Unread inbox</p>
                      <p className={styles.metricValue}>{unreadThreads} conversations</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricCard}>
                    <CardContent className={styles.metricBody}>
                      <p className={styles.metricLabel}>Orders placed</p>
                      <p className={styles.metricValue}>{accountTransactions.length}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricCard}>
                    <CardContent className={styles.metricBody}>
                      <p className={styles.metricLabel}>Deliveries in progress</p>
                      <p className={styles.metricValue}>{activeDeliveries}</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.metricCard}>
                    <CardContent className={styles.metricBody}>
                      <p className={styles.metricLabel}>Unread inbox threads</p>
                      <p className={styles.metricValue}>{unreadThreads}</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className={styles.linkGrid}>
              <Card className={styles.linkCard}>
                <CardHeader className={styles.panelHeader}>
                  <div className={styles.linkIconWrap}>
                    <ReceiptText className={styles.icon} />
                  </div>
                  <div>
                    <CardTitle className={styles.panelTitle}>Transactions</CardTitle>
                    <CardDescription>Open your order history, totals, and delivery progress.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className={styles.linkBody}>
                  <Button asChild type="button">
                    <Link to="/account/transactions">
                      View transactions
                      <ArrowRight className={styles.icon} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className={styles.linkCard}>
                <CardHeader className={styles.panelHeader}>
                  <div className={styles.linkIconWrap}>
                    <Settings2 className={styles.icon} />
                  </div>
                  <div>
                    <CardTitle className={styles.panelTitle}>Account settings</CardTitle>
                    <CardDescription>Review identity, address, payment, and security controls.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className={styles.linkBody}>
                  <Button asChild type="button" variant="secondary">
                    <Link to="/account/settings">
                      Open settings
                      <ArrowRight className={styles.icon} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className={styles.linkCard}>
                <CardHeader className={styles.panelHeader}>
                  <div className={styles.linkIconWrap}>
                    <Mail className={styles.icon} />
                  </div>
                  <div>
                    <CardTitle className={styles.panelTitle}>Inbox</CardTitle>
                    <CardDescription>Read updates from sellers and TaniLink support in one place.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className={styles.linkBody}>
                  <Button asChild type="button" variant="outline">
                    <Link to="/account/inbox">
                      Open inbox
                      <ArrowRight className={styles.icon} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

            </div>
          </section>

          <aside className={styles.sidebarColumn}>
            {user.role === "seller" ? (
              <Card className={styles.panelCard}>
                <CardHeader className={styles.panelHeader}>
                  <div className={styles.linkIconWrap}>
                    <LayoutDashboard className={styles.icon} />
                  </div>
                  <div>
                    <CardTitle className={styles.panelTitle}>Seller hub</CardTitle>
                    <CardDescription>
                      Review store analytics, then open ingredient pages for detailed listing controls and sales performance.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className={styles.panelBody}>
                  {currentStoreProfile ? (
                    <div className={styles.sectionBlock}>
                      <p className={styles.sideListTitle}>{currentStoreProfile.storeName}</p>
                      <p className={styles.sideListCopy}>{currentStoreProfile.description}</p>
                      <div className={styles.badgeRow}>
                        <Badge variant="outline">{currentStoreProfile.locations.length} locations</Badge>
                        <Badge variant="outline">{currentStoreProfile.deliveryOptions.length} delivery options</Badge>
                        <Badge variant="outline">{currentSellerListings.length} total listings</Badge>
                      </div>
                    </div>
                  ) : null}

                  {sellerSummary ? (
                    <div className={styles.sellerSummaryGrid}>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Active listings</p>
                          <p className={styles.metricValue}>{sellerSummary.activeListings}</p>
                        </CardContent>
                      </Card>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Orders this month</p>
                          <p className={styles.metricValue}>{sellerSummary.ordersThisMonth}</p>
                        </CardContent>
                      </Card>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Pending payout</p>
                          <p className={styles.metricValue}>{formatRupiah(sellerSummary.pendingPayout)}</p>
                        </CardContent>
                      </Card>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Gross revenue</p>
                          <p className={styles.metricValue}>{formatRupiah(sellerSummary.grossRevenue)}</p>
                        </CardContent>
                      </Card>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Average order value</p>
                          <p className={styles.metricValue}>{formatRupiah(sellerSummary.averageOrderValue)}</p>
                        </CardContent>
                      </Card>
                      <Card className={styles.metricCard} size="sm">
                        <CardContent className={styles.metricBody}>
                          <p className={styles.metricLabel}>Low stock alerts</p>
                          <p className={styles.metricValue}>{sellerSummary.lowStockCount}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : null}

                  <div className={styles.buttonGrid}>
                    <Button asChild type="button" variant="secondary">
                      <Link to="/seller">
                        Open seller hub
                        <ArrowRight className={styles.icon} />
                      </Link>
                    </Button>
                    <Button asChild type="button" variant="outline">
                      <Link to="/seller/store">
                        Open store setup
                        <ArrowRight className={styles.icon} />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className={styles.panelCard}>
              <CardHeader className={styles.panelHeader}>
                <div className={styles.linkIconWrap}>
                  <Truck className={styles.icon} />
                </div>
                <div>
                  <CardTitle className={styles.panelTitle}>Delivery focus</CardTitle>
                  <CardDescription>Stay on top of the orders that still need attention.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className={styles.panelBody}>
                <div className={styles.sideList}>
                  {accountTransactions.slice(0, 3).map((transaction) => (
                    <Card key={transaction.id} className={styles.sideListCard} size="sm">
                      <CardContent className={styles.sideListBody}>
                        <div className={styles.sideListHeader}>
                          <p className={styles.sideListTitle}>{transaction.id}</p>
                          <Badge variant={transaction.status === "Delivered" ? "success" : "warning"}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className={styles.sideListCopy}>{transaction.deliveryStatus}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={styles.panelCard}>
              <CardHeader className={styles.panelHeader}>
                <div className={styles.linkIconWrap}>
                  <UserRound className={styles.icon} />
                </div>
                <div>
                  <CardTitle className={styles.panelTitle}>Account identity</CardTitle>
                  <CardDescription>Your active account details are ready across basket, orders, and inbox.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className={styles.panelBody}>
                <p className={styles.sideListTitle}>{user.name}</p>
                <p className={styles.sideListCopy}>{user.email}</p>
                <p className={styles.sideListCopy}>{user.phone || "Phone not added yet"}</p>
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default AccountPage
