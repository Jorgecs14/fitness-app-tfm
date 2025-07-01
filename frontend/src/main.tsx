import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'
import './styles/components.css'
import App from './App'
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/sign-in" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App><LandingPage /></App>,
  },
  {
    path: '/sign-in',
    element: (
      <App>
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      </App>
    ),
  },
  {
    path: '/register',
    element: (
      <App>
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      </App>
    ),
  },
  
  // RUTAS PROTEGIDAS (requieren autenticación)
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
        index: true,
        element: <HomePage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'diets',
        element: <DietsPage />,
      },
      {
        path: 'workouts',
        element: <WorkoutsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
