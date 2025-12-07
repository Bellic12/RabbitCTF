import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

type ProtectedRouteProps = {
  requiredRole?: number
}

export const ADMIN_ROLE_ID = 1

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role_id !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
