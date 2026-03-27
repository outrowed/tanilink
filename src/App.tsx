import { Navigate, Route, Routes } from "react-router-dom"
import RequireAuth from "@/components/shared/RequireAuth"
import RequireSeller from "@/components/shared/RequireSeller"
import { AuthProvider } from "@/context/AuthProvider"
import { BasketProvider } from "@/context/BasketProvider"
import { BuyerOrdersProvider } from "@/context/BuyerOrdersProvider"
import { LocationProvider } from "@/context/LocationProvider"
import { MockDataProvider } from "@/context/MockDataProvider"
import AppLayout from "@/components/layout/AppLayout"
import AccountInboxPage from "@/pages/AccountInboxPage"
import AccountPage from "@/pages/AccountPage"
import AccountSettingsPage from "@/pages/AccountSettingsPage"
import AccountTransactionsPage from "@/pages/AccountTransactionsPage"
import AuthPage from "@/pages/AuthPage"
import BasketPage from "@/pages/BasketPage"
import CheckoutPage from "@/pages/CheckoutPage"
import Dashboard from "@/pages/Dashboard"
import PlannerLanding from "@/pages/PlannerLanding"
import ProductPage from "@/pages/ProductPage"
import SearchPlanner from "@/pages/SearchPlanner"
import SellerIngredientPage from "@/pages/SellerIngredientPage"
import SellerHubPage from "@/pages/SellerHubPage"
import SellerRoutingPage from "@/pages/SellerRoutingPage"
import SellerStorePage from "@/pages/SellerStorePage"
import { SellerProvider } from "@/context/SellerProvider"

function App() {
  return (
    <main>
      <MockDataProvider>
        <AuthProvider>
          <LocationProvider>
            <SellerProvider>
              <BasketProvider>
                <BuyerOrdersProvider>
                  <Routes>
                    <Route element={<AppLayout />} path="/">
                      <Route element={<PlannerLanding />} index />
                      <Route element={<AuthPage />} path="auth" />
                      <Route element={<Dashboard />} path="marketplace" />
                      <Route element={<Navigate replace to="/marketplace" />} path="catalog" />
                      <Route element={<BasketPage />} path="basket" />
                      <Route element={<ProductPage />} path="products/:slug" />
                      <Route element={<Navigate replace to="/" />} path="planner" />
                      <Route element={<SearchPlanner />} path="search" />
                      <Route element={<RequireAuth />}>
                        <Route element={<CheckoutPage />} path="checkout" />
                      </Route>
                      <Route element={<RequireAuth />} path="account">
                        <Route element={<AccountPage />} index />
                        <Route element={<AccountTransactionsPage />} path="transactions" />
                        <Route element={<AccountSettingsPage />} path="settings" />
                        <Route element={<AccountInboxPage />} path="inbox" />
                      </Route>
                      <Route element={<RequireSeller />} path="seller">
                        <Route element={<SellerHubPage />} index />
                        <Route element={<SellerIngredientPage />} path="ingredients/:slug" />
                        <Route element={<SellerRoutingPage />} path="routing" />
                        <Route element={<SellerStorePage />} path="store" />
                      </Route>
                    </Route>
                    <Route element={<Navigate replace to="/" />} path="*" />
                  </Routes>
                </BuyerOrdersProvider>
              </BasketProvider>
            </SellerProvider>
          </LocationProvider>
        </AuthProvider>
      </MockDataProvider>
    </main>
  )
}

export default App
