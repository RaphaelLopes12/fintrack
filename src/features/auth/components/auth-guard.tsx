import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

function AuthGuardSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 p-8">
        <Skeleton className="mx-auto h-10 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

export function AuthGuard() {
  const { isLoading, isAuthenticated, initialize } = useAuth()

  useEffect(() => {
    const unsubscribe = initialize()
    return unsubscribe
  }, [initialize])

  if (isLoading) {
    return <AuthGuardSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
