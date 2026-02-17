import { createBrowserRouter } from 'react-router'
import { AuthGuard } from '@/features/auth/components/auth-guard'
import { AppLayout } from '@/components/layout/app-layout'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    lazy: () => import('@/routes/login'),
  },
  {
    path: '/register',
    lazy: () => import('@/routes/register'),
  },
  {
    path: '/auth/callback',
    lazy: () => import('@/routes/auth-callback'),
  },

  // Protected routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            lazy: () => import('@/routes/dashboard'),
          },
          {
            path: '/transactions',
            lazy: () => import('@/routes/transactions'),
          },
          {
            path: '/transactions/new',
            lazy: () => import('@/routes/transaction-new'),
          },
          {
            path: '/transactions/:id/edit',
            lazy: () => import('@/routes/transaction-edit'),
          },
          {
            path: '/credit-cards',
            lazy: () => import('@/routes/credit-cards'),
          },
          {
            path: '/credit-cards/:id',
            lazy: () => import('@/routes/credit-card-detail'),
          },
          {
            path: '/settings',
            lazy: () => import('@/routes/settings'),
          },
        ],
      },
    ],
  },

  // 404
  {
    path: '*',
    lazy: () => import('@/routes/not-found'),
  },
])
