import { CheckCircle2, ChevronLeft, ChevronRight, CreditCard, MapPinned, PackageCheck, Truck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import PageSurface, { PageSection, StickySidebar } from "@/components/layout/PageSurface"
import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useAuth } from "@/context/auth"
import { useBasket } from "@/context/basket"
import { useBuyerOrders } from "@/context/buyer-orders"
import {
  deliveryMethodOptions,
  paymentMethodOptions,
  type CheckoutInput,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/lib/account"
import { formatRupiah } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import styles from "@/pages/CheckoutPage.module.css"

type CheckoutStep = "details" | "payment" | "review" | "success"

const checkoutSteps: Array<{ id: Exclude<CheckoutStep, "success">; label: string }> = [
  { id: "details", label: "Purchase details" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Delivery review" },
]

function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { basketLines, itemCount, lineCount, sellerCount, subtotal } = useBasket()
  const { createTransactionFromBasket } = useBuyerOrders()
  const [step, setStep] = useState<CheckoutStep>("details")
  const [errorMessage, setErrorMessage] = useState("")
  const [createdTransactionId, setCreatedTransactionId] = useState("")
  const [recipientName, setRecipientName] = useState(user?.name ?? "")
  const [recipientPhone, setRecipientPhone] = useState(user?.phone ?? "")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(deliveryMethodOptions[0].id)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethodOptions[0].id)

  const selectedDeliveryOption =
    deliveryMethodOptions.find((option) => option.id === deliveryMethod) ?? deliveryMethodOptions[0]
  const selectedPaymentOption =
    paymentMethodOptions.find((option) => option.id === paymentMethod) ?? paymentMethodOptions[0]
  const total = subtotal + selectedDeliveryOption.fee
  const sellerNames = useMemo(
    () => Array.from(new Set(basketLines.map((line) => line.sellerName))),
    [basketLines]
  )

  useEffect(() => {
    if (!createdTransactionId) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      navigate(`/account/transactions?selected=${encodeURIComponent(createdTransactionId)}`, { replace: true })
    }, 1800)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [createdTransactionId, navigate])

  if (!basketLines.length && step !== "success") {
    return <Navigate replace to="/basket" />
  }

  function validateDetailsStep() {
    if (!recipientName.trim() || !recipientPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage("Recipient, phone number, and delivery address are required before continuing.")
      return false
    }

    setErrorMessage("")
    return true
  }

  function handleNextStep() {
    if (step === "details") {
      if (!validateDetailsStep()) {
        return
      }

      setStep("payment")
      return
    }

    if (step === "payment") {
      if (!paymentMethod) {
        setErrorMessage("Choose a payment method before continuing.")
        return
      }

      setErrorMessage("")
      setStep("review")
    }
  }

  function handleBackStep() {
    setErrorMessage("")

    if (step === "review") {
      setStep("payment")
      return
    }

    if (step === "payment") {
      setStep("details")
    }
  }

  function handleConfirmOrder() {
    if (!validateDetailsStep()) {
      setStep("details")
      return
    }

    const result = createTransactionFromBasket({
      deliveryAddress,
      deliveryMethod,
      paymentMethod,
      recipientName,
      recipientPhone,
    } satisfies CheckoutInput)

    if (!result.ok || !result.transaction) {
      setErrorMessage(result.error ?? "Unable to complete this checkout.")
      return
    }

    setErrorMessage("")
    setCreatedTransactionId(result.transaction.id)
    setStep("success")
  }

  return (
    <PageSurface>
        <PageHeader
          action={<BackButton fallbackTo="/basket" label="Back" />}
          description="Complete the purchase details, confirm payment, and review delivery before placing the combined order."
          label="Checkout"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{lineCount} basket lines</Badge>
              <Badge variant="outline">{itemCount} total items</Badge>
              <Badge variant="outline">{sellerCount} sellers</Badge>
            </div>
          }
          title="Checkout and delivery review"
        />

        {step === "success" ? (
          <PageSection as="main" className={styles.successLayout}>
            <Card className={styles.successCard}>
              <CardContent className={styles.successBody}>
                <div className={styles.successIconWrap}>
                  <CheckCircle2 className={styles.successIcon} />
                </div>
                <p className={styles.stepEyebrow}>Purchase confirmed</p>
                <h2 className={styles.successTitle}>Your order is now waiting for seller confirmation</h2>
                <p className={styles.successCopy}>
                  TaniLink has recorded the payment and created order <strong>{createdTransactionId}</strong>. You
                  will be redirected to the delivery tracking view automatically.
                </p>
                <div className={styles.successActions}>
                  <Button asChild type="button">
                    <Link to={`/account/transactions?selected=${encodeURIComponent(createdTransactionId)}`}>
                      Open transaction detail
                    </Link>
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link to="/marketplace">Continue browsing marketplace</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PageSection>
        ) : (
          <PageSection as="main" className={styles.layout}>
            <section className={styles.mainColumn}>
              <Card className={styles.wizardCard}>
                <CardHeader className={styles.surfaceHeader}>
                  <div className={styles.stepper}>
                    {checkoutSteps.map((checkoutStep, index) => {
                      const isDone =
                        checkoutSteps.findIndex((item) => item.id === step) > index
                      const isActive = checkoutStep.id === step

                      return (
                        <div
                          key={checkoutStep.id}
                          className={cn(
                            styles.stepPill,
                            isActive && styles.stepPillActive,
                            isDone && styles.stepPillDone
                          )}
                        >
                          <span className={styles.stepNumber}>{index + 1}</span>
                          <span>{checkoutStep.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardHeader>

                <CardContent className={styles.surfaceBody}>
                  {errorMessage ? <div className={styles.errorBanner}>{errorMessage}</div> : null}

                  {step === "details" ? (
                    <div className={styles.formStack}>
                      <div className={styles.sectionIntro}>
                        <MapPinned className={styles.sectionIcon} />
                        <div>
                          <p className={styles.sectionTitle}>Delivery contact and address</p>
                          <p className={styles.sectionCopy}>
                            Set the recipient and order-level delivery option that should be applied to this basket.
                          </p>
                        </div>
                      </div>

                      <div className={styles.formGrid}>
                        <label className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>Recipient name</span>
                          <Input
                            onChange={(event) => setRecipientName(event.target.value)}
                            placeholder="Recipient name"
                            type="text"
                            value={recipientName}
                          />
                        </label>
                        <label className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>Phone number</span>
                          <Input
                            onChange={(event) => setRecipientPhone(event.target.value)}
                            placeholder="+62 812 ..."
                            type="tel"
                            value={recipientPhone}
                          />
                        </label>
                      </div>

                      <label className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Delivery address</span>
                        <textarea
                          className={styles.textarea}
                          onChange={(event) => setDeliveryAddress(event.target.value)}
                          placeholder="Street, district, city, building notes, or kitchen receiving instructions"
                          rows={5}
                          value={deliveryAddress}
                        />
                      </label>

                      <div className={styles.optionSection}>
                        <p className={styles.fieldLabel}>Delivery option</p>
                        <div className={styles.optionGrid}>
                          {deliveryMethodOptions.map((option) => (
                            <button
                              key={option.id}
                              className={cn(
                                styles.optionCard,
                                option.id === deliveryMethod && styles.optionCardActive
                              )}
                              onClick={() => setDeliveryMethod(option.id)}
                              type="button"
                            >
                              <div className={styles.optionHeader}>
                                <p className={styles.optionTitle}>{option.label}</p>
                                <Badge variant={option.id === deliveryMethod ? "secondary" : "outline"}>
                                  {formatRupiah(option.fee)}
                                </Badge>
                              </div>
                              <p className={styles.optionCopy}>{option.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {step === "payment" ? (
                    <div className={styles.formStack}>
                      <div className={styles.sectionIntro}>
                        <CreditCard className={styles.sectionIcon} />
                        <div>
                          <p className={styles.sectionTitle}>Payment method</p>
                          <p className={styles.sectionCopy}>
                            Choose how this combined basket purchase should be confirmed at checkout.
                          </p>
                        </div>
                      </div>

                      <div className={styles.optionGrid}>
                        {paymentMethodOptions.map((option) => (
                          <button
                            key={option.id}
                            className={cn(
                              styles.optionCard,
                              option.id === paymentMethod && styles.optionCardActive
                            )}
                            onClick={() => setPaymentMethod(option.id)}
                            type="button"
                          >
                            <div className={styles.optionHeader}>
                              <p className={styles.optionTitle}>{option.label}</p>
                              <Badge variant={option.id === paymentMethod ? "secondary" : "outline"}>
                                Selected
                              </Badge>
                            </div>
                            <p className={styles.optionCopy}>{option.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {step === "review" ? (
                    <div className={styles.formStack}>
                      <div className={styles.sectionIntro}>
                        <Truck className={styles.sectionIcon} />
                        <div>
                          <p className={styles.sectionTitle}>Delivery review</p>
                          <p className={styles.sectionCopy}>
                            Confirm the payment, delivery route, and basket lines before creating the transaction.
                          </p>
                        </div>
                      </div>

                      <div className={styles.reviewGrid}>
                        <Card className={styles.reviewTile} size="sm">
                          <CardContent className={styles.reviewTileBody}>
                            <p className={styles.fieldLabel}>Recipient</p>
                            <p className={styles.reviewValue}>{recipientName}</p>
                            <p className={styles.reviewMeta}>{recipientPhone}</p>
                          </CardContent>
                        </Card>
                        <Card className={styles.reviewTile} size="sm">
                          <CardContent className={styles.reviewTileBody}>
                            <p className={styles.fieldLabel}>Payment</p>
                            <p className={styles.reviewValue}>{selectedPaymentOption.label}</p>
                            <p className={styles.reviewMeta}>{selectedPaymentOption.description}</p>
                          </CardContent>
                        </Card>
                        <Card className={styles.reviewTile} size="sm">
                          <CardContent className={styles.reviewTileBody}>
                            <p className={styles.fieldLabel}>Delivery</p>
                            <p className={styles.reviewValue}>{selectedDeliveryOption.label}</p>
                            <p className={styles.reviewMeta}>{selectedDeliveryOption.description}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className={styles.addressCard} size="sm">
                        <CardContent className={styles.addressBody}>
                          <p className={styles.fieldLabel}>Delivery address</p>
                          <p className={styles.addressValue}>{deliveryAddress}</p>
                        </CardContent>
                      </Card>

                      <div className={styles.sellerBadgeRow}>
                        {sellerNames.map((sellerName) => (
                          <Badge key={sellerName} variant="outline">
                            {sellerName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className={styles.actionRow}>
                    <Button
                      disabled={step === "details"}
                      onClick={handleBackStep}
                      type="button"
                      variant="outline"
                    >
                      <ChevronLeft className={styles.inlineIcon} />
                      Back
                    </Button>

                    {step !== "review" ? (
                      <Button onClick={handleNextStep} type="button">
                        Continue
                        <ChevronRight className={styles.inlineIcon} />
                      </Button>
                    ) : (
                      <Button onClick={handleConfirmOrder} type="button">
                        <PackageCheck className={styles.inlineIcon} />
                        Confirm purchase
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            <StickySidebar className={styles.summaryColumn}>
              <Card className={styles.summaryCard}>
                <CardHeader className={styles.surfaceHeader}>
                  <CardTitle className={styles.surfaceTitle}>Order summary</CardTitle>
                  <CardDescription>Basket lines selected for this combined purchase.</CardDescription>
                </CardHeader>
                <CardContent className={styles.surfaceBody}>
                  <div className={styles.lineList}>
                    {basketLines.map((line) => (
                      <div className={styles.summaryLine} key={line.id}>
                        <div className={styles.summaryLinePrimary}>
                          <div className={styles.iconBadge}>{line.productIcon}</div>
                          <div>
                            <p className={styles.summaryLineTitle}>{line.productName}</p>
                            <p className={styles.summaryLineMeta}>
                              {line.quantity} x {line.unit} · {line.sellerName}
                            </p>
                          </div>
                        </div>
                        <p className={styles.summaryLineValue}>
                          {formatRupiah(line.quantity * line.sellerPrice)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className={styles.totalsStack}>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.fieldLabel}>Subtotal</p>
                        <p className={styles.summaryValue}>{formatRupiah(subtotal)}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.fieldLabel}>Delivery fee</p>
                        <p className={styles.summaryValue}>{formatRupiah(selectedDeliveryOption.fee)}</p>
                      </CardContent>
                    </Card>
                    <Card className={styles.metricCard} size="sm">
                      <CardContent className={styles.metricBody}>
                        <p className={styles.fieldLabel}>Total</p>
                        <p className={styles.summaryValue}>{formatRupiah(total)}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className={styles.summaryFooter}>
                    <p className={styles.summaryFootnote}>
                      This checkout creates one combined order with a single payment and delivery review path.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </StickySidebar>
          </PageSection>
        )}
    </PageSurface>
  )
}

export default CheckoutPage
