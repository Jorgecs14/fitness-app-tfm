/**
 * Main application entry point
 * Sets up routing for the Fitness Management System
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { 
  Route, 
  RouterProvider, 
  createBrowserRouter, 
  createRoutesFromElements 
} from 'react-router-dom'
import { Layout } from './Layout'
import { HomePage } from './pages/HomePage'
import { UsersPage } from './pages/UsersPage'
import { DietsPage } from './pages/DietsPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { ProductsPage } from './pages/ProductsPage'
import { LoginPage } from './pages/LoginPage'

// Create application routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path="/login" element={<LoginPage/>} />
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="diets" element={<DietsPage />} />
      <Route path="workouts" element={<WorkoutsPage />} />
      <Route path="products" element={<ProductsPage />} />
    </Route>
    </>
  )
)

// Render app with React Router
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)