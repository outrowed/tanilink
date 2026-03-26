import { X } from "lucide-react"
import { useState } from "react"
import { Outlet } from "react-router-dom"

import AppNavbar from "@/components/layout/AppNavbar"
import { Button } from "@/components/ui/button"
import styles from "@/components/layout/AppLayout.module.css"

const WARNING_STORAGE_KEY = "tanilink:preview-warning-dismissed"

function AppLayout() {
  const [isWarningVisible, setIsWarningVisible] = useState(() => {
    if (typeof window === "undefined") {
      return true
    }

    return window.localStorage.getItem(WARNING_STORAGE_KEY) !== "true"
  })

  const handleDismissWarning = () => {
    setIsWarningVisible(false)
    window.localStorage.setItem(WARNING_STORAGE_KEY, "true")
  }

  return (
    <>
      {isWarningVisible ? (
        <div className={styles.warningBar}>
          <div className={styles.warningInner}>
            <p className={styles.warningCopy}>
              Preview UI only. Ordering, pricing, and fulfillment actions shown here are for interface review.
            </p>
            <Button onClick={handleDismissWarning} size="icon" type="button" variant="ghost">
              <X className={styles.warningIcon} />
            </Button>
          </div>
        </div>
      ) : null}
      <AppNavbar />
      <Outlet />
    </>
  )
}

export default AppLayout
