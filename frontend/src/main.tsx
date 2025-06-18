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
import { ClientsPage } from './pages/ClientsPage'
import { DietsPage } from './pages/DietsPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { ProductsPage } from './pages/ProductsPage'

// Crear las rutas
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="diets" element={<DietsPage />} />
      <Route path="workouts" element={<WorkoutsPage />} />
      <Route path="products" element={<ProductsPage />} />
    </Route>
  )
)

// Renderizar con RouterProvider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)