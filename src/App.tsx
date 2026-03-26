import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import RequireAuth from "@/components/shared/RequireAuth"
import { AuthProvider } from "@/context/AuthProvider"
import { BasketProvider } from "@/context/BasketProvider"
import AppLayout from "@/components/layout/AppLayout"
import AccountInboxPage from "@/pages/AccountInboxPage"
import AccountPage from "@/pages/AccountPage"
import AccountSettingsPage from "@/pages/AccountSettingsPage"
import AccountTransactionsPage from "@/pages/AccountTransactionsPage"
import AuthPage from "@/pages/AuthPage"
import BasketPage from "@/pages/BasketPage"
import Dashboard from "@/pages/Dashboard"
import PlannerLanding from "@/pages/PlannerLanding"
import ProductPage from "@/pages/ProductPage"
import SearchPlanner from "@/pages/SearchPlanner"

function App() {
  const location = useLocation()

  return (
    <main>
      <AuthProvider>
        <BasketProvider>
          <Routes>
            <Route element={<AppLayout />} path="/">
              <Route element={<PlannerLanding />} index />
              <Route element={<AuthPage />} path="auth" />
              <Route element={<Dashboard />} path="catalog" />
              <Route element={<BasketPage />} path="basket" />
              <Route element={<ProductPage />} path="products/:slug" />
              <Route element={<Navigate replace to="/" />} path="planner" />
              <Route element={<SearchPlanner key={location.search} />} path="search" />
              <Route element={<RequireAuth />} path="account">
                <Route element={<AccountPage />} index />
                <Route element={<AccountTransactionsPage />} path="transactions" />
                <Route element={<AccountSettingsPage />} path="settings" />
                <Route element={<AccountInboxPage />} path="inbox" />
              </Route>
            </Route>
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </BasketProvider>
      </AuthProvider>
    </main>
  )
}

export default App
