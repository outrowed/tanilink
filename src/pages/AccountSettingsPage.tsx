import { useNavigate } from "react-router-dom"

import PageSurface, { PageSection } from "@/components/layout/PageSurface"
import BackButton from "@/components/shared/BackButton"
import PageHeader from "@/components/shared/PageHeader"
import { useAuth } from "@/context/auth"
import { useMockData } from "@/context/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "@/pages/Account.module.css"

function AccountSettingsPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { settingsSections } = useMockData()

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate("/auth", { replace: true })
  }

  return (
    <PageSurface>
      <PageHeader
        action={<BackButton fallbackTo="/account" label="Back" />}
        description="Review account controls, delivery preferences, payment setup, and security actions from one page."
        label="Settings"
        meta={<Badge variant="outline">{settingsSections.length} setting groups</Badge>}
        title="Account management"
      />

      <PageSection as="main" className={styles.singleColumnLayout}>
        <div className={styles.settingsGrid}>
            {settingsSections.map((section) => (
              <Card key={section.id} className={styles.panelCard}>
                <CardHeader className={styles.panelHeader}>
                  <CardTitle className={styles.panelTitle}>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className={styles.panelBody}>
                  <div className={styles.buttonGrid}>
                    {section.actions.map((action) => (
                      <Button key={action} type="button" variant="outline">
                        {action}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className={styles.panelCard}>
              <CardHeader className={styles.panelHeader}>
                <CardTitle className={styles.panelTitle}>Session</CardTitle>
                <CardDescription>End the current session if you want to return to the signed-out experience.</CardDescription>
              </CardHeader>
              <CardContent className={styles.panelBody}>
                <div className={styles.logoutRow}>
                  <div>
                    <p className={styles.selectionTitle}>{user.name}</p>
                    <p className={styles.selectionMeta}>{user.email}</p>
                  </div>
                  <Button onClick={handleLogout} type="button" variant="destructive">
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      </PageSection>
    </PageSurface>
  )
}

export default AccountSettingsPage
