import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/context/auth"

function RequireSeller() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`

    return <Navigate replace to={`/auth?redirect=${encodeURIComponent(redirectTo)}`} />
  }

  if (user?.role !== "seller") {
    return <Navigate replace to="/account" />
  }

  return <Outlet />
}

export default RequireSeller
