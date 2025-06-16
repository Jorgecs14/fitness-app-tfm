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
import { ProductsPage } from './pages/ProductsPage'

// Crear las rutas
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="clients" element={<ClientsPage />} />
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