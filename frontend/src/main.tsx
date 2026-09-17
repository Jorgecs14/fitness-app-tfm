/**
 * Punto de entrada principal de la aplicación fitness-app-tfm
 * Configura el enrutamiento con React Router, protección de rutas y autenticación con Supabase
 */

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'
import './styles/components.css'
import './styles/liquid-glass.css'
import App from './App'
import { supabase } from './lib/supabase'
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Navigate
} from 'react-router-dom'
import { DashboardLayout } from './layouts/dashboard'
import { AuthLayout } from './layouts/auth'
import { HomePage } from './pages/HomePage'
import { UsersPage } from './pages/UsersPage'
import { DietsPage } from './pages/DietsPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { LandingPage } from './pages/LandingPage'
import { UserDetailPage } from './pages/UserDetailPage'
import ClientMedicalInfoPage from './pages/ClientMedicalInfoPage'
import ProgressPage from './pages/ProgressPage'
import ClientHomePage from './pages/ClientHomePage'
import ClientMyDietPage from './pages/ClientMyDietPage'
import ClientProgressSubmitPage from './pages/ClientProgressSubmitPage'
import CrmPage from './pages/CrmPage'
import TrainerBillingPage from './pages/TrainerBillingPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth_token')
  return token ? <>{children}</> : <Navigate to='/sign-in' replace />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <App>
        <LandingPage />
      </App>
    )
  },
  {
    path: '/sign-in',
    element: (
      <App>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </App>
    )
  },
  {
    path: '/register',
    element: (
      <App>
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      </App>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <App>
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        </App>
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Navigate to='/dashboard/home' replace />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'client-home',
        element: <ClientHomePage />
      },
      {
        path: 'client-diet',
        element: <ClientMyDietPage />
      },
      {
        path: 'submit-progress',
        element: <ClientProgressSubmitPage />
      },
      {
        path: 'client-tracking',
        element: <ClientTrackingPage />
      },
      {
        path: 'crm',
        element: <CrmPage />
      },
      {
        path: 'progress',
        element: <ProgressPage />
      },
      {
        path: 'users',
        element: <UsersPage />
      },
      {
        path: 'users/:id',
        element: <UserDetailPage />
      },
      {
        path: 'users/:userId/medical-info',
        element: <ClientMedicalInfoPage />
      },
      {
        path: 'products',
        element: <ProductsPage />
      },
      {
        path: 'diets',
        element: <DietsPage />
      },
      {
        path: 'workouts',
        element: <WorkoutsPage />
      },
      {
        path: 'billing',
        element: <TrainerBillingPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
