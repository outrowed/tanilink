import SearchBox from "@/components/shared/SearchBox"
import { useLocationPreference } from "@/context/location"
import styles from "@/pages/PlannerLanding.module.css"

function PlannerLanding() {
  const { currentLocation } = useLocationPreference()

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>AI-based marketplace & ingredients planner</p>
          <h1 className={styles.title}>Search for dishes, menus, or kitchen supply bundles</h1>
          <p className={styles.copy}>
            Describe what you want to cook or stock up on. TaniLink will turn it into ingredients,
            recommended sellers, and routing suggestions for {currentLocation.area}.
          </p>

          <SearchBox
            alwaysShowSuggestions
            className={styles.searchShell}
            defaultMode="marketplace"
            placeholder="Example: I want to cook nasi goreng for 20 portions"
            variant="hero"
          />
        </div>
      </div>
    </div>
  )
}

export default PlannerLanding
