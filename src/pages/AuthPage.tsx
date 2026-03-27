import { useState, type FormEvent } from "react"
import { KeyRound, Sparkles, UserRound } from "lucide-react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"

import PageSurface, { PageSection } from "@/components/layout/PageSurface"
import PageHeader from "@/components/shared/PageHeader"
import { useAuth } from "@/context/auth"
import { useMockData } from "@/context/mock-data"
import { type StoredAccount } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import styles from "@/pages/AuthPage.module.css"

type AuthMode = "login" | "signup"

function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, login, signup } = useAuth()
  const { presetAccounts } = useMockData()
  const redirectTo = searchParams.get("redirect") || "/account"
  const defaultMode = searchParams.get("mode") === "signup" ? "signup" : "login"
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [errorMessage, setErrorMessage] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  if (isAuthenticated) {
    return <Navigate replace to={redirectTo} />
  }

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode)
    setErrorMessage("")
  }

  const handlePresetFill = (account: StoredAccount) => {
    setLoginEmail(account.email)
    setLoginPassword(account.password)
    setMode("login")
    setErrorMessage("")
  }

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = login(loginEmail, loginPassword)

    if (!result.ok) {
      setErrorMessage(result.error ?? "Unable to sign in.")
      return
    }

    navigate(redirectTo, { replace: true })
  }

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = signup({
      email: signupEmail,
      name: signupName,
      password: signupPassword,
      phone: signupPhone,
    })

    if (!result.ok) {
      setErrorMessage(result.error ?? "Unable to create your account.")
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <PageSurface>
      <PageHeader
        description="Sign in to access your buyer account or seller tools, including orders, inventory, inbox, and store management."
        label="Account access"
        meta={
          <div className={styles.headerMeta}>
            <Badge variant="outline">Account hub</Badge>
            <Badge variant="info">Buyer and seller access</Badge>
          </div>
        }
        title="Welcome to your TaniLink account"
      />

      <PageSection as="main" className={styles.layout}>
        <section className={styles.cardStack}>
            <Card className={styles.introCard}>
              <CardHeader className={styles.surfaceHeader}>
                <div className={styles.eyebrowRow}>
                  <Badge variant="secondary">
                    <Sparkles className={styles.smallIcon} />
                    Signed-in experience
                  </Badge>
                </div>
                <CardTitle className={styles.surfaceTitle}>Everything you need after purchase</CardTitle>
                <CardDescription>
                  Open your account to review transactions, follow delivery progress, coordinate with sellers, or
                  manage your own ingredient store.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <div className={styles.featureGrid}>
                  <Card className={styles.infoTile} size="sm">
                    <CardContent className={styles.infoTileBody}>
                      <p className={styles.tileTitle}>Transactions</p>
                      <p className={styles.tileCopy}>Track your orders, totals, and seller history.</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.infoTile} size="sm">
                    <CardContent className={styles.infoTileBody}>
                      <p className={styles.tileTitle}>Delivery status</p>
                      <p className={styles.tileCopy}>Follow every warehouse, courier, and handoff step.</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.infoTile} size="sm">
                    <CardContent className={styles.infoTileBody}>
                      <p className={styles.tileTitle}>Inbox</p>
                      <p className={styles.tileCopy}>Keep seller updates and support conversations in one place.</p>
                    </CardContent>
                  </Card>
                  <Card className={styles.infoTile} size="sm">
                    <CardContent className={styles.infoTileBody}>
                      <p className={styles.tileTitle}>Seller hub</p>
                      <p className={styles.tileCopy}>Register ingredients, set prices, and manage store locations.</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className={styles.credentialCard}>
              <CardHeader className={styles.surfaceHeader}>
                <CardTitle className={styles.credentialTitle}>Preset accounts</CardTitle>
                <CardDescription>Use one of the preset accounts below to open either the buyer pages or the seller hub immediately.</CardDescription>
              </CardHeader>
              <CardContent className={styles.surfaceBody}>
                <div className={styles.presetList}>
                  {presetAccounts.map((account) => (
                    <Card key={account.id} className={styles.presetCard} size="sm">
                      <CardContent className={styles.presetBody}>
                        <div className={styles.presetTopRow}>
                          <div>
                            <p className={styles.credentialValue}>{account.name}</p>
                            <p className={styles.presetCopy}>{account.email}</p>
                          </div>
                          <Badge variant={account.role === "seller" ? "warning" : "outline"}>{account.role}</Badge>
                        </div>
                        <div className={styles.credentialGrid}>
                          <div>
                            <p className={styles.fieldLabel}>Email</p>
                            <p className={styles.presetCopy}>{account.email}</p>
                          </div>
                          <div>
                            <p className={styles.fieldLabel}>Password</p>
                            <p className={styles.presetCopy}>{account.password}</p>
                          </div>
                        </div>
                        <Button onClick={() => handlePresetFill(account)} type="button" variant="outline">
                          Fill {account.role} account
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

        <Card className={styles.authCard}>
            <CardHeader className={styles.surfaceHeader}>
              <div className={styles.modeRow}>
                <Button
                  onClick={() => handleModeChange("login")}
                  type="button"
                  variant={mode === "login" ? "default" : "outline"}
                >
                  <KeyRound className={styles.smallIcon} />
                  Login
                </Button>
                <Button
                  onClick={() => handleModeChange("signup")}
                  type="button"
                  variant={mode === "signup" ? "default" : "outline"}
                >
                  <UserRound className={styles.smallIcon} />
                  Sign up
                </Button>
              </div>
              <CardTitle className={styles.surfaceTitle}>
                {mode === "login" ? "Sign in to your account" : "Create a new account"}
              </CardTitle>
              <CardDescription>
                {mode === "login"
                  ? "Use your account email and password to continue."
                  : "Create an account to save your session and access the account pages."}
              </CardDescription>
            </CardHeader>

            <CardContent className={styles.authBody}>
              {errorMessage ? <div className={styles.errorBanner}>{errorMessage}</div> : null}

              {mode === "login" ? (
                <form className={styles.form} onSubmit={handleLogin}>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Email</span>
                    <Input
                      onChange={(event) => setLoginEmail(event.target.value)}
                      placeholder="you@tanilink.id"
                      type="email"
                      value={loginEmail}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Password</span>
                    <Input
                      onChange={(event) => setLoginPassword(event.target.value)}
                      placeholder="Enter your password"
                      type="password"
                      value={loginPassword}
                    />
                  </label>
                  <Button type="submit">Sign in</Button>
                </form>
              ) : (
                <form className={styles.form} onSubmit={handleSignup}>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Full name</span>
                    <Input
                      onChange={(event) => setSignupName(event.target.value)}
                      placeholder="Your full name"
                      type="text"
                      value={signupName}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Email</span>
                    <Input
                      onChange={(event) => setSignupEmail(event.target.value)}
                      placeholder="you@tanilink.id"
                      type="email"
                      value={signupEmail}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Phone number</span>
                    <Input
                      onChange={(event) => setSignupPhone(event.target.value)}
                      placeholder="+62 812 ..."
                      type="tel"
                      value={signupPhone}
                    />
                  </label>
                  <label className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Password</span>
                    <Input
                      onChange={(event) => setSignupPassword(event.target.value)}
                      placeholder="Create a password"
                      type="password"
                      value={signupPassword}
                    />
                  </label>
                  <Button type="submit">Create account</Button>
                </form>
              )}
            </CardContent>
        </Card>
      </PageSection>
    </PageSurface>
  )
}

export default AuthPage
