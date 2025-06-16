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

// Crear las rutas
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="diets" element={<DietsPage />} />
    </Route>
  )
)

// Renderizar con RouterProvider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)