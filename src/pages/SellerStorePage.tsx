import { useMemo, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"

import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useMarketplace, useSellerStore } from "@/context/seller"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import styles from "@/pages/Seller.module.css"

function SellerStorePage() {
  const {
    addDeliveryOption,
    addLocation,
    createListing,
    currentSellerListings,
    currentStoreProfile,
    marketplaceProducts,
    removeDeliveryOption,
    removeLocation,
    updateDeliveryOption,
    updateLocation,
    updateStoreProfile,
  } = useSellerStore()
  const { getProductBySlug } = useMarketplace()
  const [profileDraft, setProfileDraft] = useState(() => ({
    contactPhone: currentStoreProfile?.contactPhone ?? "",
    description: currentStoreProfile?.description ?? "",
    ownerName: currentStoreProfile?.ownerName ?? "",
    storeName: currentStoreProfile?.storeName ?? "",
  }))
  const [locationDraft, setLocationDraft] = useState({
    address: "",
    area: "",
    city: "",
    label: "",
    province: "",
  })
  const [deliveryDraft, setDeliveryDraft] = useState({
    description: "",
    label: "",
    leadTime: "",
  })
  const [listingDraft, setListingDraft] = useState(() => ({
    deliveryOptionIds: currentStoreProfile?.deliveryOptions[0] ? [currentStoreProfile.deliveryOptions[0].id] : [],
    handlingTime: "Prepared within 3 hours",
    price: "",
    productSlug: marketplaceProducts[0]?.slug ?? "",
    stockLabel: "",
    stockQuantity: "",
    warehouseLocationId: currentStoreProfile?.locations[0]?.id ?? "",
  }))
  const [listingMessage, setListingMessage] = useState("")

  const registeredProductSlugs = useMemo(
    () => new Set(currentSellerListings.map((listing) => listing.productSlug)),
    [currentSellerListings]
  )

  if (!currentStoreProfile) {
    return null
  }

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateStoreProfile(profileDraft)
  }

  const handleAddLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addLocation(locationDraft)
    setLocationDraft({
      address: "",
      area: "",
      city: "",
      label: "",
      province: "",
    })
  }

  const handleAddDeliveryOption = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addDeliveryOption(deliveryDraft)
    setDeliveryDraft({
      description: "",
      label: "",
      leadTime: "",
    })
  }

  const handleRegisterListing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = createListing({
      deliveryOptionIds: listingDraft.deliveryOptionIds,
      handlingTime: listingDraft.handlingTime,
      price: Number(listingDraft.price),
      productSlug: listingDraft.productSlug as (typeof marketplaceProducts)[number]["slug"],
      stockLabel: listingDraft.stockLabel,
      stockQuantity: Number(listingDraft.stockQuantity),
      warehouseLocationId: listingDraft.warehouseLocationId,
    })

    if (!result) {
      return
    }

    const selectedProduct = getProductBySlug(listingDraft.productSlug as (typeof marketplaceProducts)[number]["slug"])
    setListingMessage(
      result.status === "created"
        ? `${selectedProduct?.name ?? "Listing"} was added to your seller hub.`
        : `${selectedProduct?.name ?? "Listing"} already existed, so the current seller listing was updated instead.`
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          action={<BackButton fallbackTo="/seller" label="Back" />}
          description="Configure your store identity, warehouse coverage, delivery options, and ingredient listings used in the public marketplace."
          label="Store setup"
          meta={
            <div className={styles.headerMeta}>
              <Badge variant="outline">{currentStoreProfile.locations.length} locations</Badge>
              <Badge variant="outline">{currentStoreProfile.deliveryOptions.length} delivery options</Badge>
            </div>
          }
          title="Store profile and listing registration"
        />

        <main className={styles.gridLayout}>
          <section className={styles.mainColumn}>
            <Card className={styles.surfaceCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.surfaceTitle}>Store profile</CardTitle>
                <CardDescription>Set the store identity and contact information used across seller-facing pages.</CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <form className={styles.formStack} onSubmit={handleProfileSubmit}>
                  <div className={styles.formGrid}>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Store name</span>
                      <Input
                        onChange={(event) => setProfileDraft((current) => ({ ...current, storeName: event.target.value }))}
                        type="text"
                        value={profileDraft.storeName}
                      />
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Owner name</span>
                      <Input
                        onChange={(event) => setProfileDraft((current) => ({ ...current, ownerName: event.target.value }))}
                        type="text"
                        value={profileDraft.ownerName}
                      />
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Contact phone</span>
                      <Input
                        onChange={(event) =>
                          setProfileDraft((current) => ({ ...current, contactPhone: event.target.value }))
                        }
                        type="tel"
                        value={profileDraft.contactPhone}
                      />
                    </label>
                  </div>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Store description</span>
                    <textarea
                      className={styles.textarea}
                      onChange={(event) =>
                        setProfileDraft((current) => ({ ...current, description: event.target.value }))
                      }
                      rows={4}
                      value={profileDraft.description}
                    />
                  </label>
                  <div className={styles.inlineActions}>
                    <Button type="submit">Save store profile</Button>
                    <Button asChild type="button" variant="outline">
                      <Link to="/seller">Return to seller hub</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className={styles.surfaceCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.surfaceTitle}>Register ingredient listing</CardTitle>
                <CardDescription>Attach your store to an existing marketplace ingredient and publish seller-specific pricing, stock, and delivery details.</CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                {listingMessage ? <div className={styles.noticeBanner}>{listingMessage}</div> : null}
                <form className={styles.formStack} onSubmit={handleRegisterListing}>
                  <div className={styles.formGrid}>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Ingredient</span>
                      <select
                        className={styles.select}
                        onChange={(event) =>
                          setListingDraft((current) => ({ ...current, productSlug: event.target.value }))
                        }
                        value={listingDraft.productSlug}
                      >
                        {marketplaceProducts.map((product) => (
                          <option key={product.slug} value={product.slug}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Price</span>
                      <Input
                        onChange={(event) => setListingDraft((current) => ({ ...current, price: event.target.value }))}
                        type="number"
                        value={listingDraft.price}
                      />
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Stock quantity</span>
                      <Input
                        onChange={(event) =>
                          setListingDraft((current) => ({ ...current, stockQuantity: event.target.value }))
                        }
                        type="number"
                        value={listingDraft.stockQuantity}
                      />
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Warehouse location</span>
                      <select
                        className={styles.select}
                        onChange={(event) =>
                          setListingDraft((current) => ({ ...current, warehouseLocationId: event.target.value }))
                        }
                        value={listingDraft.warehouseLocationId}
                      >
                        {currentStoreProfile.locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.label} · {location.city}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Stock label</span>
                    <Input
                      onChange={(event) => setListingDraft((current) => ({ ...current, stockLabel: event.target.value }))}
                      type="text"
                      value={listingDraft.stockLabel}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Handling time</span>
                    <Input
                      onChange={(event) =>
                        setListingDraft((current) => ({ ...current, handlingTime: event.target.value }))
                      }
                      type="text"
                      value={listingDraft.handlingTime}
                    />
                  </label>
                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Delivery options</span>
                    <div className={styles.checkboxGrid}>
                      {currentStoreProfile.deliveryOptions.map((option) => {
                        const isChecked = listingDraft.deliveryOptionIds.includes(option.id)

                        return (
                          <label key={option.id} className={styles.checkboxOption}>
                            <input
                              checked={isChecked}
                              onChange={(event) =>
                                setListingDraft((current) => ({
                                  ...current,
                                  deliveryOptionIds: event.target.checked
                                    ? [...new Set([...current.deliveryOptionIds, option.id])]
                                    : current.deliveryOptionIds.filter((optionId) => optionId !== option.id),
                                }))
                              }
                              type="checkbox"
                            />
                            <span>{option.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div className={styles.inlineActions}>
                    <Button type="submit">
                      {registeredProductSlugs.has(listingDraft.productSlug) ? "Update existing listing" : "Register ingredient"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>

          <aside className={styles.sideColumn}>
            <Card className={styles.surfaceCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.surfaceTitle}>Warehouse locations</CardTitle>
                <CardDescription>Manage the pickup points and warehouse references attached to your listings.</CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <div className={styles.listStack}>
                  {currentStoreProfile.locations.map((location) => (
                    <Card key={location.id} className={styles.metricTile} size="sm">
                      <CardContent className={styles.metricTileBody}>
                        <div className={styles.formStack}>
                          <label className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Label</span>
                            <Input
                              onChange={(event) => updateLocation(location.id, { label: event.target.value })}
                              type="text"
                              value={location.label}
                            />
                          </label>
                          <div className={styles.formGrid}>
                            <label className={styles.fieldGroup}>
                              <span className={styles.fieldLabel}>Area</span>
                              <Input
                                onChange={(event) => updateLocation(location.id, { area: event.target.value })}
                                type="text"
                                value={location.area}
                              />
                            </label>
                            <label className={styles.fieldGroup}>
                              <span className={styles.fieldLabel}>City</span>
                              <Input
                                onChange={(event) => updateLocation(location.id, { city: event.target.value })}
                                type="text"
                                value={location.city}
                              />
                            </label>
                            <label className={styles.fieldGroup}>
                              <span className={styles.fieldLabel}>Province</span>
                              <Input
                                onChange={(event) => updateLocation(location.id, { province: event.target.value })}
                                type="text"
                                value={location.province}
                              />
                            </label>
                          </div>
                          <label className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Address</span>
                            <Input
                              onChange={(event) => updateLocation(location.id, { address: event.target.value })}
                              type="text"
                              value={location.address}
                            />
                          </label>
                          <Button
                            disabled={currentStoreProfile.locations.length <= 1}
                            onClick={() => removeLocation(location.id)}
                            type="button"
                            variant="outline"
                          >
                            Remove location
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <form className={styles.formStack} onSubmit={handleAddLocation}>
                  <div className={styles.formGrid}>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Label</span>
                      <Input
                        onChange={(event) => setLocationDraft((current) => ({ ...current, label: event.target.value }))}
                        type="text"
                        value={locationDraft.label}
                      />
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Area</span>
                      <Input
                        onChange={(event) => setLocationDraft((current) => ({ ...current, area: event.target.value }))}
                        type="text"
                        value={locationDraft.area}
                      />
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>City</span>
                      <Input
                        onChange={(event) => setLocationDraft((current) => ({ ...current, city: event.target.value }))}
                        type="text"
                        value={locationDraft.city}
                      />
                    </label>
                    <label className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>Province</span>
                      <Input
                        onChange={(event) =>
                          setLocationDraft((current) => ({ ...current, province: event.target.value }))
                        }
                        type="text"
                        value={locationDraft.province}
                      />
                    </label>
                  </div>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Address</span>
                    <Input
                      onChange={(event) => setLocationDraft((current) => ({ ...current, address: event.target.value }))}
                      type="text"
                      value={locationDraft.address}
                    />
                  </label>
                  <Button type="submit" variant="outline">
                    Add location
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className={styles.surfaceCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.surfaceTitle}>Delivery options</CardTitle>
                <CardDescription>Maintain reusable delivery modes that can be attached to your ingredient listings.</CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <div className={styles.listStack}>
                  {currentStoreProfile.deliveryOptions.map((option) => (
                    <Card key={option.id} className={styles.metricTile} size="sm">
                      <CardContent className={styles.metricTileBody}>
                        <div className={styles.formStack}>
                          <label className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Label</span>
                            <Input
                              onChange={(event) => updateDeliveryOption(option.id, { label: event.target.value })}
                              type="text"
                              value={option.label}
                            />
                          </label>
                          <label className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Lead time</span>
                            <Input
                              onChange={(event) => updateDeliveryOption(option.id, { leadTime: event.target.value })}
                              type="text"
                              value={option.leadTime}
                            />
                          </label>
                          <label className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Description</span>
                            <Input
                              onChange={(event) => updateDeliveryOption(option.id, { description: event.target.value })}
                              type="text"
                              value={option.description}
                            />
                          </label>
                          <Button
                            disabled={currentStoreProfile.deliveryOptions.length <= 1}
                            onClick={() => removeDeliveryOption(option.id)}
                            type="button"
                            variant="outline"
                          >
                            Remove delivery option
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <form className={styles.formStack} onSubmit={handleAddDeliveryOption}>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Label</span>
                    <Input
                      onChange={(event) => setDeliveryDraft((current) => ({ ...current, label: event.target.value }))}
                      type="text"
                      value={deliveryDraft.label}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Lead time</span>
                    <Input
                      onChange={(event) =>
                        setDeliveryDraft((current) => ({ ...current, leadTime: event.target.value }))
                      }
                      type="text"
                      value={deliveryDraft.leadTime}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Description</span>
                    <Input
                      onChange={(event) =>
                        setDeliveryDraft((current) => ({ ...current, description: event.target.value }))
                      }
                      type="text"
                      value={deliveryDraft.description}
                    />
                  </label>
                  <Button type="submit" variant="outline">
                    Add delivery option
                  </Button>
                </form>
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default SellerStorePage
