import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/context/auth"

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`

    return <Navigate replace to={`/auth?redirect=${encodeURIComponent(redirectTo)}`} />
  }

  return <Outlet />
}

export default RequireAuth
